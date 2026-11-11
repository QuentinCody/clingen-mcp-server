import type { DosageSensitivityEntry } from "./dosage-types";
import { reviewedDosageDescriptions } from "./dosage-descriptions";
export type { DosageSensitivityEntry } from "./dosage-types";

// Partial embedded dataset; source_checked_on applies to scores and review dates.
// description_review separately records the clinical summary review and source conflicts.
// See dosage-types.ts for score meanings and README.md for source review scope.

export const dosageSensitivityEntries: DosageSensitivityEntry[] = [
	{
		gene_symbol: "FBN1",
		hgnc_id: "HGNC:3603",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.FBN1,
		review_date: "2019-12-04",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:3603",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "SHANK3",
		hgnc_id: "HGNC:14294",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.SHANK3,
		review_date: "2018-08-14",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:14294",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "MECP2",
		hgnc_id: "HGNC:6990",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.MECP2,
		review_date: "2021-02-22",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:6990",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "RAI1",
		hgnc_id: "HGNC:9834",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.RAI1,
		review_date: "2020-10-13",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:9834",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "PMP22",
		hgnc_id: "HGNC:9118",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.PMP22,
		review_date: "2012-07-12",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:9118",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "SCN1A",
		hgnc_id: "HGNC:10585",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.SCN1A,
		review_date: "2012-07-06",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:10585",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "BRCA1",
		hgnc_id: "HGNC:1100",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.BRCA1,
		review_date: "2021-09-23",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:1100",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "TP53",
		hgnc_id: "HGNC:11998",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.TP53,
		review_date: "2021-11-10",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:11998",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "NF1",
		hgnc_id: "HGNC:7765",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.NF1,
		review_date: "2023-02-12",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:7765",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "PTEN",
		hgnc_id: "HGNC:9588",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.PTEN,
		review_date: "2020-06-24",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:9588",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "RB1",
		hgnc_id: "HGNC:9884",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.RB1,
		review_date: "2021-03-09",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:9884",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "KCNQ1",
		hgnc_id: "HGNC:6294",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.KCNQ1,
		review_date: "2020-10-13",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:6294",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "PKD1",
		hgnc_id: "HGNC:9008",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.PKD1,
		review_date: "2020-06-10",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:9008",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "MYH7",
		hgnc_id: "HGNC:7577",
		hi_score: 0,
		ts_score: 0,
		...reviewedDosageDescriptions.MYH7,
		review_date: "2015-11-15",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:7577",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "LMNA",
		hgnc_id: "HGNC:6636",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.LMNA,
		review_date: "2023-12-14",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:6636",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "TSC1",
		hgnc_id: "HGNC:12362",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.TSC1,
		review_date: "2020-10-13",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:12362",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "TSC2",
		hgnc_id: "HGNC:12363",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.TSC2,
		review_date: "2020-06-10",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:12363",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "DMD",
		hgnc_id: "HGNC:2928",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.DMD,
		review_date: "2019-11-20",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:2928",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "APC",
		hgnc_id: "HGNC:583",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.APC,
		review_date: "2021-07-18",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:583",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "CFTR",
		hgnc_id: "HGNC:1884",
		hi_score: 30,
		ts_score: -5,
		hi_description:
			"Gene associated with autosomal recessive phenotype.",
		ts_description: "Not yet evaluated.",
		review_date: "2016-08-22",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:1884",
		source_checked_on: "2026-09-30",
	},
	{
		gene_symbol: "SMN1",
		hgnc_id: "HGNC:11117",
		hi_score: null,
		ts_score: null,
		hi_description: "No published ClinGen curation reported on the inspected gene page.",
		ts_description: "No published ClinGen curation reported on the inspected gene page.",
		review_date: null,
		curation_status: "no_published_curation",
		source_url: "https://search.clinicalgenome.org/kb/genes/HGNC:11117",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "PAH",
		hgnc_id: "HGNC:8582",
		hi_score: 30,
		ts_score: 0,
		hi_description:
			"Gene associated with autosomal recessive phenotype.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2014-08-28",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:8582",
		source_checked_on: "2026-09-30",
	},
	{
		gene_symbol: "HBB",
		hgnc_id: "HGNC:4827",
		hi_score: null,
		ts_score: null,
		hi_description: "Awaiting Review",
		ts_description: "Awaiting Review",
		review_date: null,
		curation_status: "awaiting_review",
		provider_curation_status: "Awaiting Review",
		provider_last_evaluated: "Awaiting Review",
		dosage_id: "ISCA-10858",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HBB",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "FOXG1",
		hgnc_id: "HGNC:3811",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.FOXG1,
		review_date: "2021-03-09",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:3811",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "MBD5",
		hgnc_id: "HGNC:20444",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.MBD5,
		review_date: "2025-08-29",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:20444",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "EHMT1",
		hgnc_id: "HGNC:24650",
		hi_score: 3,
		ts_score: 1,
		...reviewedDosageDescriptions.EHMT1,
		review_date: "2012-07-06",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:24650",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "KANSL1",
		hgnc_id: "HGNC:24565",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.KANSL1,
		review_date: "2013-04-11",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:24565",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "DYRK1A",
		hgnc_id: "HGNC:3091",
		hi_score: 3,
		ts_score: 0,
		...reviewedDosageDescriptions.DYRK1A,
		review_date: "2020-12-16",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:3091",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "HTT",
		hgnc_id: "HGNC:4851",
		hi_score: null,
		ts_score: null,
		hi_description: "Under Primary Review",
		ts_description: "Under Primary Review",
		review_date: null,
		curation_status: "under_primary_review",
		provider_curation_status: "Under Primary Review",
		provider_last_evaluated: "Under Primary Review",
		dosage_id: "ISCA-31043",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HTT",
		source_checked_on: "2026-10-01",
	},

	// --- Pharmacogenomics ---
	{
		gene_symbol: "DPYD",
		hgnc_id: "HGNC:3012",
		hi_score: 30,
		ts_score: 0,
		hi_description:
			"Gene associated with autosomal recessive phenotype.",
		ts_description: "No evidence for triplosensitivity.",
		review_date: "2018-01-24",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HGNC:3012",
		source_checked_on: "2026-09-30",
	},
	{
		gene_symbol: "TPMT",
		hgnc_id: "HGNC:12014",
		hi_score: null,
		ts_score: null,
		hi_description: "Dosage curation not established from inspected sources.",
		ts_description: "Dosage curation not established from inspected sources.",
		review_date: null,
		curation_status: "unverified",
		source_note: "The inspected gene page lists pharmacogenomics evidence, not a dosage curation. No TPMT row was found in the inspected gene-only dosage export. This does not establish absence across ClinGen.",
		source_url: "https://search.clinicalgenome.org/kb/genes/TPMT",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "CYP2D6",
		hgnc_id: "HGNC:2625",
		hi_score: null,
		ts_score: null,
		hi_description: "Awaiting Review",
		ts_description: "Awaiting Review",
		review_date: null,
		curation_status: "awaiting_review",
		provider_curation_status: "Awaiting Review",
		provider_last_evaluated: "Awaiting Review",
		dosage_id: "ISCA-10650",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/CYP2D6",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "UGT1A1",
		hgnc_id: "HGNC:12530",
		hi_score: null,
		ts_score: null,
		hi_description: "Awaiting Review",
		ts_description: "Awaiting Review",
		review_date: null,
		curation_status: "awaiting_review",
		provider_curation_status: "Awaiting Review",
		provider_last_evaluated: "Awaiting Review",
		dosage_id: "ISCA-17462",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/UGT1A1",
		source_checked_on: "2026-10-01",
	},
	{
		gene_symbol: "G6PD",
		hgnc_id: "HGNC:4057",
		hi_score: null,
		ts_score: null,
		hi_description: "Awaiting Review",
		ts_description: "Awaiting Review",
		review_date: null,
		curation_status: "awaiting_review",
		provider_curation_status: "Awaiting Review",
		provider_last_evaluated: "Awaiting Review",
		dosage_id: "ISCA-20465",
		source_url: "https://search.clinicalgenome.org/kb/gene-dosage/G6PD",
		source_checked_on: "2026-10-01",
	},
];

/**
 * Filter dosage sensitivity entries by optional criteria.
 */
export function filterDosageSensitivity(filters?: {
	gene?: string;
	hi_score?: number;
	ts_score?: number;
	search?: string;
}): DosageSensitivityEntry[] {
	let results = dosageSensitivityEntries;

	if (filters?.gene) {
		const g = filters.gene.toUpperCase();
		results = results.filter((r) => r.gene_symbol.toUpperCase() === g);
	}
	if (filters?.hi_score !== undefined) {
		results = results.filter((r) => r.hi_score === filters.hi_score);
	}
	if (filters?.ts_score !== undefined) {
		results = results.filter((r) => r.ts_score === filters.ts_score);
	}
	if (filters?.search) {
		const q = filters.search.toLowerCase();
		results = results.filter(
			(r) =>
				r.gene_symbol.toLowerCase().includes(q) ||
				r.hi_description.toLowerCase().includes(q) ||
				r.ts_description.toLowerCase().includes(q) ||
				r.hgnc_id.toLowerCase().includes(q),
		);
	}

	return results;
}

/**
 * Find dosage sensitivity data for a specific gene.
 */
export function findDosageSensitivity(geneSymbol: string): DosageSensitivityEntry | undefined {
	const g = geneSymbol.toUpperCase();
	return dosageSensitivityEntries.find((r) => r.gene_symbol.toUpperCase() === g);
}
