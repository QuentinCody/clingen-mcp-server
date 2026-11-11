/**
 * ClinGen Dosage Sensitivity curations — embedded static data.
 *
 * Source: https://search.clinicalgenome.org/kb/gene-dosage
 * Base snapshot: 2026-03, partial; selected source checks through 2026-10-01.
 * Null scores/dates preserve pending or unavailable curations; they are not 0 or -5.
 *
 * Haploinsufficiency (HI) scores — evidence for disease due to loss of one copy:
 *   0 — No evidence for haploinsufficiency
 *   1 — Little evidence for haploinsufficiency
 *   2 — Some evidence for haploinsufficiency (emerging)
 *   3 — Sufficient evidence for haploinsufficiency
 *  30 — Gene associated with autosomal recessive phenotype (official legend)
 *  40 — Dosage sensitivity unlikely
 *
 * Triplosensitivity (TS) scores — evidence for disease due to gain of one copy:
 *   0 — No evidence for triplosensitivity
 *   1 — Little evidence for triplosensitivity
 *   2 — Some evidence for triplosensitivity (emerging)
 *   3 — Sufficient evidence for triplosensitivity
 *  30 — Gene associated with autosomal recessive phenotype (official legend)
 *  40 — Dosage sensitivity unlikely
 */

export interface DosageSensitivityEntry {
	gene_symbol: string;
	hgnc_id: string;
	hi_score: -5 | 0 | 1 | 2 | 3 | 30 | 40 | null;
	ts_score: -5 | 0 | 1 | 2 | 3 | 30 | 40 | null;
	hi_description: string;
	ts_description: string;
	review_date: string | null;
	curation_status?: "awaiting_review" | "under_primary_review" | "no_published_curation" | "unverified";
	provider_curation_status?: string;
	provider_last_evaluated?: string;
	dosage_id?: string;
	source_note?: string;
	source_url?: string;
	source_checked_on?: string;
	description_review?: {
		status: "reviewed_summary" | "source_conflict";
		checked_on: string;
		source_url: string;
		kind: "paraphrase";
		note?: string;
	};
	score_source_url?: string;
}
