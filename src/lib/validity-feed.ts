import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import { csvRows, fetchCurationCsv } from "./curation-csv";

export const VALIDITY_FEED_URL = "https://search.clinicalgenome.org/kb/gene-validity/download";
const HEADERS = ["GENE SYMBOL", "GENE ID (HGNC)", "DISEASE LABEL", "DISEASE ID (MONDO)", "MOI", "SOP", "CLASSIFICATION", "ONLINE REPORT", "CLASSIFICATION DATE", "GCEP"];

/** Preserve each assertion independently: a gene/disease can have different MOIs/panels. */
export function parseValidityFeed(raw: string) {
  const rows = csvRows(raw.replace(/^\uFEFF/, ""));
  if (rows[0]?.[0] !== "CLINGEN GENE DISEASE VALIDITY CURATIONS") throw new Error("Expected ClinGen gene-disease validity CSV title");
  const headerIndex = rows.findIndex(row => HEADERS.every((name, i) => row[i] === name));
  if (headerIndex < 0) throw new Error("ClinGen validity CSV headers changed");
  const headers = rows[headerIndex];
  if (headers.some(name => !name) || new Set(headers).size !== headers.length) throw new Error("Invalid validity CSV column names");
  const records = rows.slice(headerIndex + 1).filter(row => !row.every(value => /^\+*$/.test(value))).map(row => {
    if (row.length !== headers.length || !row[0] || !/^HGNC:\d+$/.test(row[1])) throw new Error("Invalid or incomplete validity CSV record");
    return Object.fromEntries(headers.map((name, i) => [name, row[i]]));
  });
  if (!records.length) throw new Error("ClinGen validity CSV contains no curation records");
  return { records, columns: headers, source_preamble: rows.slice(0, headerIndex) };
}

export function fetchValidityFeed(request: Parameters<ApiFetchFn>[0], fetcher: typeof fetch = fetch) {
  return fetchCurationCsv(request, {
    url: VALIDITY_FEED_URL, label: "Validity feed", parse: parseValidityFeed,
    evidenceDomain: "gene_disease_validity", scope: "provider gene-disease validity assertion summary export; not full evidence dossiers",
  }, fetcher);
}
