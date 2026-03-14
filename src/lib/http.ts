/**
 * ClinGen API HTTP clients.
 *
 * Two distinct APIs:
 * 1. Gene Validity (GCI) GraphQL — genegraph.clinicalgenome.org/graphql
 * 2. Variant Curation Repository REST — erepo.clinicalgenome.org/evrepo/api
 */

import { restFetch, type RestFetchOptions } from "@bio-mcp/shared/http/rest-fetch";

const CLINGEN_GRAPHQL_URL = "https://genegraph.clinicalgenome.org/graphql";
const CLINGEN_EVREPO_BASE = "https://erepo.clinicalgenome.org/evrepo/api";

/* ---------- GraphQL (Gene Validity / Dosage) ---------- */

export interface ClingenGraphqlOptions {
	/** Request timeout in ms (default 30s) */
	timeout?: number;
	/** Number of retries (default 3) */
	retries?: number;
}

/**
 * Execute a GraphQL query against the ClinGen Genegraph API.
 * Returns the parsed JSON response (caller should check for `errors` field).
 */
export async function clingenGraphqlFetch(
	query: string,
	variables?: Record<string, unknown>,
	opts?: ClingenGraphqlOptions,
): Promise<unknown> {
	const timeout = opts?.timeout ?? 30_000;
	const retries = opts?.retries ?? 3;

	const body = JSON.stringify({ query, variables: variables ?? {} });

	let lastError: Error | undefined;
	for (let attempt = 0; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(CLINGEN_GRAPHQL_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"User-Agent":
						"clingen-mcp-server/1.0 (bio-mcp; https://github.com/QuentinCody/clingen-mcp-server)",
				},
				body,
				signal: controller.signal,
			});
			clearTimeout(timer);

			if (!response.ok) {
				const errText = await response.text().catch(() => response.statusText);
				const shouldRetry = [429, 500, 502, 503].includes(response.status);
				if (shouldRetry && attempt < retries) {
					lastError = new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
					await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000)));
					continue;
				}
				throw new Error(`HTTP ${response.status}: ${errText.slice(0, 500)}`);
			}

			return await response.json();
		} catch (err) {
			clearTimeout(timer);
			if (attempt < retries && (err as Error).name === "AbortError") {
				lastError = err as Error;
				continue;
			}
			throw err;
		}
	}

	throw lastError ?? new Error("GraphQL request failed after retries");
}

/* ---------- REST (Variant Curation Repository) ---------- */

export interface ClingenRestOptions extends Omit<RestFetchOptions, "retryOn"> {}

/**
 * Fetch from the ClinGen Evidence Repository REST API.
 * Base URL: https://erepo.clinicalgenome.org/evrepo/api
 */
export async function clingenRestFetch(
	path: string,
	params?: Record<string, unknown>,
	opts?: ClingenRestOptions,
): Promise<Response> {
	const headers: Record<string, string> = {
		Accept: "application/json",
		...(opts?.headers ?? {}),
	};

	return restFetch(CLINGEN_EVREPO_BASE, path, params, {
		...opts,
		headers,
		retryOn: [429, 500, 502, 503],
		retries: opts?.retries ?? 3,
		timeout: opts?.timeout ?? 30_000,
		userAgent:
			"clingen-mcp-server/1.0 (bio-mcp; https://github.com/QuentinCody/clingen-mcp-server)",
	});
}
