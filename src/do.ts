/**
 * ClingenDataDO — Durable Object for staging large ClinGen responses.
 *
 * Extends RestStagingDO with gene-validity and dosage-specific schema hints.
 */

import { RestStagingDO } from "@bio-mcp/shared/staging/rest-staging-do";
import type { SchemaHints } from "@bio-mcp/shared/staging/schema-inference";

export class ClingenDataDO extends RestStagingDO {
	protected getSchemaHints(data: unknown): SchemaHints | undefined {
		if (!data || typeof data !== "object") return undefined;

		// Gene-disease validity results — array of curations
		if (Array.isArray(data)) {
			const sample = data[0];
			if (sample && typeof sample === "object") {
				// Gene-disease validity curation records
				if ("classification" in sample && "gene" in sample && "disease" in sample) {
					return {
						tableName: "gene_validity",
						indexes: ["classification", "gene_symbol", "disease_name", "moi"],
					};
				}
				// Dosage sensitivity records
				if (
					"haploinsufficiency_score" in sample ||
					"triplosensitivity_score" in sample ||
					"haplo_score" in sample ||
					"triplo_score" in sample
				) {
					return {
						tableName: "dosage_sensitivity",
						indexes: [
							"haploinsufficiency_score",
							"triplosensitivity_score",
							"gene_symbol",
						],
					};
				}
				// Actionability records
				if ("actionability_score" in sample || "actionability_classification" in sample) {
					return {
						tableName: "actionability",
						indexes: ["gene_symbol", "disease_name", "actionability_classification"],
					};
				}
				// Variant curation records
				if ("variant_id" in sample && "pathogenicity" in sample) {
					return {
						tableName: "variant_curations",
						indexes: ["variant_id", "pathogenicity", "gene_symbol"],
					};
				}
			}
		}

		// Wrapped responses (e.g., { results: [...], total: N })
		const obj = data as Record<string, unknown>;

		if (Array.isArray(obj.results) && obj.results.length > 0) {
			const sample = obj.results[0];
			if (sample && typeof sample === "object") {
				if ("classification" in sample && "gene" in sample) {
					return {
						tableName: "gene_validity",
						indexes: ["classification", "gene_symbol", "disease_name"],
					};
				}
				if (
					"haploinsufficiency_score" in sample ||
					"triplosensitivity_score" in sample
				) {
					return {
						tableName: "dosage_sensitivity",
						indexes: [
							"haploinsufficiency_score",
							"triplosensitivity_score",
							"gene_symbol",
						],
					};
				}
			}
		}

		return undefined;
	}
}
