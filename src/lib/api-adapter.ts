/**
 * ClinGen API adapter — routes requests by path prefix to the appropriate data source.
 *
 * /validity/*  — Served from embedded gene-disease validity static data
 * /dosage/*    — Served from embedded dosage sensitivity static data
 * /erepo/*     — Proxied to erepo.clinicalgenome.org/evrepo/api (variant classifications)
 * /g2p/*       — Proxied to www.ebi.ac.uk/gene2phenotype/api (gene-disease associations)
 *
 * This is a multi-API adapter: static embedded data for gene-disease validity and dosage
 * sensitivity (since the ClinGen GraphQL endpoint is down as of 2026-03), plus live REST
 * proxy for variant curation from the Evidence Repository and Gene2Phenotype from EBI.
 */

import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import {
	dosageSensitivityEntries,
	filterDosageSensitivity,
	findDosageSensitivity,
} from "./data/dosage-sensitivity";
import {
	filterGeneValidityCurations,
	findGeneValidityCurations,
	geneValidityCurations,
} from "./data/gene-validity";
import { clingenRestFetch } from "./http";

/**
 * Build a synthetic JSON response from data.
 */
function jsonResponse(data: unknown, status = 200): { status: number; data: unknown } {
	return { status, data };
}

/**
 * Build an error response.
 *
 * ONLY for a true negative that is itself an answer — e.g. "this gene has no
 * curations in the embedded dataset". For an upstream failure or a bad path use
 * {@link throwApiError}: the host proxy marks a call failed only when apiFetch
 * THROWS, so anything returned here reaches the isolate as ordinary data.
 */
function errorResponse(message: string, status = 404): { status: number; data: unknown } {
	return { status, data: { error: message } };
}

/**
 * Fail the call the way the rest of the fleet does — by throwing.
 *
 * The host proxy (`@bio-mcp/shared` tools/api-proxy) sets `__api_error` in its
 * CATCH block; a returned `{status, data}` is passed through as `result.data`
 * without ever consulting `status`. So an upstream 500 that is *returned* is
 * indistinguishable from real data: the isolate receives `{error: "..."}`,
 * `result.curations` is undefined, and the program reports "no results found"
 * for a database that was simply down — with a `_meta.citation` attesting it.
 *
 * Mirrors the ensembl adapter (the fleet's reference REST adapter), which
 * attaches status/data to the Error and throws.
 */
function throwApiError(message: string, status: number, data?: unknown): never {
	const error = new Error(message) as Error & { status: number; data: unknown };
	error.status = status;
	error.data = data ?? { error: message };
	throw error;
}

/**
 * True for an error already shaped by {@link throwApiError}.
 *
 * The handlers below throw from INSIDE their own `try`, so without this their
 * `catch` would immediately re-wrap an HTTP-status error as a generic 502 —
 * losing the upstream status and, before this change, turning it back into
 * returned data.
 */
function isApiError(err: unknown): err is Error & { status: number; data: unknown } {
	return err instanceof Error && typeof (err as { status?: unknown }).status === "number";
}

/* ---------- Gene-Disease Validity (static) ---------- */

function handleValidity(
	path: string,
	params?: Record<string, unknown>,
): { status: number; data: unknown } {
	// GET /validity/curations — list all (with optional filters)
	if (path === "/validity/curations") {
		const filters: {
			gene?: string;
			classification?: string;
			disease?: string;
			mode_of_inheritance?: string;
			search?: string;
		} = {};
		if (params?.gene) filters.gene = String(params.gene);
		if (params?.classification) filters.classification = String(params.classification);
		if (params?.disease) filters.disease = String(params.disease);
		if (params?.mode_of_inheritance)
			filters.mode_of_inheritance = String(params.mode_of_inheritance);
		if (params?.search || params?.q) filters.search = String(params?.search || params?.q);

		const results = filterGeneValidityCurations(
			Object.keys(filters).length > 0 ? filters : undefined,
		);
		return jsonResponse({
			total: results.length,
			source: "ClinGen Gene-Disease Validity curations (embedded static data, 2026-03)",
			curations: results,
		});
	}

	// GET /validity/curations/{gene_symbol} — get curations for a specific gene
	const geneMatch = path.match(/^\/validity\/curations\/(.+)$/);
	if (geneMatch) {
		const geneSymbol = decodeURIComponent(geneMatch[1]).toUpperCase();
		const results = findGeneValidityCurations(geneSymbol);
		if (results.length > 0) {
			return jsonResponse({
				gene_symbol: geneSymbol,
				total: results.length,
				curations: results,
			});
		}
		return errorResponse(
			`No gene-disease validity curations found for gene: ${geneSymbol}. ` +
				`This embedded dataset contains ${geneValidityCurations.length} curations for high-value genes. ` +
				"For a complete list, use GET /validity/curations.",
		);
	}

	// GET /validity/classifications — list available classification levels with counts
	if (path === "/validity/classifications") {
		const classifications: Record<string, number> = {};
		for (const c of geneValidityCurations) {
			classifications[c.classification] = (classifications[c.classification] || 0) + 1;
		}
		return jsonResponse({ classifications });
	}

	// GET /validity/gceps — list Gene Curation Expert Panels with counts
	if (path === "/validity/gceps") {
		const gceps: Record<string, number> = {};
		for (const c of geneValidityCurations) {
			gceps[c.gcep] = (gceps[c.gcep] || 0) + 1;
		}
		return jsonResponse({ gceps });
	}

	throwApiError(`Unknown validity path: ${path}`, 404);
}

/* ---------- Dosage Sensitivity (static) ---------- */

function handleDosage(
	path: string,
	params?: Record<string, unknown>,
): { status: number; data: unknown } {
	// GET /dosage/genes — list all dosage sensitivity data (with optional filters)
	if (path === "/dosage/genes") {
		const filters: {
			gene?: string;
			hi_score?: number;
			ts_score?: number;
			search?: string;
		} = {};
		if (params?.gene) filters.gene = String(params.gene);
		if (params?.hi_score !== undefined) filters.hi_score = Number(params.hi_score);
		if (params?.ts_score !== undefined) filters.ts_score = Number(params.ts_score);
		if (params?.search || params?.q) filters.search = String(params?.search || params?.q);

		const results = filterDosageSensitivity(
			Object.keys(filters).length > 0 ? filters : undefined,
		);
		return jsonResponse({
			total: results.length,
			source: "ClinGen Dosage Sensitivity curations (embedded static data, 2026-03)",
			hi_score_legend: {
				0: "No evidence for haploinsufficiency",
				1: "Little evidence for haploinsufficiency",
				2: "Some evidence for haploinsufficiency (emerging)",
				3: "Sufficient evidence for haploinsufficiency",
				40: "Autosomal recessive (gene dosage sensitivity unlikely)",
			},
			ts_score_legend: {
				0: "No evidence for triplosensitivity",
				1: "Little evidence for triplosensitivity",
				2: "Some evidence for triplosensitivity (emerging)",
				3: "Sufficient evidence for triplosensitivity",
				40: "Autosomal recessive (gene dosage sensitivity unlikely)",
			},
			genes: results,
		});
	}

	// GET /dosage/genes/{gene_symbol} — get dosage sensitivity for a specific gene
	const geneMatch = path.match(/^\/dosage\/genes\/(.+)$/);
	if (geneMatch) {
		const geneSymbol = decodeURIComponent(geneMatch[1]).toUpperCase();
		const result = findDosageSensitivity(geneSymbol);
		if (result) {
			return jsonResponse(result);
		}
		return errorResponse(
			`No dosage sensitivity data found for gene: ${geneSymbol}. ` +
				`This embedded dataset contains ${dosageSensitivityEntries.length} genes. ` +
				"For a complete list, use GET /dosage/genes.",
		);
	}

	throwApiError(`Unknown dosage path: ${path}`, 404);
}

/* ---------- Evidence Repository REST (live proxy) ---------- */

async function handleErepo(
	path: string,
	params?: Record<string, unknown>,
): Promise<{ status: number; data: unknown }> {
	// Strip the /erepo prefix to get the actual API path
	const apiPath = path.replace(/^\/erepo/, "");

	try {
		const response = await clingenRestFetch(apiPath, params);

		if (!response.ok) {
			let errorBody: string;
			try {
				errorBody = await response.text();
			} catch {
				errorBody = response.statusText;
			}
			throwApiError(
				`ClinGen erepo API error: HTTP ${response.status}: ${errorBody.slice(0, 200)}`,
				response.status,
				errorBody,
			);
		}

		const contentType = response.headers.get("content-type") || "";
		if (!contentType.includes("json")) {
			const text = await response.text();
			return { status: response.status, data: text };
		}

		const data = await response.json();
		return { status: response.status, data };
	} catch (err) {
		if (isApiError(err)) throw err;
		const msg = err instanceof Error ? err.message : String(err);
		throwApiError(`ClinGen erepo API request failed: ${msg}`, 502);
	}
}

/* ---------- Gene2Phenotype (live proxy via EBI) ---------- */

const G2P_BASE_URL = "https://www.ebi.ac.uk/gene2phenotype/api";

async function handleG2P(
	path: string,
	params?: Record<string, unknown>,
): Promise<{ status: number; data: unknown }> {
	try {
		let url: string;

		// /g2p/gene/{symbol} → GET /gene/{symbol}/
		const geneMatch = path.match(/^\/g2p\/gene\/(.+)$/);
		if (geneMatch) {
			const symbol = encodeURIComponent(geneMatch[1]);
			url = `${G2P_BASE_URL}/gene/${symbol}/`;
		}
		// /g2p/panel/{name} → GET /panel/{name}/
		else if (path.match(/^\/g2p\/panel\/(.+)$/)) {
			const panelMatch = path.match(/^\/g2p\/panel\/(.+)$/);
			const name = encodeURIComponent(panelMatch![1]);
			url = `${G2P_BASE_URL}/panel/${name}/`;
		}
		// /g2p/search?query=X → GET /search/?query=X
		else if (path === "/g2p/search") {
			const query = params?.query ? String(params.query) : "";
			url = `${G2P_BASE_URL}/search/?query=${encodeURIComponent(query)}`;
		} else {
			throwApiError(`Unknown G2P path: ${path}`, 404);
		}

		const response = await fetch(url, {
			headers: { Accept: "application/json" },
		});

		if (!response.ok) {
			let errorBody: string;
			try {
				errorBody = await response.text();
			} catch {
				errorBody = response.statusText;
			}
			throwApiError(
				`G2P API error: HTTP ${response.status}: ${errorBody.slice(0, 200)}`,
				response.status,
				errorBody,
			);
		}

		const contentType = response.headers.get("content-type") || "";
		if (!contentType.includes("json")) {
			const text = await response.text();
			return { status: response.status, data: text };
		}

		const data = await response.json();
		return { status: response.status, data };
	} catch (err) {
		if (isApiError(err)) throw err;
		const msg = err instanceof Error ? err.message : String(err);
		throwApiError(`G2P API request failed: ${msg}`, 502);
	}
}

/**
 * Create an ApiFetchFn that routes based on path prefix:
 * - /validity/*  -> embedded static gene-disease validity data
 * - /dosage/*    -> embedded static dosage sensitivity data
 * - /erepo/*     -> proxied to ClinGen Evidence Repository REST API
 * - /g2p/*       -> proxied to EBI Gene2Phenotype REST API
 * - (legacy) /classifications, /interpretations -> direct erepo proxy
 */
export function createClingenApiFetch(): ApiFetchFn {
	return async (request) => {
		const { path, params } = request;

		// Static gene-disease validity data
		if (path.startsWith("/validity/") || path === "/validity") {
			return handleValidity(path, params);
		}

		// Static dosage sensitivity data
		if (path.startsWith("/dosage/") || path === "/dosage") {
			return handleDosage(path, params);
		}

		// Evidence Repository REST API (with /erepo prefix)
		if (path.startsWith("/erepo/") || path === "/erepo") {
			return handleErepo(path, params);
		}

		// Gene2Phenotype REST API (EBI)
		if (path.startsWith("/g2p/") || path === "/g2p") {
			return handleG2P(path, params);
		}
		const response = await clingenRestFetch(path, params);

		if (!response.ok) {
			let errorBody: string;
			try {
				errorBody = await response.text();
			} catch {
				errorBody = response.statusText;
			}
			const error = new Error(
				`HTTP ${response.status}: ${errorBody.slice(0, 200)}`,
			) as Error & {
				status: number;
				data: unknown;
			};
			error.status = response.status;
			error.data = errorBody;
			throw error;
		}

		const contentType = response.headers.get("content-type") || "";
		if (!contentType.includes("json")) {
			const text = await response.text();
			return { status: response.status, data: text };
		}

		const data = await response.json();
		return { status: response.status, data };
	};
}
