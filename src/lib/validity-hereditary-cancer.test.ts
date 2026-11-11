import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
const query = (params: Record<string, unknown>, path = "/validity/curations") =>
  proxy.handler({ method: "GET", path, params }, { sql: () => [] });
afterEach(() => vi.restoreAllMocks());

// Expected identities and classifications independently transcribed from the
// ClinGen gene summary and linked assertion reports, reviewed 2026-10-01.
it.each([
  ["BRCA1", "MONDO:0700268", "2024-08-29", "SOP10"],
  ["BRCA2", "MONDO:0700269", "2024-08-29", "SOP10"],
  ["TP53", "MONDO:0018875", "2024-03-22", "SOP10"],
  ["MLH1", "MONDO:0005835", "2022-06-20", "SOP9"],
  ["MSH2", "MONDO:0005835", "2022-06-20", "SOP9"],
  ["MSH6", "MONDO:0005835", "2023-07-05", "SOP9"],
  ["RB1", "MONDO:0008380", "2020-07-30", "SOP7"],
  ["PTEN", "MONDO:0017623", "2024-04-05", "SOP10"],
  ["VHL", "MONDO:0008667", "2020-05-14", "SOP7"],
])("returns %s with its source-checked dominant disease identity through Code Mode", async (gene, mondo, date, sop) => {
  expect(await query({ gene, classification: "Definitive", mode_of_inheritance: "AD" })).toMatchObject({
    total: 1, curations: [{ mondo_id: mondo, report_date: date, sop_version: sop,
      gcep: "Hereditary Cancer Gene Curation Expert Panel", source_checked_on: "2026-10-01",
      report_url: expect.stringContaining("/gene-validity/CGGV:assertion_"),
    }], _dataset: { kind: "embedded_subset", complete: false, current_curation_verified: false },
  });
});

it.each([
  ["BRCA1", "MONDO:0054748", "2020-05-14", 2],
  ["BRCA2", "MONDO:0011584", "2019-04-19", 2],
  ["MLH1", "MONDO:0010159", "2018-10-09", 3],
  ["MSH2", "MONDO:0010159", "2018-10-09", 3],
  ["MSH6", "MONDO:0010159", "2018-10-09", 3],
])("keeps %s recessive assertions separate and exposes them through gene detail", async (gene, mondo, date, count) => {
  expect(await query({ gene, mode_of_inheritance: "AR" })).toMatchObject({ total: 1,
    curations: [{ mondo_id: mondo, report_date: date, mode_of_inheritance: "AR", classification: "Definitive" }],
  });
  expect(await query({}, `/validity/curations/${String(gene).toLowerCase()}`)).toMatchObject({ total: count });
});

it.each([
  ["MLH1", "Refuted", "2023-12-21"],
  ["MSH2", "Refuted", "2023-03-14"],
  ["MSH6", "Disputed", "2023-12-21"],
])("does not transfer %s Lynch-syndrome evidence to hereditary breast carcinoma", async (gene, classification, date) => {
  expect(await query({ gene, disease: "breast" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0016419", classification, report_date: date, mode_of_inheritance: "AD",
  }] });
  expect(await query({ gene, disease: "breast", classification: "Definitive" })).toMatchObject({ total: 0 });
});

it.each([
  ["APC", "MONDO:0021057", "MONDO:0017790"],
  ["WT1", "MONDO:0008679", "MONDO:0008682"],
])("preserves the two separately curated %s disease entities", async (gene, first, second) => {
  const result = await query({ gene }) as { curations: { mondo_id: string; report_url: string }[] };
  expect(result.curations.map(row => row.mondo_id).sort()).toEqual([first, second].sort());
  expect(new Set(result.curations.map(row => row.report_url)).size).toBe(2);
});

it("uses the BRCA2 displayed classification date rather than inferring it from its report URL", async () => {
  expect(await query({ gene: "BRCA2", mode_of_inheritance: "AR" })).toMatchObject({ curations: [{
    report_date: "2019-04-19", report_url: "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_48faf04b-ffc4-4163-8570-22f5c29c4064-2019-04-19T160000.000Z",
  }] });
});

it("removes obsolete disease IDs from reviewed genes and keeps embedded reads offline", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  for (const mondo of ["MONDO:0003582", "MONDO:0007903", "MONDO:0005618", "MONDO:0021056", "MONDO:0006669", "MONDO:0008668", "MONDO:0006058"]) {
    expect(await query({ search: mondo })).toMatchObject({ total: 0, curations: [] });
  }
  expect(await query({ search: "HGNC:7127" })).toMatchObject({ total: 3 });
  expect(fetcher).not.toHaveBeenCalled();
});
