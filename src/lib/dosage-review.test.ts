import { expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({
  apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen",
});
const query = (params: Record<string, unknown>) =>
  proxy.handler({ method: "GET", path: "/dosage/genes", params }, { sql: () => [] });

// Dates from the official gene-only dosage CSV inspected 2026-10-01.
// https://search.clinicalgenome.org/kb/gene-dosage/download
it.each([
  ["FBN1", "2019-12-04"],
  ["SHANK3", "2018-08-14"],
  ["MECP2", "2021-02-22"],
  ["RAI1", "2020-10-13"],
  ["PMP22", "2012-07-12"],
  ["SCN1A", "2012-07-06"],
  ["BRCA1", "2021-09-23"],
  ["TP53", "2021-11-10"],
  ["NF1", "2023-02-12"],
  ["PTEN", "2020-06-24"],
  ["RB1", "2021-03-09"],
  ["KCNQ1", "2020-10-13"],
  ["PKD1", "2020-06-10"],
  ["MYH7", "2015-11-15"],
  ["LMNA", "2023-12-14"],
  ["TSC1", "2020-10-13"],
  ["TSC2", "2020-06-10"],
  ["DMD", "2019-11-20"],
  ["APC", "2021-07-18"],
  ["FOXG1", "2021-03-09"],
  ["MBD5", "2025-08-29"],
  ["EHMT1", "2012-07-06"],
  ["KANSL1", "2013-04-11"],
  ["DYRK1A", "2020-12-16"],
])("returns the reconciled %s evaluation date and gene-level scores through Code Mode", async (gene, date) => {
  expect(await query({ gene })).toMatchObject({
    total: 1,
    genes: [{
      gene_symbol: gene, hi_score: gene === "MYH7" ? 0 : 3,
      ts_score: gene === "EHMT1" ? 1 : 0, review_date: date,
      source_url: expect.stringMatching(/^https:\/\/search\.clinicalgenome\.org\/kb\/gene-dosage\/HGNC:\d+$/),
      source_checked_on: "2026-10-01",
    }],
    _dataset: { complete: false, current_curation_verified: false },
  });
});

it("does not promote regional duplication evidence to gene-level triplosensitivity", async () => {
  for (const gene of ["SHANK3", "MECP2", "RAI1", "PMP22", "FOXG1", "MBD5", "DYRK1A"]) {
    expect(await query({ gene, ts_score: 0 })).toMatchObject({ total: 1, genes: [{
      gene_symbol: gene, ts_score: 0, ts_description: expect.stringMatching(/^No evidence for triplosensitivity\./),
    }] });
    for (const ts_score of [1, 2, 3]) {
      expect(await query({ gene, ts_score })).toMatchObject({ total: 0, genes: [] });
    }
  }
  expect(await query({ ts_score: 1 })).toMatchObject({ total: 1, genes: [{ gene_symbol: "EHMT1" }] });
});

it("retains HTT's ongoing primary review separately from evaluated no-evidence scores", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("embedded only"));
  try {
    expect(await query({ gene: "HTT" })).toMatchObject({ total: 1, genes: [{
      gene_symbol: "HTT", hgnc_id: "HGNC:4851", hi_score: null, ts_score: null, review_date: null,
      curation_status: "under_primary_review", provider_curation_status: "Under Primary Review",
      provider_last_evaluated: "Under Primary Review", dosage_id: "ISCA-31043",
      source_url: "https://search.clinicalgenome.org/kb/gene-dosage/HTT", source_checked_on: "2026-10-01",
    }] });
    for (const score of [-5, 0, 1, 2, 3, 30, 40]) {
      expect(await query({ gene: "HTT", hi_score: score })).toMatchObject({ total: 0, genes: [] });
      expect(await query({ gene: "HTT", ts_score: score })).toMatchObject({ total: 0, genes: [] });
    }
    expect(await query({ hi_score: 0 })).toMatchObject({ total: 1, genes: [{ gene_symbol: "MYH7" }] });
    expect(fetcher).not.toHaveBeenCalled();
  } finally { fetcher.mockRestore(); }
});
