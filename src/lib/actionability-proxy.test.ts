import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

afterEach(() => vi.unstubAllGlobals());
const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });

it("stages the full response with its context and hash through the actual Code Mode proxy", async () => {
  const raw = { columns: ["gene", "classification", "date", "version", "evidence"], rows: [["PHEX", "Strong", "2026-03-02", "2.0.0", "α".repeat(17_000)]] };
  const stored: unknown[] = [];
  const ns = { idFromName: (name: string) => name, get: () => ({ fetch: async (request: Request) => {
    if (new URL(request.url).pathname === "/process") {
      stored.push((await request.json() as { data: unknown }).data);
      return json({ success: true, tables_created: ["records"], total_rows: 1, input_rows: 1, table_row_counts: { records: 1 } });
    }
    return json({ success: true, schema: { tables: { records: { columns: [{ name: "gene" }] } } } });
  } }) } as unknown as DurableObjectNamespace;
  vi.stubGlobal("fetch", vi.fn(async () => json(raw)));
  const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, doNamespace: ns, stagingPrefix: "clingen", maxInlineBytes: 30 * 1024 });
  const result = await proxy.handler({ method: "GET", path: "/actionability/Pediatric/summ", params: { flavor: "flat" } }, { sql: () => [] });
  expect(result).toMatchObject({ __staged: true, data_access_id: expect.any(String) });
  const canonical = JSON.parse(stored[0] as string);
  expect(canonical).toMatchObject({ raw_response: raw, context: "Pediatric", response_sha256: expect.any(String), records: [{ gene: "PHEX", classification: "Strong", date: "2026-03-02", version: "2.0.0" }] });
  expect(stored[1]).toEqual(canonical);
  expect(new TextEncoder().encode(JSON.stringify(result)).byteLength).toBeLessThan(30_000);
});

it("interpolates context using the actual catalog and propagates upstream failure markers", async () => {
  const fetcher = vi.fn<typeof fetch>(async () => new Response("maintenance", { status: 503, headers: { "retry-after": "120" } }));
  vi.stubGlobal("fetch", fetcher);
  const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
  const result = await proxy.handler({ method: "GET", path: "/actionability/{context}/assertions", params: { context: "Adult", assertion_type: "all" } }, { sql: () => [] });
  expect(result).toMatchObject({ __api_error: true, status: 503, data: { retry_after: "120" } });
  expect(fetcher.mock.calls[0][0]).toBe("https://actionability.clinicalgenome.org/ac/Adult/api/summ/assertion?assertionType=all&format=tsv");
});

it("the comparison recipe preserves adult failure and pediatric staging handle independently", async () => {
  const adult = { __api_error: true, status: 503 };
  const pediatric = { __staged: true, data_access_id: "clingen_fixture" };
  const api = { get: vi.fn(async (path: string) => path.includes("/Adult/") ? adult : pediatric) };
  const recipe = clingenCatalog.workflows!.find(recipe => recipe.title.includes("actionability"))!;
  const run = new Function("api", `return (async () => { ${recipe.code} })()`);
  expect(await run(api)).toEqual({ adult, pediatric });
});
