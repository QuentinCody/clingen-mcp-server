/**
 * ClinGen API HTTP client.
 *
 * Routes requests to two base URLs:
 * - search.clinicalgenome.org/kb — gene-disease validity, actionability, variant curations
 * - dosage.clinicalgenome.org/api — haploinsufficiency/triplosensitivity dosage data
 */

import { restFetch, type RestFetchOptions } from "@bio-mcp/shared/http/rest-fetch";

const CLINGEN_SEARCH_BASE = "https://search.clinicalgenome.org/kb";
const CLINGEN_DOSAGE_BASE = "https://dosage.clinicalgenome.org/api";

export interface ClingenFetchOptions extends Omit<RestFetchOptions, "retryOn"> {
	/** Override base URL */
	baseUrl?: string;
	/** Content type for the request */
	contentType?: string;
}

/**
 * Determine which base URL to use based on the path.
 * Paths starting with /dosage use the dosage API; all others use the search API.
 */
function resolveBaseUrl(path: string, override?: string): string {
	if (override) return override;
	if (path.startsWith("/dosage")) return CLINGEN_DOSAGE_BASE;
	return CLINGEN_SEARCH_BASE;
}

/**
 * Normalize the path for the resolved base URL.
 * For dosage endpoints, strip the leading /dosage prefix since it's already
 * part of the dosage base URL.
 */
function normalizePath(path: string, baseUrl: string): string {
	if (baseUrl === CLINGEN_DOSAGE_BASE && path.startsWith("/dosage")) {
		return path.replace(/^\/dosage/, "") || "/";
	}
	return path;
}

/**
 * Fetch from the ClinGen APIs with built-in retry handling.
 */
export async function clingenFetch(
	path: string,
	params?: Record<string, unknown>,
	opts?: ClingenFetchOptions,
): Promise<Response> {
	const baseUrl = resolveBaseUrl(path, opts?.baseUrl);
	const normalizedPath = normalizePath(path, baseUrl);
	const headers: Record<string, string> = {
		Accept: opts?.contentType ?? "application/json",
		...(opts?.headers ?? {}),
	};

	return restFetch(baseUrl, normalizedPath, params, {
		...opts,
		headers,
		retryOn: [429, 500, 502, 503],
		retries: opts?.retries ?? 3,
		timeout: opts?.timeout ?? 30_000,
		userAgent:
			"clingen-mcp-server/1.0 (bio-mcp; https://github.com/QuentinCody/clingen-mcp-server)",
	});
}

/**
 * POST to ClinGen APIs (for batch or search endpoints).
 */
export async function clingenPost(
	path: string,
	body: object,
	opts?: ClingenFetchOptions,
): Promise<Response> {
	const baseUrl = resolveBaseUrl(path, opts?.baseUrl);
	const normalizedPath = normalizePath(path, baseUrl);
	const headers: Record<string, string> = {
		"Content-Type": opts?.contentType ?? "application/json",
		Accept: "application/json",
		...(opts?.headers ?? {}),
	};

	return restFetch(baseUrl, normalizedPath, undefined, {
		...opts,
		method: "POST",
		headers,
		body,
		retryOn: [429, 500, 502, 503],
		retries: opts?.retries ?? 3,
		timeout: opts?.timeout ?? 30_000,
		userAgent: "clingen-mcp-server/1.0",
	});
}
