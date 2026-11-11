import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import { readClinGenFeed } from "./feed-http";

const BASE = "https://www.ebi.ac.uk/gene2phenotype/api";

/** Routes follow the provider's published schema, including the gene summary suffix. */
function requestUrl(request: Parameters<ApiFetchFn>[0]): string {
  const path = request.path.replace(/\/$/, "");
  const params = request.params ?? {};
  let native: string;
  const gene = path.match(/^\/g2p\/gene\/([A-Za-z0-9_.-]+)(?:\/summary)?$/);
  const record = path.match(/^\/g2p\/lgd\/(G2P[0-9]+)$/);
  const panel = path.match(/^\/g2p\/panel\/([A-Za-z]+)$/);
  if (gene && /[A-Za-z0-9]/.test(gene[1])) native = `/gene/${gene[1]}/summary/`;
  else if (record) native = `/lgd/${record[1]}/`;
  else if (panel) native = `/panel/${panel[1]}/`;
  else if (path === "/g2p/search") native = "/search/";
  else throw new Error("Unknown G2P path or invalid identifier");
  const url = new URL(BASE + native);
  if (native !== "/search/") {
    if (Object.keys(params).length) throw new Error("G2P gene, record and panel reads accept no query parameters");
    return url.toString();
  }
  if (typeof params.query !== "string" || !params.query.trim()) throw new Error("G2P search requires a nonempty query");
  for (const [name, value] of Object.entries(params)) {
    if (name === "page") {
      if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error("G2P page must be a positive safe integer");
    } else {
      if (!["query", "type", "panel", "genotype", "mechanism", "variant_consequence"].includes(name)) throw new Error(`Unsupported G2P search parameter: ${name}`);
      if (typeof value !== "string" || !value.trim()) throw new Error(`G2P ${name} must be a nonempty string`);
      if (name === "type" && !["gene", "disease", "phenotype", "stable_id"].includes(value)) throw new Error("Unsupported G2P search type");
    }
    url.searchParams.set(name, String(value));
  }
  return url.toString();
}

export async function fetchG2P(request: Parameters<ApiFetchFn>[0]): ReturnType<ApiFetchFn> {
  if (request.method !== "GET" || request.body !== undefined) throw new Error("G2P supports GET without a body");
  const url = requestUrl(request);
  const observed = await readClinGenFeed(url, "application/json", "G2P API", fetch);
  const failure = (message: string) => Object.assign(new Error(message), { status: 502,
    data: { body: observed.text, source_url: url, response_sha256: observed.response_sha256 } });
  if (!/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(observed.response.headers.get("content-type") ?? "")) throw failure("G2P returned a non-JSON response");
  let data: unknown;
  try { data = JSON.parse(observed.text.replace(/^\uFEFF/, "")); } catch { throw failure("G2P returned invalid JSON"); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw failure("G2P returned an invalid response object");
  const page = data as Record<string, unknown>;
  const search = new URL(url).pathname.endsWith("/search/");
  if (search && (!Array.isArray(page.results) || !Number.isSafeInteger(page.count) || Number(page.count) < 0)) throw failure("G2P returned an invalid search page");
  const rows = search ? page.results : page.records_summary;
  return { status: 200, data, completeness: {
    complete: false, ...(Array.isArray(rows) ? { returned: rows.length } : {}),
    ...(search ? { total_available: Number(page.count) } : {}),
    truncation: { reason: search && page.next ? "page_limit" : "unknown",
      detail: search ? "One G2P search page; retain count, next and previous." : "One current G2P observation; panel routes return counts, gene routes return summaries, and lgd routes return individual evidence records.",
      remedy: "Preserve source identifiers, genotype, mechanism, confidence and dates independently. No response attests complete biological coverage or disease equivalence." },
  } };
}
