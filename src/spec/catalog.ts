/**
 * ClinGen API catalog — hand-built from ClinGen documentation.
 *
 * Covers endpoints across gene-disease validity, dosage sensitivity,
 * clinical actionability, and variant curation.
 *
 * Two base URLs:
 * - search.clinicalgenome.org/kb — gene validity, actionability, variant curations
 * - dosage.clinicalgenome.org/api — haploinsufficiency/triplosensitivity scores
 *
 * Paths starting with /dosage are routed to dosage.clinicalgenome.org/api.
 * All other paths are routed to search.clinicalgenome.org/kb.
 */

import type { ApiCatalog } from "@bio-mcp/shared/codemode/catalog";

export const clingenCatalog: ApiCatalog = {
	name: "ClinGen",
	baseUrl: "https://search.clinicalgenome.org/kb",
	version: "1.0",
	auth: "none",
	endpointCount: 17,
	notes:
		"- Two base URLs: search.clinicalgenome.org/kb (validity, actionability, variants) and dosage.clinicalgenome.org/api (dosage sensitivity)\n" +
		"- Paths starting with /dosage are auto-routed to the dosage API base URL\n" +
		"- Gene-Disease Validity classifications: Definitive, Strong, Moderate, Limited, Disputed, Refuted, No Known Disease Relationship\n" +
		"- Haploinsufficiency (HI) scores: 0=No Evidence, 1=Little Evidence, 2=Emerging Evidence, 3=Sufficient Evidence, 40=Autosomal Recessive\n" +
		"- Triplosensitivity (TS) scores: 0=No Evidence, 1=Little Evidence, 2=Emerging Evidence, 3=Sufficient Evidence, 40=Autosomal Recessive\n" +
		"- Mode of Inheritance (MOI): Autosomal Dominant (AD), Autosomal Recessive (AR), X-Linked (XL), etc.\n" +
		"- Most endpoints return JSON with results arrays and pagination metadata\n" +
		"- Gene symbols should be HGNC-approved (e.g., BRCA1, TP53, SCN1A)\n" +
		"- Disease identifiers use MONDO IDs (e.g., MONDO:0007254) or free-text names",
	endpoints: [
		// === Gene-Disease Validity ===
		{
			method: "GET",
			path: "/gene-validity",
			summary:
				"Search all gene-disease validity classifications. Returns curated gene-disease relationships with evidence levels.",
			category: "gene-validity",
			queryParams: [
				{
					name: "search",
					type: "string",
					required: false,
					description:
						"Free-text search across gene symbols, disease names, and ClinGen group names",
				},
				{
					name: "gene_symbol",
					type: "string",
					required: false,
					description: "Filter by HGNC gene symbol (e.g., BRCA1, SCN1A)",
				},
				{
					name: "disease",
					type: "string",
					required: false,
					description:
						"Filter by disease name or MONDO ID (e.g., MONDO:0007254)",
				},
				{
					name: "classification",
					type: "string",
					required: false,
					description: "Filter by classification level",
					enum: [
						"Definitive",
						"Strong",
						"Moderate",
						"Limited",
						"Disputed",
						"Refuted",
						"No Known Disease Relationship",
					],
				},
				{
					name: "moi",
					type: "string",
					required: false,
					description: "Filter by mode of inheritance",
					enum: ["AD", "AR", "XL", "XLD", "XLR", "MT", "SD", "Other"],
				},
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number for pagination (1-based)",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description:
						"Number of results per page (default 25, max 100)",
				},
			],
		},
		{
			method: "GET",
			path: "/gene-validity/{gene_symbol}",
			summary:
				"Get all gene-disease validity classifications for a specific gene. Returns all curated disease associations for the gene.",
			category: "gene-validity",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description:
						"HGNC gene symbol (e.g., BRCA1, TP53, SCN1A)",
				},
			],
		},
		{
			method: "GET",
			path: "/gene-validity/summary",
			summary:
				"Get summary statistics for gene-disease validity classifications. Returns counts by classification level and mode of inheritance.",
			category: "gene-validity",
		},
		{
			method: "GET",
			path: "/gene-validity/{gene_symbol}/{disease_id}",
			summary:
				"Get the specific gene-disease validity classification for a gene-disease pair.",
			category: "gene-validity",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description: "HGNC gene symbol",
				},
				{
					name: "disease_id",
					type: "string",
					required: true,
					description:
						"MONDO disease ID (e.g., MONDO:0007254) or disease name slug",
				},
			],
		},

		// === Dosage Sensitivity ===
		{
			method: "GET",
			path: "/dosage/gene/{gene_symbol}",
			summary:
				"Get dosage sensitivity scores (haploinsufficiency and triplosensitivity) for a specific gene.",
			category: "dosage",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description: "HGNC gene symbol (e.g., BRCA1, MYC)",
				},
			],
		},
		{
			method: "GET",
			path: "/dosage/region/{region}",
			summary:
				"Get dosage sensitivity data for a chromosomal region. Returns genes and regions with HI/TS scores in the specified genomic interval.",
			category: "dosage",
			pathParams: [
				{
					name: "region",
					type: "string",
					required: true,
					description:
						"Chromosomal region in format chr:start-end (e.g., 1:1000000-2000000, 17:41196312-41277500)",
				},
			],
		},
		{
			method: "GET",
			path: "/dosage/search",
			summary:
				"Search dosage sensitivity records by gene symbol, region, or free text. Returns HI and TS scores with evidence levels.",
			category: "dosage",
			queryParams: [
				{
					name: "search",
					type: "string",
					required: false,
					description:
						"Free-text search across gene symbols, region names, and ISCA IDs",
				},
				{
					name: "haplo_score",
					type: "number",
					required: false,
					description:
						"Filter by haploinsufficiency score (0, 1, 2, 3, or 40 for AR)",
				},
				{
					name: "triplo_score",
					type: "number",
					required: false,
					description:
						"Filter by triplosensitivity score (0, 1, 2, 3, or 40 for AR)",
				},
				{
					name: "type",
					type: "string",
					required: false,
					description: "Filter by entity type",
					enum: ["gene", "region"],
				},
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number for pagination",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description: "Results per page (default 25)",
				},
			],
		},
		{
			method: "GET",
			path: "/dosage/summary",
			summary:
				"Get summary statistics for dosage sensitivity curations. Returns counts by HI/TS score levels.",
			category: "dosage",
		},
		{
			method: "GET",
			path: "/dosage/genes",
			summary:
				"List all genes with dosage sensitivity curations. Returns gene symbols with their HI and TS scores.",
			category: "dosage",
			queryParams: [
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description: "Results per page",
				},
			],
		},
		{
			method: "GET",
			path: "/dosage/regions",
			summary:
				"List all curated genomic regions with dosage sensitivity data. Includes CNV regions with HI/TS assessments.",
			category: "dosage",
			queryParams: [
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description: "Results per page",
				},
			],
		},

		// === Clinical Actionability ===
		{
			method: "GET",
			path: "/actionability",
			summary:
				"Search clinical actionability summaries. Returns gene-disease pairs scored for clinical actionability with intervention/outcome data.",
			category: "actionability",
			queryParams: [
				{
					name: "search",
					type: "string",
					required: false,
					description:
						"Free-text search across gene symbols and disease names",
				},
				{
					name: "gene_symbol",
					type: "string",
					required: false,
					description: "Filter by gene symbol",
				},
				{
					name: "disease",
					type: "string",
					required: false,
					description: "Filter by disease name or MONDO ID",
				},
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description: "Results per page",
				},
			],
		},
		{
			method: "GET",
			path: "/actionability/{gene_symbol}",
			summary:
				"Get clinical actionability data for a specific gene. Returns all actionability-scored disease associations.",
			category: "actionability",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description: "HGNC gene symbol",
				},
			],
		},

		// === Variant Curation ===
		{
			method: "GET",
			path: "/variant-pathogenicity",
			summary:
				"Search variant pathogenicity classifications from ClinGen Variant Curation Expert Panels (VCEPs).",
			category: "variant",
			queryParams: [
				{
					name: "search",
					type: "string",
					required: false,
					description:
						"Free-text search across variant IDs, gene symbols, and classifications",
				},
				{
					name: "gene_symbol",
					type: "string",
					required: false,
					description: "Filter by gene symbol",
				},
				{
					name: "pathogenicity",
					type: "string",
					required: false,
					description: "Filter by pathogenicity classification",
					enum: [
						"Pathogenic",
						"Likely Pathogenic",
						"Uncertain Significance",
						"Likely Benign",
						"Benign",
					],
				},
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description: "Results per page",
				},
			],
		},
		{
			method: "GET",
			path: "/variant-pathogenicity/{variant_id}",
			summary:
				"Get pathogenicity classification details for a specific variant. Includes ACMG/AMP criteria applied.",
			category: "variant",
			pathParams: [
				{
					name: "variant_id",
					type: "string",
					required: true,
					description:
						"ClinVar variant ID, ClinGen allele ID, or HGVS expression",
				},
			],
		},

		// === Gene Lookup / Summary ===
		{
			method: "GET",
			path: "/genes/{gene_symbol}",
			summary:
				"Get a comprehensive ClinGen summary for a gene. Aggregates gene validity, dosage sensitivity, actionability, and variant curation data in one response.",
			category: "gene-validity",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description: "HGNC gene symbol (e.g., BRCA1, SCN1A)",
				},
			],
		},

		// === Expert Panels / Working Groups ===
		{
			method: "GET",
			path: "/groups",
			summary:
				"List ClinGen Expert Panels and Working Groups. Returns group names, types, and the genes/diseases they curate.",
			category: "gene-validity",
			queryParams: [
				{
					name: "search",
					type: "string",
					required: false,
					description: "Search by group name",
				},
				{
					name: "type",
					type: "string",
					required: false,
					description: "Filter by group type",
					enum: [
						"Gene Curation Expert Panel",
						"Variant Curation Expert Panel",
						"Dosage Sensitivity Curation",
						"Actionability Working Group",
					],
				},
				{
					name: "page",
					type: "number",
					required: false,
					description: "Page number",
				},
				{
					name: "limit",
					type: "number",
					required: false,
					description: "Results per page",
				},
			],
		},
		{
			method: "GET",
			path: "/groups/{group_id}",
			summary:
				"Get details for a specific ClinGen Expert Panel or Working Group, including curated genes and diseases.",
			category: "gene-validity",
			pathParams: [
				{
					name: "group_id",
					type: "string",
					required: true,
					description: "ClinGen group identifier",
				},
			],
		},
	],
};
