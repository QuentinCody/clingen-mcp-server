import type { ApiEndpoint, WorkflowRecipe } from "@bio-mcp/shared/codemode/catalog";

const context: NonNullable<ApiEndpoint["pathParams"]> = [{ name: "context", type: "string", required: true, enum: ["Adult", "Pediatric"], description: "Explicit age context. Adult and pediatric assertions can differ for the same gene/condition; never substitute one for the other." }];
const hash: NonNullable<ApiEndpoint["queryParams"]>[number] = { name: "expected_sha256", type: "string", required: false, description: "MCP-only expected hash of the complete response. Rejects changed bytes; does not retrieve an archived release." };

export const actionabilityEndpoints: ApiEndpoint[] = [
  {
    method: "GET", path: "/actionability/{context}/summ", category: "actionability", featured: true,
    summary: "Retrieve the official Adult or Pediatric clinical-actionability JSON feed, nested or flat. Preserve classifications, report versions, curation/literature dates and all source fields without conflating actionability with pathogenicity, dosage or gene-disease validity.",
    pathParams: context,
    queryParams: [{ name: "flavor", type: "string", required: false, enum: ["nested", "flat"], description: "Provider representation. Nested omits the upstream flavor parameter; flat sends flavor=flat. No gene filter or pagination is documented here." }, hash],
    example: 'return await api.get("/actionability/Adult/summ", { flavor: "flat" });',
    response: { description: "Context, source URL, response SHA-256, raw_json text and parsed raw_response preserve the complete JSON. If an observed columns/rows table is present, records supplies lossless labeled rows as well. Inspect returned/staged schema before filtering." },
  },
  {
    method: "GET", path: "/actionability/{context}/assertions", category: "actionability",
    summary: "Retrieve the provider-linked TSV of all or consensus assertions, keeping age context and source status. Native Adult feeds include Retracted records; inspect status-overall. Consensus is not interchangeable with all assertions.",
    pathParams: context,
    queryParams: [{ name: "assertion_type", type: "string", required: false, enum: ["consensus", "all"], description: "consensus (default) uses the provider's default; all sends assertionType=all. Always requests format=tsv." }, hash],
    example: 'return await api.get("/actionability/Pediatric/assertions", { assertion_type: "consensus" });',
    response: { description: "raw_tsv, native columns and lossless records plus source/context/hash metadata. Query actionability_records after staging; quote native column names such as \"# docId\" and \"status-overall\". Scores, dates, repeated scorer assertions and identifier strings are not coerced, deduplicated or reclassified. Separate reads can differ in order, anonymous scorer labels and consensus assertions despite unchanged report metadata; retain each response hash and original text. Scorer labels are not stable cross-snapshot person IDs." },
  },
];

export const actionabilityWorkflows: WorkflowRecipe[] = [{
  title: "Retrieve adult and pediatric actionability evidence separately",
  description: "Independent calls preserve age-specific evidence. Return failure markers and staging handles unchanged; retrieve full staged data before comparing matching HGNC/MONDO identifiers, report dates and versions. Embedded validity/dosage subsets and G2P are separate evidence domains, not substitutes for missing actionability.",
  keywords: ["actionability", "adult", "pediatric", "secondary findings", "classification", "curation date"],
  code: 'const [adult, pediatric] = await Promise.all([api.get("/actionability/Adult/summ", { flavor: "flat" }), api.get("/actionability/Pediatric/summ", { flavor: "flat" })]); return { adult, pediatric };',
}];
