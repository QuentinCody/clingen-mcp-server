/**
 * ClinGen API catalog — multi-source: embedded static data + Evidence Repository REST API + Gene2Phenotype.
 *
 * Gene-Disease Validity: Current CSV export plus a separately labeled embedded subset
 * Dosage Sensitivity: Embedded static data (source: search.clinicalgenome.org/kb/gene-dosage)
 * Variant Classifications: Live REST API (erepo.clinicalgenome.org/evrepo/api)
 * Gene2Phenotype (G2P): Live REST API (www.ebi.ac.uk/gene2phenotype/api)
 *
 * Legacy validity/dosage routes use partial embedded 2026-03 subsets; export routes read current CSVs.
 * Actionability uses the official age-specific REST interfaces. Local implementation and
 * current upstream availability/schema verification are separate acceptance steps.
 *
 * In Code Mode: api.get('/validity/curations', { gene: 'BRCA1' })
 *               api.get('/dosage/genes/FBN1')
 *               api.get('/classifications', { gene: 'BRCA1', matchMode: 'exact' })
 *               api.get('/g2p/gene/BRCA1')
 */

import type { ApiCatalog } from "@bio-mcp/shared/codemode/catalog";
import { actionabilityEndpoints, actionabilityWorkflows } from "./actionability";
import { dosageFeedEndpoint } from "./dosage-feed";
import { validityFeedEndpoint } from "./validity-feed";
import { geneHandoffWorkflow } from "./gene-handoff";
import { g2pEndpoints } from "./g2p";

export const clingenCatalog: ApiCatalog = {
	name: "ClinGen (Actionability + Gene Validity + Dosage Sensitivity + Variant Curation + Gene2Phenotype)",
	baseUrl: "embedded://clingen + https://erepo.clinicalgenome.org/evrepo/api + https://www.ebi.ac.uk/gene2phenotype/api",
	version: "2026.09",
	auth: "none",
	endpointCount: 15 + actionabilityEndpoints.length + g2pEndpoints.length,
	workflows: [...actionabilityWorkflows, geneHandoffWorkflow],
	notes:
		"- /validity/export retrieves the current official gene-disease validity CSV summary with native assertions, classifications, inheritance, panels and dates; /validity/curations remains a partial embedded subset.\n" +
		"- Uncorroborated legacy validity claims are excluded from curations/counts. curation_review preserves source links and per-gene review notes. Pharmacogenomics, dosage and actionability are separate evidence categories; exclusion is not a negative assertion.\n" +
		"- /dosage/curations retrieves the current official gene-only CSV with native classifications and dates; filter its returned/staged records locally. /dosage/genes is a separate legacy embedded subset.\n" +
		"- /actionability/{Adult|Pediatric}/{summ|assertions}: official age-specific JSON and TSV feeds, validated on 2026-10-03. Preserve original classifications, dates, versions and status-overall; Adult feeds include Retracted rows. Preserve repeated assertions and inspect raw data before comparing.\n" +
		"- Embedded validity/dosage data has a partial 2026-03 base, not verified current. Dosage corrections carry source_url and source_checked_on; review_date is the provider evaluation date. No match does not mean absent from ClinGen. Unavailable or pending dosage has null scores/review_date and explicit curation_status; null is neither 0 nor -5.\n" +
		"- description_review identifies dated dosage-report paraphrases separately from scores. Preserve source_conflict observations (EHMT1 export/summary vs linked report), and keep review_date from the export separate from provider_last_evaluated displayed on reports.\n" +
		"- Multi-source adapter: /validity/* (gene-disease validity), /dosage/* (dosage sensitivity), /classifications + /interpretations (variant curation), /g2p/* (Gene2Phenotype)\n" +
		"- /validity/curations and /dosage/genes use embedded static data; /validity/export and /dosage/curations read current official CSVs\n" +
		"- Variant classifications use the live ClinGen Evidence Repository REST API (erepo.clinicalgenome.org)\n" +
		"- Gene2Phenotype: /g2p/gene/{symbol}/summary returns records_summary with native genotype, molecular_mechanism and confidence; /g2p/lgd/{stable_id} returns individual evidence records. Legacy /g2p/gene/{symbol} routes to the same summary. Panel detail returns counts, not all records.\n" +
		"- G2P panels: Cancer, DD, Skeletal, Eye, Ear, Skin, Cardiac\n" +
		"\n" +
		"== Embedded Gene-Disease Validity Subset Labels ==\n" +
		"Definitive, Strong, Moderate, Limited, Disputed, Refuted, No Known Disease Relationship. Embedded validity rows have source_checked_on plus provider report dates/URLs, but remain a partial subset. Unverified SOP versions are null with source_review_note; mondo_status: obsolete retains a provider ontology warning without inferring a replacement. The current export preserves all native labels and each assertion's SOP.\n" +
		"\n" +
		"== Dosage Sensitivity Scores ==\n" +
		"Official HI/TS scores: -5 (not yet evaluated), 0 (no evidence), 1 (little), 2 (some/emerging), 3 (sufficient), 30 (autosomal recessive phenotype), 40 (dosage sensitivity unlikely). Pending/unavailable records retain null scores and are excluded from numeric score filters.\n" +
		"\n" +
		"== Variant Classification Levels (ACMG/AMP) ==\n" +
		"Pathogenic, Likely Pathogenic, Uncertain Significance, Likely Benign, Benign\n" +
		"\n" +
		"== Examples ==\n" +
		"GET /validity/curations — embedded gene-disease validity subset\n" +
		"GET /validity/curations?gene=BRCA1 — validity curations for BRCA1\n" +
		"GET /validity/curations?classification=Definitive — Definitive curations in the subset\n" +
		"GET /validity/curations/TP53 — validity curations for TP53\n" +
		"GET /dosage/genes — embedded dosage sensitivity subset\n" +
		"GET /dosage/genes?hi_score=3 — genes with sufficient HI evidence\n" +
		"GET /dosage/genes/FBN1 — dosage data for FBN1\n" +
		"GET /classifications?matchMode=exact&gene=BRCA1 — variant classifications from erepo\n" +
		"GET /g2p/gene/BRCA1 — G2P gene detail with disease associations\n" +
		"GET /g2p/search?query=breast — search G2P genes/diseases\n" +
		"GET /g2p/panel/Cancer — summary counts for a curated G2P panel",
	endpoints: [
		validityFeedEndpoint,
		dosageFeedEndpoint,
		...actionabilityEndpoints,
		...g2pEndpoints,
		// ===================================================================
		// Gene-Disease Validity — embedded static data
		// ===================================================================
		{
			method: "GET",
			path: "/validity/curations",
			summary:
				"List ClinGen gene-disease validity curations with optional filtering by gene, classification, disease, " +
				"mode of inheritance, or keyword search. Served from a partial embedded subset; uncorroborated legacy claims appear separately in curation_review.",
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
					enum: ["Definitive", "Strong", "Moderate", "Limited", "Disputed", "Refuted", "No Known Disease Relationship"],
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
				"curation_review notices match gene or symbol/HGNC search only, not classification/disease/inheritance filters, and are excluded from total. " +
				"Data sourced from ClinGen Gene-Disease Validity curations (search.clinicalgenome.org/kb/gene-validity).",
		},
		{
			method: "GET",
			path: "/validity/curations/{gene_symbol}",
			summary:
				"Get gene-disease validity curations for a specific gene by symbol. " +
				"Returns curations in the embedded subset and curation_review for excluded uncorroborated claims. A gene may have multiple disease associations.",
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
		// Embedded validity summary routes; counts describe only the local subset.
		// ===================================================================
		{ method: "GET", path: "/validity/classifications", category: "validity",
			summary: "List native classification labels and assertion counts in the embedded subset. Not full ClinGen counts or a clinical confidence scale." },
		{ method: "GET", path: "/validity/gceps", category: "validity",
			summary: "List expert-panel names and assertion counts in the embedded subset. Not a complete directory of ClinGen panels." },

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
						"Filter embedded HI score (-5=not evaluated, 0=none, 1=little, 2=some, 3=sufficient, 30=recessive phenotype). 40=dosage sensitivity unlikely. Null scores do not match numeric filters.",
				},
				{
					name: "ts_score",
					type: "number",
					required: false,
					description:
						"Filter embedded TS score (-5=not evaluated, 0=none, 1=little, 2=some, 3=sufficient, 30=recessive phenotype). 40=dosage sensitivity unlikely. Null scores do not match numeric filters.",
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
				"ts_description, review_date; corrected records also carry source_url and source_checked_on. Includes score legend in response. " +
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
				"Official scores: -5 (not evaluated), 0 (no evidence), 1 (little), 2 (some/emerging), 3 (sufficient), 30 (autosomal recessive phenotype), 40 (dosage sensitivity unlikely). Scores and review_date are null when a numeric curation is unavailable; inspect curation_status and source notes.",
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

		// ===================================================================
		// Gene2Phenotype (G2P) — live REST API (ebi.ac.uk)
		// ===================================================================
		{
			method: "GET",
			path: "/g2p/gene/{symbol}",
			summary:
				"Compatibility route to the current G2P gene summary. Prefer /g2p/gene/{symbol}/summary; this is not full gene or publication evidence.",
			category: "g2p",
			pathParams: [
				{
					name: "symbol",
					type: "string",
					required: true,
					description:
						"HGNC gene symbol (e.g., BRCA1, TP53, FGFR3, SCN1A)",
				},
			],
			description:
				"Returns gene_symbol and records_summary. Preserve native genotype, variant_consequence, molecular_mechanism, confidence, panels, stable_id and last_updated. Retrieve a selected /g2p/lgd/{stable_id} for full evidence and identifiers.",
		},
		{
			method: "GET",
			path: "/g2p/search",
			summary:
				"Search Gene2Phenotype for genes or diseases by query term. Returns matching entries across all G2P panels.",
			category: "g2p",
			queryParams: [
				{
					name: "query",
					type: "string",
					required: true,
					description:
						"Search term — gene symbol, gene name, or disease name (e.g., 'BRCA1', 'breast', 'retinitis')",
				},
				{ name: "page", type: "number", required: false, description: "Positive one-based page number; one page is not the full result set." },
				{ name: "type", type: "string", required: false, enum: ["gene", "disease", "phenotype", "stable_id"], description: "Restrict the search category." },
				{ name: "panel", type: "string", required: false, description: "Panel short name." },
				{ name: "genotype", type: "string", required: false, description: "Native allelic requirement terminology." },
				{ name: "mechanism", type: "string", required: false, description: "Native molecular mechanism terminology." },
				{ name: "variant_consequence", type: "string", required: false, description: "Sequence Ontology term or accession." },
			],
			description:
				"Returns one count/next/previous/results page with stable IDs and native gene, disease, genotype, mechanism, panel and confidence. Keep paging evidence; no implicit follow-up requests.",
		},
		{
			method: "GET",
			path: "/g2p/panel/{name}",
			summary:
				"Retrieve G2P panel summary counts. Available panels: Cancer, DD, Skeletal, Eye, Ear, Skin, Cardiac.",
			category: "g2p",
			pathParams: [
				{
					name: "name",
					type: "string",
					required: true,
					description:
						"Panel name: Cancer, DD (developmental disorders), Skeletal, Eye, Ear, Skin, or Cardiac",
				},
			],
			description:
				"Returns panel statistics, not all gene-disease entries. Use search with an explicit query and panel filter for paged records.",
		},
	],
};
