import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
const query = (params: Record<string, unknown>, path = "/validity/curations") =>
  proxy.handler({ method: "GET", path, params }, { sql: () => [] });
afterEach(() => vi.restoreAllMocks());

it.each([
  ["DPYD", "HGNC:3012"], ["TPMT", "HGNC:12014"], ["CYP2D6", "HGNC:2625"],
  ["CYP2C19", "HGNC:2621"], ["CYP2C9", "HGNC:2623"], ["UGT1A1", "HGNC:12530"],
  ["NUDT15", "HGNC:23063"], ["SLCO1B1", "HGNC:10959"],
])("excludes %s uncorroborated validity claims while retaining a source-qualified review notice", async (gene, hgnc) => {
  const expected = { total: 0, curations: [], curation_review: {
    status: "legacy_assertions_not_corroborated", source_checked_on: "2026-10-01",
    excluded_genes: [{ gene_symbol: gene, hgnc_id: hgnc, source_url: `https://search.clinicalgenome.org/kb/genes/${hgnc}` }],
    current_validity_path: "/validity/export", note: expect.stringContaining("not a Refuted or No Known Disease Relationship assertion"),
  }, _dataset: { complete: false, current_curation_verified: false } };
  expect(await query({ gene: gene.toLowerCase(), classification: "Definitive" })).toMatchObject(expected);
  expect(await query({}, `/validity/curations/${gene.toLowerCase()}`)).toMatchObject(expected);
  expect(await query({ search: hgnc.toLowerCase() })).toMatchObject(expected);
});

it("keeps review notices separate from clinical filters and excludes the uncorroborated panel", async () => {
  expect(await query({ gene: "TPMT", classification: "Refuted", disease: "not a disease match", mode_of_inheritance: "AD" })).toMatchObject({
    total: 0, curations: [], curation_review: { notice_scope: expect.stringContaining("not classification, disease or inheritance matches") },
  });
  const panels = await query({}, "/validity/gceps") as { gceps: Record<string, number> };
  expect(panels.gceps).not.toHaveProperty("CPIC Pharmacogenomics GCEP");
  expect(panels.gceps).toMatchObject({
    "General Gene Curation Expert Panel": 14,
    "General Inborn Errors of Metabolism Gene Curation Expert Panel": 2,
    "Congenital Myopathies and Myasthenic Syndromes Gene Curation Expert Panel": 7,
  });
  expect(await query({ search: "CPIC Pharmacogenomics GCEP" })).toMatchObject({ total: 0, curations: [] });
});

it("keeps unrelated and conflicting searches free of irrelevant review notices", async () => {
  expect(await query({ gene: "BRCA1" })).toHaveProperty("curation_review", undefined);
  expect(await query({ gene: "TPMT", search: "CYP2D6" })).toHaveProperty("curation_review", undefined);
  expect(await query({}, "/validity/curations/UNKNOWN")).toMatchObject({
    __api_error: true, data: { error: expect.stringContaining("No gene-disease") },
  });
});

it("preserves G6PD's two distinct X-linked validity assertions instead of converting drug evidence", async () => {
  const result = await query({ gene: "G6PD", mode_of_inheritance: "XL", classification: "Definitive" }) as {
    curations: { mondo_id: string; report_date: string; sop_version: string; report_url: string }[];
  };
  expect(result.curations.map(row => row.mondo_id).sort()).toEqual(["MONDO:0005775", "MONDO:0010480"]);
  expect(result.curations.map(row => [row.report_date, row.sop_version])).toEqual([["2023-06-23", "SOP9"], ["2023-06-23", "SOP9"]]);
  expect(new Set(result.curations.map(row => row.report_url)).size).toBe(2);
  expect(await query({ gene: "G6PD", mode_of_inheritance: "XLR" })).toMatchObject({ total: 0 });
  expect(result).toHaveProperty("curation_review", undefined);
});

it("corrects CACNA1S malignant-hyperthermia validity to Moderate with its real assertion", async () => {
  expect(await query({ gene: "CACNA1S", classification: "Moderate" })).toMatchObject({ total: 1, curations: [{
    disease_name: "malignant hyperthermia, susceptibility to, 5", mondo_id: "MONDO:0011163", classification: "Moderate",
    mode_of_inheritance: "AD", sop_version: "SOP9", report_date: "2023-04-26", source_checked_on: "2026-10-01",
    report_url: "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_22fff996-ca2e-473d-8a57-d2b8ff022a92-2023-04-26T160000.000Z",
  }] });
  expect(await query({ gene: "CACNA1S", classification: "Definitive" })).toMatchObject({ total: 0 });
});

it("keeps RYR1 hyperthermia and dominant/recessive myopathies separate", async () => {
  expect(await query({ gene: "RYR1", disease: "hyperthermia" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0007783", mode_of_inheritance: "AD", classification: "Definitive", report_date: "2020-11-25", sop_version: "SOP8",
  }] });
  for (const [moi, date] of [["AD", "2020-10-26"], ["AR", "2020-07-27"]]) {
    expect(await query({ gene: "RYR1", disease: "myopathy", mode_of_inheritance: moi })).toMatchObject({ total: 1, curations: [{
      mondo_id: "MONDO:0100150", mode_of_inheritance: moi, report_date: date, sop_version: "SOP7",
    }] });
  }
  expect(await query({}, "/validity/curations/RYR1")).toMatchObject({ total: 3 });
});

it("keeps reviewed local lookups offline and leaves other evidence categories available", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  expect(await query({}, "/validity/curations/DPYD")).toMatchObject({ total: 0, curations: [], curation_review: expect.any(Object) });
  expect(await query({}, "/dosage/genes/DPYD")).toMatchObject({ gene_symbol: "DPYD", hi_score: 30 });
  expect(fetcher).not.toHaveBeenCalled();
});
