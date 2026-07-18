import { afterEach, describe, expect, it, vi } from "vitest";

const clingenRestFetch = vi.hoisted(() => vi.fn());
vi.mock("./http", () => ({ clingenRestFetch }));

import { createClingenApiFetch } from "./api-adapter";

/**
 * The contract under test (hardening doc 09):
 *
 * The host proxy (`@bio-mcp/shared` tools/api-proxy) marks a Code Mode call
 * failed — setting `__api_error` — ONLY when `apiFetch` THROWS. It hands back
 * `result.data` without ever consulting `result.status`. So an adapter that
 * RETURNS `{status: 502, data: {error}}` reports a dead upstream to the isolate
 * as ordinary data: the program reads `.curations`, gets undefined, and answers
 * "no results found" for a database that was merely down — carrying a
 * `_meta.citation` that attests to the emptiness.
 *
 * clingen was the fleet's only adapter doing this. These tests pin the fix:
 * upstream failures and bad paths THROW; a true negative about the EMBEDDED
 * dataset still returns data (throwing there would break a legitimate program
 * iterating over genes).
 */

function httpResponse(status: number, body: unknown, contentType = "application/json") {
	return {
		ok: status >= 200 && status < 300,
		status,
		statusText: `HTTP ${status}`,
		headers: { get: (h: string) => (h.toLowerCase() === "content-type" ? contentType : null) },
		json: async () => body,
		text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
	};
}

afterEach(() => {
	vi.restoreAllMocks();
	clingenRestFetch.mockReset();
});

describe("createClingenApiFetch — upstream failures must throw, not become data", () => {
	it("throws when the erepo upstream returns 500", async () => {
		clingenRestFetch.mockResolvedValue(httpResponse(500, "upstream exploded"));
		const apiFetch = createClingenApiFetch();

		// Pre-fix this RESOLVED to {status:500, data:{error}} — a silent failure.
		await expect(apiFetch({ method: "GET", path: "/erepo/classifications" })).rejects.toThrow(/HTTP 500/);
	});

	it("attaches the upstream status to the thrown error (not a blanket 502)", async () => {
		clingenRestFetch.mockResolvedValue(httpResponse(503, "maintenance"));
		const apiFetch = createClingenApiFetch();

		// The handler throws from inside its own try; without the isApiError guard
		// its catch would re-wrap this as a generic 502 and lose the real status.
		await expect(apiFetch({ method: "GET", path: "/erepo/classifications" })).rejects.toMatchObject({
			status: 503,
		});
	});

	it("throws when the erepo request itself fails (network error)", async () => {
		clingenRestFetch.mockRejectedValue(new Error("connection reset"));
		const apiFetch = createClingenApiFetch();

		await expect(apiFetch({ method: "GET", path: "/erepo/classifications" })).rejects.toMatchObject({
			status: 502,
		});
	});

	it("throws when the G2P upstream returns 500", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(httpResponse(500, "EBI down")),
		);
		const apiFetch = createClingenApiFetch();

		await expect(apiFetch({ method: "GET", path: "/g2p/gene/BRCA1" })).rejects.toThrow(/HTTP 500/);
	});

	it("throws on an unrouted path instead of returning the error as data", async () => {
		const apiFetch = createClingenApiFetch();

		await expect(apiFetch({ method: "GET", path: "/validity/nonexistent" })).rejects.toThrow(
			/Unknown validity path/,
		);
	});
});

describe("createClingenApiFetch — what must NOT change", () => {
	it("returns data on a successful erepo call", async () => {
		clingenRestFetch.mockResolvedValue(httpResponse(200, { total: 2 }));
		const apiFetch = createClingenApiFetch();

		const result = await apiFetch({ method: "GET", path: "/erepo/classifications" });
		expect(result).toEqual({ status: 200, data: { total: 2 } });
	});

	it("still RETURNS a true negative about the embedded dataset (does not throw)", async () => {
		const apiFetch = createClingenApiFetch();

		// "This gene has no curations in our static data" is an ANSWER, not a
		// failure. Throwing here would break a program looping over a gene list.
		const result = await apiFetch({
			method: "GET",
			path: "/validity/curations/NOTAREALGENE123",
		});
		expect(result.status).toBe(404);
		expect(result.data).toMatchObject({ error: expect.stringContaining("No gene-disease") });
	});

	it("serves the embedded validity dataset without touching an upstream", async () => {
		const apiFetch = createClingenApiFetch();

		const result = await apiFetch({ method: "GET", path: "/validity/classifications" });
		expect(result.status).toBe(200);
		expect(clingenRestFetch).not.toHaveBeenCalled();
	});
});
