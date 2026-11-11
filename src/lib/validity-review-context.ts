// These gene-summary pages did not corroborate the former embedded ClinGen
// validity claims. Other evidence categories are not validity classifications.
const excludedGenes = [
  ["DPYD", "HGNC:3012"], ["TPMT", "HGNC:12014"],
  ["CYP2D6", "HGNC:2625"], ["CYP2C19", "HGNC:2621"],
  ["CYP2C9", "HGNC:2623"], ["UGT1A1", "HGNC:12530"],
  ["NUDT15", "HGNC:23063"], ["SLCO1B1", "HGNC:10959"],
  ["SMN1", "HGNC:11117", "The gene-summary page says ClinGen has not yet published curations for SMN1 and lists it as in scope or under active curation."],
  ["TSC1", "HGNC:12362", "The gene summary exposes dosage sensitivity and clinical actionability, but did not corroborate the former gene-disease validity assertion."],
  ["TSC2", "HGNC:12363", "The gene summary exposes dosage sensitivity and clinical actionability, but did not corroborate the former gene-disease validity assertion."],
].map(([gene_symbol, hgnc_id, review_note]) => ({ gene_symbol, hgnc_id,
  source_url: `https://search.clinicalgenome.org/kb/genes/${hgnc_id}`,
  review_note: review_note ?? "The gene summary exposes CPIC/ClinPGx drug guidance; those levels are not ClinGen gene-disease validity classifications.",
}));

export function validityReviewContext(gene?: string, search?: string) {
  const selected = excludedGenes.filter(row =>
    (!gene || row.gene_symbol === gene.toUpperCase()) &&
    (!search || `${row.gene_symbol} ${row.hgnc_id}`.toLowerCase().includes(search.toLowerCase())));
  if (!selected.length) return undefined;
  return {
    status: "legacy_assertions_not_corroborated",
    source_checked_on: "2026-10-01",
    excluded_genes: selected,
    note: "Legacy ClinGen validity classifications, panel, dates and report links could not be corroborated and are excluded from curations and counts. Other evidence categories remain separate; see each gene's review_note. This is not a Refuted or No Known Disease Relationship assertion, nor proof that ClinGen has no curation.",
    notice_scope: "Review notices match only gene or symbol/HGNC search filters; they are not classification, disease or inheritance matches.",
    current_validity_path: "/validity/export",
  };
}
