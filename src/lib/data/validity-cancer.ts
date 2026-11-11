import type { GeneValidityCuration } from "./validity-types";

// Selected rows checked against the official export on 2026-10-01:
// https://search.clinicalgenome.org/kb/gene-validity/download
// Preserve each assertion and the provider timestamp, including its timezone form.
// This is a reviewed subset, not a complete imported release.
export const reviewedCancerValidity: GeneValidityCuration[] = [
  {
    "gene_symbol": "PALB2",
    "hgnc_id": "HGNC:26144",
    "disease_name": "PALB2-related cancer predisposition",
    "mondo_id": "MONDO:0700272",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP10",
    "classification": "Definitive",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_b067d463-b881-4f67-b3a6-2924903fc119-2024-08-29T170000.000Z",
    "report_date": "2024-08-29T17:00:00.000Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "PALB2",
    "hgnc_id": "HGNC:26144",
    "disease_name": "Fanconi anemia complementation group N",
    "mondo_id": "MONDO:0012565",
    "mode_of_inheritance": "AR",
    "sop_version": "SOP6",
    "classification": "Definitive",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_3ebabbf1-1a43-4a57-b0b8-2b29bb57ade1-2019-08-18T160312.829Z",
    "report_date": "2019-08-18T16:03:12.829Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "ATM",
    "hgnc_id": "HGNC:795",
    "disease_name": "ATM-related cancer predisposition",
    "mondo_id": "MONDO:0700270",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP11",
    "classification": "Definitive",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_5acbaa2d-bdd3-40dd-b7e4-df0b0204468e-2024-11-22T180000.000Z",
    "report_date": "2024-11-22T18:00:00.000Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "ATM",
    "hgnc_id": "HGNC:795",
    "disease_name": "ataxia telangiectasia",
    "mondo_id": "MONDO:0008840",
    "mode_of_inheritance": "AR",
    "sop_version": "SOP7",
    "classification": "Definitive",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_02a69e27-77dc-41bd-83d2-dda9c224ee43-2021-07-27T205239.729Z",
    "report_date": "2021-07-27T20:52:39.729Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "CHEK2",
    "hgnc_id": "HGNC:16627",
    "disease_name": "CHEK2-related cancer predisposition",
    "mondo_id": "MONDO:0700271",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP10",
    "classification": "Definitive",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_49566325-8710-4b72-ad64-79528585223d-2024-11-04T180000.000Z",
    "report_date": "2024-11-04T18:00:00.000Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "CHEK2",
    "hgnc_id": "HGNC:16627",
    "disease_name": "familial ovarian cancer",
    "mondo_id": "MONDO:0016248",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP10",
    "classification": "Refuted",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_9e1071da-cc4a-4bbc-b3fa-4cc07393e74a-2024-11-04T180000.000Z",
    "report_date": "2024-11-04T18:00:00.000Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "CHEK2",
    "hgnc_id": "HGNC:16627",
    "disease_name": "hereditary nonpolyposis colon cancer",
    "mondo_id": "MONDO:0018630",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP4",
    "classification": "Limited",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGCIEX:assertion_9862",
    "report_date": "2017-03-13T00:00:00",
    "gcep": "Breast/Ovarian Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "CDH1",
    "hgnc_id": "HGNC:1748",
    "disease_name": "CDH1-related diffuse gastric and lobular breast cancer syndrome",
    "mondo_id": "MONDO:0100488",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP10",
    "classification": "Definitive",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_14223ff7-e6b0-4c60-bee6-df55301d2017-2024-03-22T170000.000Z",
    "report_date": "2024-03-22T17:00:00.000Z",
    "gcep": "Hereditary Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  },
  {
    "gene_symbol": "CDH1",
    "hgnc_id": "HGNC:1748",
    "disease_name": "familial ovarian cancer",
    "mondo_id": "MONDO:0016248",
    "mode_of_inheritance": "AD",
    "sop_version": "SOP4",
    "classification": "No Known Disease Relationship",
    "report_url": "https://search.clinicalgenome.org/kb/gene-validity/CGGCIEX:assertion_8503",
    "report_date": "2017-08-03T00:00:00",
    "gcep": "Breast/Ovarian Cancer Gene Curation Expert Panel",
    "source_checked_on": "2026-10-01"
  }
];
