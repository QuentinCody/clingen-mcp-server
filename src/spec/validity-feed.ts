import type { ApiEndpoint } from "@bio-mcp/shared/codemode/catalog";

export const validityFeedEndpoint: ApiEndpoint = {
  method: "GET", path: "/validity/export", category: "validity", featured: true,
  summary: "Retrieve ClinGen's current gene-disease validity CSV summary, preserving every assertion and native classification, inheritance, SOP, panel, report link and date. Prefer for current coverage over the embedded /validity/curations subset.",
  queryParams: [{ name: "expected_sha256", type: "string", required: false, description: "Optional SHA-256 of an earlier response; rejects changed bytes. Not an archived release selector. No provider filtering or pagination." }],
  description: "Adapter route over the official real-time CSV export. Keeps raw_csv, all columns and rows, source preamble, HTTP validators and response_sha256. Does not deduplicate by gene or disease, infer variant pathogenicity, or rank classification labels. Source classification dates, file-created text and retrieval time remain separate. Responses over 30KB stage in the existing ClinGen Durable Object; preserve staging/error markers and inspect get_schema/query_data for local filtering. Missing records only establish absence from this retrieved export.",
  example: 'return await api.get("/validity/export");',
};
