import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import { readClinGenFeed } from "./feed-http";

type ParsedFeed = { records: Record<string, string>[]; columns: string[]; source_preamble: string[][] };
interface FeedConfig {
  url: string;
  label: string;
  evidenceDomain: string;
  scope: string;
  parse: (raw: string) => ParsedFeed;
}

/** Strict CSV decoding, retaining strings, embedded newlines and every column. */
export function csvRows(text: string, delimiter: "," | "\t" = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  const endField = () => { row.push(field); field = ""; closed = false; };
  const endRow = () => { endField(); if (row.some(value => value !== "")) rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch !== '"') field += ch;
      else if (text[i + 1] === '"') { field += '"'; i++; }
      else { quoted = false; closed = true; }
    } else if (ch === delimiter) endField();
    else if (ch === "\r" || ch === "\n") { endRow(); if (ch === "\r" && text[i + 1] === "\n") i++; }
    else if (ch === '"' && field === "" && !closed) quoted = true;
    else {
      if (closed || ch === '"') throw new Error("Invalid ClinGen CSV quoting");
      field += ch;
    }
  }
  if (quoted) throw new Error("Incomplete ClinGen CSV quoted field");
  if (field !== "" || row.length || closed) endRow();
  return rows;
}

/** Bounded, hash-guarded retrieval shared by the two official curation exports. */
export async function fetchCurationCsv(request: Parameters<ApiFetchFn>[0], config: FeedConfig, fetcher: typeof fetch = fetch) {
  if (request.method !== "GET" || request.body !== undefined) throw new Error(`${config.label} supports GET without a body`);
  const params = request.params ?? {};
  if (Object.keys(params).some(key => key !== "expected_sha256")) throw new Error(`${config.label} supports only expected_sha256; filter the returned or staged records locally`);
  if (params.expected_sha256 !== undefined && (typeof params.expected_sha256 !== "string" || !/^[a-f\d]{64}$/i.test(params.expected_sha256))) throw new Error("expected_sha256 must be a SHA-256 digest");
  const { response, text: raw_csv, response_sha256 } = await readClinGenFeed(config.url, "text/csv", config.label, fetcher);
  if (params.expected_sha256 && params.expected_sha256.toLowerCase() !== response_sha256) throw Object.assign(new Error(`${config.label} changed since the expected response snapshot`), {
    status: 409, data: { expected_sha256: params.expected_sha256, observed_sha256: response_sha256, source_url: config.url },
  });
  const parsed = config.parse(raw_csv);
  return { status: response.status, data: {
    ...parsed, raw_csv, record_count: parsed.records.length, response_sha256,
    source_url: config.url, retrieved_at: new Date().toISOString(),
    etag: response.headers.get("etag"), last_modified: response.headers.get("last-modified"),
    evidence_domain: config.evidenceDomain, scope: config.scope,
    snapshot_scope: "complete retrieved CSV, not an immutable historical release; source dates remain unchanged",
  } };
}
