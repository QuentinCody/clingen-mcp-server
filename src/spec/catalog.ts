/**
 * ClinGen API catalog — multi-source: embedded static data + Evidence Repository REST API.
 *
 * Gene-Disease Validity: Embedded static data (source: search.clinicalgenome.org/kb/gene-validity)
 * Dosage Sensitivity: Embedded static data (source: search.clinicalgenome.org/kb/gene-dosage)
 * Variant Classifications: Live REST API (erepo.clinicalgenome.org/evrepo/api)
 *
 * NOTE: The ClinGen GCI GraphQL endpoint (genegraph.clinicalgenome.org/graphql) is currently
 * returning 404 (as of 2026-03). Gene-disease validity and dosage sensitivity data are now
 * served from embedded static datasets (~50 high-value gene curations). The Evidence Repository
 * REST API for variant classifications remains operational.
 *
 * In Code Mode: api.get('/validity/curations', { gene: 'BRCA1' })
 *               api.get('/dosage/genes/FBN1')
 *               api.get('/classifications', { gene: 'BRCA1', matchMode: 'exact' })
 */

import type { ApiCatalog } from "@bio-mcp/shared/codemode/catalog";

export const clingenCatalog: ApiCatalog = {
	name: "ClinGen (Gene Validity + Dosage Sensitivity + Variant Curation)",
	baseUrl: "embedded://clingen + https://erepo.clinicalgenome.org/evrepo/api",
	version: "2026.03",
	auth: "none",
	endpointCount: 8,
	notes:
		"- Multi-source adapter: /validity/* (gene-disease validity), /dosage/* (dosage sensitivity), /classifications + /interpretations (variant curation)\n" +
		"- Gene-disease validity and dosage sensitivity data is embedded static data served locally — no external API calls\n" +
		"- Variant classifications use the live ClinGen Evidence Repository REST API (erepo.clinicalgenome.org)\n" +
		"\n" +
		"== Gene-Disease Validity Classification Levels (SOP v8) ==\n" +
		"Definitive, Strong, Moderate, Limited, Disputed, Refuted\n" +
		"\n" +
		"== Dosage Sensitivity Scores ==\n" +
		"HI/TS scores: 0 (no evidence), 1 (little), 2 (some/emerging), 3 (sufficient), 40 (autosomal recessive)\n" +
		"\n" +
		"== Variant Classification Levels (ACMG/AMP) ==\n" +
		"Pathogenic, Likely Pathogenic, Uncertain Significance, Likely Benign, Benign\n" +
		"\n" +
		"== Examples ==\n" +
		"GET /validity/curations — all gene-disease validity curations\n" +
		"GET /validity/curations?gene=BRCA1 — validity curations for BRCA1\n" +
		"GET /validity/curations?classification=Definitive — all Definitive curations\n" +
		"GET /validity/curations/TP53 — validity curations for TP53\n" +
		"GET /dosage/genes — all dosage sensitivity data\n" +
		"GET /dosage/genes?hi_score=3 — genes with sufficient HI evidence\n" +
		"GET /dosage/genes/FBN1 — dosage data for FBN1\n" +
		"GET /classifications?matchMode=exact&gene=BRCA1 — variant classifications from erepo",
	endpoints: [
		// ===================================================================
		// Gene-Disease Validity — embedded static data
		// ===================================================================
		{
			method: "GET",
			path: "/validity/curations",
			summary:
				"List ClinGen gene-disease validity curations with optional filtering by gene, classification, disease, " +
				"mode of inheritance, or keyword search. Served from embedded static data (~50 high-value curations).",
			category: "validity",
			queryParams: [
				{
					name: "gene",
					type: "string",
					required: false,
					description:
						"Filter by gene symbol (e.g., BRCA1, TP53, SCN1A). Case-insensitive.",
				},
				{
					name: "classification",
					type: "string",
					required: false,
					description:
						"Filter by classification level",
					enum: ["Definitive", "Strong", "Moderate", "Limited", "Disputed", "Refuted"],
				},
				{
					name: "disease",
					type: "string",
					required: false,
					description:
						"Filter by disease name (partial match, e.g., 'breast', 'cardiomyopathy')",
				},
				{
					name: "mode_of_inheritance",
					type: "string",
					required: false,
					description: "Filter by mode of inheritance",
					enum: ["AD", "AR", "XL", "XLD", "XLR", "SD"],
				},
				{
					name: "search",
					type: "string",
					required: false,
					description:
						"Free-text search across gene symbol, disease name, GCEP name, HGNC ID, and MONDO ID",
				},
			],
			description:
				"Returns array of curations with: gene_symbol, hgnc_id, disease_name, mondo_id, classification, " +
				"mode_of_inheritance, sop_version, gcep (Gene Curation Expert Panel), report_date, report_url. " +
				"Data sourced from ClinGen Gene-Disease Validity curations (search.clinicalgenome.org/kb/gene-validity).",
		},
		{
			method: "GET",
			path: "/validity/curations/{gene_symbol}",
			summary:
				"Get gene-disease validity curations for a specific gene by symbol. " +
				"Returns all curations for that gene (a gene may have multiple disease associations).",
			category: "validity",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description:
						"HGNC gene symbol (e.g., BRCA1, TP53, MLH1, FBN1, SCN1A)",
				},
			],
			description:
				"Returns curations matching the gene symbol. A gene may have validity curations for " +
				"multiple diseases (e.g., BRCA1 for breast cancer, BRCA2 for breast cancer).",
		},

		// ===================================================================
		// Dosage Sensitivity — embedded static data
		// ===================================================================
		{
			method: "GET",
			path: "/dosage/genes",
			summary:
				"List ClinGen dosage sensitivity data with optional filtering by gene, HI score, TS score, " +
				"or keyword search. Served from embedded static data (~30 high-value genes).",
			category: "dosage",
			queryParams: [
				{
					name: "gene",
					type: "string",
					required: false,
					description:
						"Filter by gene symbol (e.g., FBN1, SHANK3, MECP2). Case-insensitive.",
				},
				{
					name: "hi_score",
					type: "number",
					required: false,
					description:
						"Filter by haploinsufficiency score (0=none, 1=little, 2=some, 3=sufficient, 40=AR)",
				},
				{
					name: "ts_score",
					type: "number",
					required: false,
					description:
						"Filter by triplosensitivity score (0=none, 1=little, 2=some, 3=sufficient, 40=AR)",
				},
				{
					name: "search",
					type: "string",
					required: false,
					description:
						"Free-text search across gene symbol, HI/TS descriptions, and HGNC ID",
				},
			],
			description:
				"Returns array of entries with: gene_symbol, hgnc_id, hi_score, ts_score, hi_description, " +
				"ts_description, review_date. Includes score legend in response. " +
				"Data sourced from ClinGen Dosage Sensitivity curations (search.clinicalgenome.org/kb/gene-dosage).",
		},
		{
			method: "GET",
			path: "/dosage/genes/{gene_symbol}",
			summary:
				"Get dosage sensitivity data for a specific gene, including haploinsufficiency and triplosensitivity scores.",
			category: "dosage",
			pathParams: [
				{
					name: "gene_symbol",
					type: "string",
					required: true,
					description:
						"HGNC gene symbol (e.g., FBN1, SHANK3, MECP2, PMP22, RAI1)",
				},
			],
			description:
				"Returns the gene's HI and TS scores with detailed descriptions of the evidence. " +
				"Scores: 0 (no evidence), 1 (little), 2 (some/emerging), 3 (sufficient), 40 (autosomal recessive).",
		},

		// ===================================================================
		// Variant Curation Repository — live REST API (erepo)
		// ===================================================================
		{
			method: "GET",
			path: "/classifications",
			summary:
				"Search ClinGen variant pathogenicity classifications by gene symbol, variation ID, or disease. " +
				"From the ClinGen Evidence Repository (erepo.clinicalgenome.org). Live API.",
			category: "variant",
			queryParams: [
				{
					name: "matchMode",
					type: "string",
					required: false,
					description:
						"Match mode for search (use 'exact' for precise gene/variation lookups)",
					enum: ["exact"],
				},
				{
					name: "gene",
					type: "string",
					required: false,
					description:
						"HGNC gene symbol to search (e.g., BRCA1, TP53). Use with matchMode=exact.",
				},
				{
					name: "variation",
					type: "string",
					required: false,
					description:
						"ClinVar variation ID to search. Use with matchMode=exact.",
				},
				{
					name: "disease",
					type: "string",
					required: false,
					description: "Disease name to filter results",
				},
			],
			description:
				"Returns array of variant classification objects with: guideline_shortname, submitted_date, " +
				"classification (Pathogenic/Likely Pathogenic/Uncertain Significance/Likely Benign/Benign), " +
				"gene_symbol, variation, disease, criteria_applied. This is a live API call to erepo.clinicalgenome.org.",
		},
		{
			method: "GET",
			path: "/interpretations/{uuid}",
			summary:
				"Get detailed variant interpretation by UUID from the ClinGen Evidence Repository. " +
				"Returns full ACMG/AMP criteria applied and supporting evidence. Live API.",
			category: "variant",
			pathParams: [
				{
					name: "uuid",
					type: "string",
					required: true,
					description:
						"UUID of the specific variant interpretation to retrieve",
				},
			],
			description:
				"Returns detailed interpretation including all ACMG/AMP criteria applied, " +
				"evidence summary, classification, and provenance information. Live API call.",
		},

		// ===================================================================
		// Evidence Repository with /erepo prefix (alternative routing)
		// ===================================================================
		{
			method: "GET",
			path: "/erepo/classifications",
			summary:
				"Alternative path for variant classifications via /erepo prefix. Same data as /classifications.",
			category: "variant",
			queryParams: [
				{
					name: "matchMode",
					type: "string",
					required: false,
					description: "Match mode ('exact' for precise lookups)",
					enum: ["exact"],
				},
				{
					name: "gene",
					type: "string",
					required: false,
					description: "HGNC gene symbol (e.g., BRCA1, TP53)",
				},
			],
			description: "Same as GET /classifications. The /erepo prefix explicitly routes to the Evidence Repository REST API.",
		},
		{
			method: "GET",
			path: "/erepo/interpretations/{uuid}",
			summary:
				"Alternative path for variant interpretations via /erepo prefix. Same data as /interpretations/{uuid}.",
			category: "variant",
			pathParams: [
				{
					name: "uuid",
					type: "string",
					required: true,
					description: "UUID of the variant interpretation",
				},
			],
			description: "Same as GET /interpretations/{uuid}. The /erepo prefix explicitly routes to the Evidence Repository REST API.",
		},
	],
};
