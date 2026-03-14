/**
 * ClingenDataDO — Durable Object for staging large ClinGen responses.
 *
 * Extends RestStagingDO with schema hints for:
 * - GraphQL gene-validity curations (from genegraph.clinicalgenome.org/graphql)
 * - GraphQL dosage sensitivity data
 * - REST variant classifications (from erepo.clinicalgenome.org/evrepo/api)
 */

import { RestStagingDO } from "@bio-mcp/shared/staging/rest-staging-do";
import type { SchemaHints } from "@bio-mcp/shared/staging/schema-inference";

export class ClingenDataDO extends RestStagingDO {
	protected getSchemaHints(data: unknown): SchemaHints | undefined {
		if (!data || typeof data !== "object") return undefined;

		const obj = data as Record<string, unknown>;

		// --- GraphQL response shape: { data: { <query>: [...] } } ---
		if (obj.data && typeof obj.data === "object") {
			const gqlData = obj.data as Record<string, unknown>;

			// gene_validity_curations query
			if (Array.isArray(gqlData.gene_validity_curations)) {
				return {
					tableName: "gene_validity_curations",
					indexes: ["classification_label", "gene_label", "disease_label"],
				};
			}

			// gene_dosage query
			if (Array.isArray(gqlData.gene_dosage)) {
				return {
					tableName: "gene_dosage",
					indexes: ["gene_label", "haplo_score", "triplo_score"],
				};
			}

			// gene query (single gene with assertions)
			if (gqlData.gene && typeof gqlData.gene === "object") {
				const gene = gqlData.gene as Record<string, unknown>;
				if (Array.isArray(gene.gene_validity_assertions)) {
					return {
						tableName: "gene_validity_assertions",
						indexes: ["classification_label", "disease_label"],
					};
				}
			}
		}

		// --- REST erepo: { variantInterpretations: [...], @context: "..." } ---
		// From /classifications endpoint. Each item has: gene (obj), condition (obj),
		// guidelines[] (child table with outcome obj → outcome_label, outcome_@id),
		// agents[] (grandchild), evidenceLinks[], warnings[].
		if (Array.isArray(obj.variantInterpretations) && obj.variantInterpretations.length > 0) {
			const sample = obj.variantInterpretations[0];
			if (sample && typeof sample === "object" && "guidelines" in sample) {
				return {
					tableName: "variantinterpretations",
					indexes: ["gene_label", "condition_label", "variationId", "caid", "uuid", "publishedDate"],
					compositeIndexes: [["gene_label", "condition_label"]],
					// Allow grandchild extraction (agents inside guidelines)
					maxRecursionDepth: 3,
				};
			}
		}

		// --- REST response: array of variant classifications ---
		if (Array.isArray(data)) {
			const sample = data[0];
			if (sample && typeof sample === "object") {
				// Variant classification records from erepo
				if (
					"classification" in sample &&
					("gene_symbol" in sample || "variation" in sample || "guideline_shortname" in sample)
				) {
					return {
						tableName: "variant_classifications",
						indexes: ["classification", "gene_symbol", "disease"],
					};
				}
			}
		}

		// --- REST wrapped responses (e.g., { results: [...] }) ---
		if (Array.isArray(obj.results) && obj.results.length > 0) {
			const sample = obj.results[0];
			if (sample && typeof sample === "object") {
				if ("classification" in sample && ("gene_symbol" in sample || "variation" in sample)) {
					return {
						tableName: "variant_classifications",
						indexes: ["classification", "gene_symbol"],
					};
				}
			}
		}

		return undefined;
	}
}
