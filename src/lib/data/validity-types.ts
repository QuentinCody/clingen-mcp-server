export interface GeneValidityCuration {
  gene_symbol: string;
  hgnc_id: string;
  disease_name: string;
  mondo_id: string;
  classification: "Definitive" | "Strong" | "Moderate" | "Limited" | "Disputed" | "Refuted" | "No Known Disease Relationship";
  mode_of_inheritance: string;
  sop_version: string | null;
  gcep: string;
  report_date: string;
  report_url: string;
  source_checked_on?: string;
  source_url?: string;
  source_review_note?: string;
  mondo_status?: "obsolete";
}
