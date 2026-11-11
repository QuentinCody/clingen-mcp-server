import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
const query = (params: Record<string, unknown>) => proxy.handler({ method: "GET", path: "/dosage/genes", params }, { sql: () => [] });
afterEach(() => vi.restoreAllMocks());

// Regression cases from the linked provider reports reviewed 2026-10-01.
// These exercise local data delivery, not current upstream availability.
it.each([
  ["KCNQ1", "Jervell and Lange-Nielsen", "HI"],
  ["DMD", "carrier females", "HI"],
  ["DMD", "intragenic duplications", "TS"],
  ["MECP2", "IRAK1", "TS"],
  ["RAI1", "Potocki-Lupski", "TS"],
  ["PMP22", "CMT1A", "TS"],
  ["BRCA1", "disrupt function", "TS"],
  ["MBD5", "Sequence variants do not imply", "HI"],
  ["FOXG1", "corpus callosum hypoplasia", "HI"],
  ["TP53", "incomplete penetrance", "HI"],
  ["PKD1", "contiguous-gene syndrome", "HI"],
])("preserves the %s %s distinction in %s descriptions and search", async (gene, phrase, dimension) => {
  const description = dimension === "HI" ? "hi_description" : "ts_description";
  expect(await query({ gene, search: phrase })).toMatchObject({ total: 1, genes: [{
    gene_symbol: gene, [description]: expect.stringContaining(phrase),
    description_review: { status: "reviewed_summary", checked_on: "2026-10-01", kind: "paraphrase", source_url: expect.stringContaining("/gene-dosage/HGNC:") },
  }], _dataset: { complete: false, current_curation_verified: false } });
});

it("does not return the former universal de novo percentage or deterministic DMD reading-frame rule", async () => {
  expect(await query({ gene: "SCN1A", search: "80%" })).toMatchObject({ total: 0, genes: [] });
  expect(await query({ gene: "DMD", search: "in-frame deletions" })).toMatchObject({ total: 0, genes: [] });
  expect(await query({ gene: "DMD" })).toMatchObject({ genes: [{ hi_description: expect.stringContaining("generally") }] });
});

it.each([
  ["APC", "2021-07-18", "07/19/2021"],
  ["MYH7", "2015-11-15", "11/16/2015"],
])("keeps the %s export date and displayed report date separate", async (gene, csvDate, displayDate) => {
  expect(await query({ gene })).toMatchObject({ genes: [{
    review_date: csvDate, provider_last_evaluated: displayDate,
    description_review: { checked_on: "2026-10-01" },
  }] });
});

it("retains EHMT1's conflicting observations in filtered and direct Code Mode reads", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline subset"));
  const observation = {
    gene_symbol: "EHMT1", hi_score: 3, ts_score: 1, review_date: "2012-07-06",
    provider_last_evaluated: "Awaiting Review",
    score_source_url: "https://search.clinicalgenome.org/kb/gene-dosage/download",
    hi_description: expect.stringContaining("instead says Awaiting Review"),
    ts_description: expect.stringContaining("instead says Awaiting Review"),
    description_review: { status: "source_conflict", checked_on: "2026-10-01", note: expect.stringContaining("/kb/genes/HGNC:24650") },
  };
  expect(await query({ gene: "EHMT1", hi_score: 3, ts_score: 1 })).toMatchObject({ total: 1, genes: [observation] });
  expect(await proxy.handler({ method: "GET", path: "/dosage/genes/{gene_symbol}", params: { gene_symbol: "EHMT1" } }, { sql: () => [] })).toMatchObject(observation);
  expect(await query({ gene: "EHMT1", ts_score: 0 })).toMatchObject({ total: 0, genes: [] });
  expect(fetcher).not.toHaveBeenCalled();
});
