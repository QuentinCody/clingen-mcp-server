import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import { readClinGenFeed } from "./feed-http";
import { csvRows } from "./curation-csv";

const BASE = "https://actionability.clinicalgenome.org/ac";
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

/** Explicit provider-linked routes only; undocumented gene/paging filters fail. */
export function actionabilityRequest(request: Parameters<ApiFetchFn>[0]) {
  if (request.method !== "GET" || request.body !== undefined) throw new Error("Actionability routes support GET without a body");
  const match = request.path.match(/^\/actionability\/(Adult|Pediatric)\/(summ|assertions)$/);
  if (!match) throw new Error("Select /actionability/{Adult|Pediatric}/{summ|assertions}");
  const [, context, operation] = match;
  const params = request.params ?? {};
  const allowed = operation === "summ" ? ["flavor", "expected_sha256"] : ["assertion_type", "expected_sha256"];
  for (const key of Object.keys(params)) if (!allowed.includes(key)) throw new Error(`Unsupported actionability parameter: ${key}; no upstream gene filter or pagination is established`);
  if (params.expected_sha256 !== undefined && (typeof params.expected_sha256 !== "string" || !/^[a-f\d]{64}$/i.test(params.expected_sha256))) throw new Error("expected_sha256 must be a SHA-256 digest");
  const url = new URL(`${BASE}/${context}/api/summ${operation === "assertions" ? "/assertion" : ""}`);
  if (operation === "summ") {
    const flavor = params.flavor ?? "nested";
    if (flavor !== "nested" && flavor !== "flat") throw new Error("flavor must be nested or flat");
    if (flavor === "flat") url.searchParams.set("flavor", "flat");
  } else {
    const type = params.assertion_type ?? "consensus";
    if (type !== "all" && type !== "consensus") throw new Error("assertion_type must be all or consensus");
    if (type === "all") url.searchParams.set("assertionType", "all");
    url.searchParams.set("format", "tsv");
  }
  return { url: url.toString(), context, operation, params };
}

/** Generic observed columnar tables become queryable rows; raw JSON remains intact. */
export function columnarRows(data: unknown): Record<string, unknown>[] | undefined {
  if (!object(data) || !("columns" in data) || !("rows" in data)) return undefined;
  const { columns, rows } = data;
  if (!Array.isArray(columns) || columns.some(c => typeof c !== "string" || !c) || new Set(columns).size !== columns.length || !Array.isArray(rows)) throw new Error("Invalid actionability columnar table");
  return rows.map((row, i) => {
    if (!Array.isArray(row) || row.length !== columns.length) throw new Error(`Actionability row ${i} does not match its columns`);
    return Object.fromEntries(columns.map((column, j) => [column, row[j]]));
  });
}

export async function fetchActionability(request: Parameters<ApiFetchFn>[0], fetcher: typeof fetch = fetch) {
  const { url, context, operation, params } = actionabilityRequest(request);
  const { response, text, response_sha256: hash } = await readClinGenFeed(url, operation === "summ" ? "application/json" : "text/tab-separated-values", "Actionability", fetcher);
  if (params.expected_sha256 && String(params.expected_sha256).toLowerCase() !== hash) throw Object.assign(new Error("Actionability response snapshot changed; explicitly reselect the source snapshot"), {
    status: 409, data: { expected_sha256: params.expected_sha256, observed_sha256: hash, source_url: url },
  });
  const metadata = {
    context, source_url: url, fetched_at: new Date().toISOString(), response_sha256: hash,
    last_modified: response.headers.get("last-modified"), etag: response.headers.get("etag"),
    snapshot_scope: "retrieved response only; fetch time and HTTP headers are not curation dates or an immutable release",
    evidence_domain: "clinical_actionability", population_scope: "secondary findings in the selected age context; non-diagnostic, excluding newborn and prenatal screening",
  };
  if (operation === "assertions") {
    if (!text.includes("\t") || /<\s*(?:!doctype|html|body)\b/i.test(text)) throw new Error("Expected an actionability TSV export, not an empty or HTML response");
    const [columns, ...rows] = csvRows(text.replace(/^\uFEFF/, ""), "\t");
    const records = columnarRows({ columns, rows });
    return { status: response.status, data: { ...metadata, assertion_type: params.assertion_type ?? "consensus", format: "tsv", raw_tsv: text,
      columns, records, record_count: records!.length } };
  }
  const data: unknown = JSON.parse(text.replace(/^\uFEFF/, ""));
  if (!object(data) && !Array.isArray(data)) throw new Error("Expected actionability JSON object or array");
  if (object(data) && (data.error || (Array.isArray(data.errors) ? data.errors.length > 0 : data.errors))) throw Object.assign(new Error("Actionability returned an error envelope"), { data });
  const records = columnarRows(data);
  return { status: response.status, data: { ...metadata, format: params.flavor ?? "nested", raw_json: text, raw_response: data, ...(records ? { records, record_count: records.length } : {}) } };
}
