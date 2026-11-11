import type { ApiEndpoint } from "@bio-mcp/shared/codemode/catalog";

export const dosageFeedEndpoint: ApiEndpoint = {
  method: "GET", path: "/dosage/curations", category: "dosage", featured: true,
  summary: "Retrieve the current official ClinGen gene-only dosage CSV, including native classifications, dates and report links. Prefer this over the legacy embedded /dosage/genes subset for current curations.",
  queryParams: [{ name: "expected_sha256", type: "string", required: false, description: "Optional hash of a previously retrieved response; rejects changed bytes, without retrieving an archived release. No provider filtering or pagination." }],
  description: "MCP adapter route over the official CSV download. Preserves raw_csv, all source columns, classifications as strings (including Not yet evaluated), source preamble, HTTP validators and response hash. No numeric score inference, assembly coordinates or region curations. Responses over 30KB stage through the existing ClinGen Durable Object; use get_schema then query_data, and keep staging/error markers intact. A missing gene is absent from this retrieved export, not proof of no ClinGen evidence in other domains.",
  example: 'return await api.get("/dosage/curations");',
};
