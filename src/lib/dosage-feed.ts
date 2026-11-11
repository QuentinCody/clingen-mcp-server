import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import { csvRows, fetchCurationCsv } from "./curation-csv";

export const DOSAGE_FEED_URL = "https://search.clinicalgenome.org/kb/gene-dosage/download";
const HEADERS = ["GENE SYMBOL", "HGNC ID", "HAPLOINSUFFICIENCY", "TRIPLOSENSITIVITY", "ONLINE REPORT", "DATE"];

export function parseDosageFeed(raw: string) {
  const rows = csvRows(raw.replace(/^\uFEFF/, ""));
  if (rows[0]?.[0] !== "CLINGEN DOSAGE SENSITIVITY CURATIONS") throw new Error("Expected ClinGen dosage CSV title");
  const headerIndex = rows.findIndex(row => HEADERS.every((name, i) => row[i] === name));
  if (headerIndex < 0) throw new Error("ClinGen dosage CSV headers changed");
  const headers = rows[headerIndex];
  if (headers.some(name => !name) || new Set(headers).size !== headers.length) throw new Error("Invalid dosage CSV column names");
  const records = rows.slice(headerIndex + 1).filter(row => !row.every(value => /^\+*$/.test(value))).map(row => {
    if (row.length !== headers.length || !/^HGNC:\d+$/.test(row[1]) || !row[0]) throw new Error("Invalid or incomplete dosage CSV record");
    return Object.fromEntries(headers.map((name, i) => [name, row[i]]));
  });
  if (!records.length) throw new Error("ClinGen dosage CSV contains no curation records");
  return { records, columns: headers, source_preamble: rows.slice(0, headerIndex) };
}

/** Adapter-owned route to the provider's current complete gene-only CSV. */
export function fetchDosageFeed(request: Parameters<ApiFetchFn>[0], fetcher: typeof fetch = fetch) {
  return fetchCurationCsv(request, {
    url: DOSAGE_FEED_URL, label: "Dosage feed", parse: parseDosageFeed,
    evidenceDomain: "dosage_sensitivity", scope: "provider gene-only export; excludes regions",
  }, fetcher);
}
