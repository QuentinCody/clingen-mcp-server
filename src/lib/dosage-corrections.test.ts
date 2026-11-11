import { expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const api = createClingenApiFetch();

it.each([
  ["CFTR", "HGNC:1884", -5, "2016-08-22"],
  ["PAH", "HGNC:8582", 0, "2014-08-28"],
  ["DPYD", "HGNC:3012", 0, "2018-01-24"],
])("returns source-reconciled dosage for %s without a stale warning", async (gene, id, ts, date) => {
  const result = await api({ method: "GET", path: `/dosage/genes/${gene}` });
  expect(result.data).toMatchObject({
    gene_symbol: gene, hgnc_id: id, hi_score: 30, ts_score: ts,
    review_date: date, source_checked_on: "2026-09-30",
    source_url: `https://search.clinicalgenome.org/kb/gene-dosage/${id}`,
    _dataset: { complete: false, current_curation_verified: false },
  });
  expect(result.data).not.toHaveProperty("_data_quality_warning");
});

it("keeps unevaluated CFTR out of no-evidence results through the real Code Mode proxy", async () => {
  const proxy = createApiProxyTool({ apiFetch: api, catalog: clingenCatalog, stagingPrefix: "clingen" });
  const query = (params: Record<string, unknown>) => proxy.handler({ method: "GET", path: "/dosage/genes", params }, { sql: () => [] });
  expect(await query({ gene: "CFTR", ts_score: 0 })).toMatchObject({ total: 0, genes: [] });
  expect(await query({ ts_score: -5 })).toMatchObject({ total: 1, genes: [{ gene_symbol: "CFTR", ts_score: -5 }], ts_score_legend: { "-5": "Not yet evaluated" } });
  expect(await query({ hi_score: 30 })).toMatchObject({ total: 3, genes: expect.arrayContaining([
    expect.objectContaining({ gene_symbol: "CFTR" }), expect.objectContaining({ gene_symbol: "PAH" }), expect.objectContaining({ gene_symbol: "DPYD" }),
  ]) });
});

it.each([
  ["HBB", "HGNC:4827", "ISCA-10858"],
  ["CYP2D6", "HGNC:2625", "ISCA-10650"],
  ["UGT1A1", "HGNC:12530", "ISCA-17462"],
  ["G6PD", "HGNC:4057", "ISCA-20465"],
])("preserves the pending native curation for %s without inventing scores or dates", async (gene, id, dosageId) => {
  const result = await api({ method: "GET", path: `/dosage/genes/${gene}` });
  expect(result.data).toMatchObject({
    gene_symbol: gene, hgnc_id: id, dosage_id: dosageId,
    hi_score: null, ts_score: null, review_date: null,
    hi_description: "Awaiting Review", ts_description: "Awaiting Review",
    curation_status: "awaiting_review", provider_curation_status: "Awaiting Review",
    provider_last_evaluated: "Awaiting Review", source_checked_on: "2026-10-01",
    source_url: `https://search.clinicalgenome.org/kb/gene-dosage/${gene}`,
  });
});

it("keeps unpublished SMN1 and unverified TPMT distinct from pending and evaluated results", async () => {
  expect((await api({ method: "GET", path: "/dosage/genes/SMN1" })).data).toMatchObject({
    hi_score: null, ts_score: null, review_date: null, curation_status: "no_published_curation",
    source_url: "https://search.clinicalgenome.org/kb/genes/HGNC:11117",
  });
  const tpmt = (await api({ method: "GET", path: "/dosage/genes/TPMT" })).data;
  expect(tpmt).toMatchObject({
    hi_score: null, ts_score: null, review_date: null, curation_status: "unverified",
    source_note: expect.stringContaining("does not establish absence"),
  });
  expect(tpmt).not.toHaveProperty("provider_curation_status");
});

it("excludes all six unavailable records from numerical filters through Code Mode without fetching", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("must remain embedded"));
  try {
    const proxy = createApiProxyTool({ apiFetch: api, catalog: clingenCatalog, stagingPrefix: "clingen" });
    const query = (params: Record<string, unknown>) => proxy.handler({ method: "GET", path: "/dosage/genes", params }, { sql: () => [] });
    for (const gene of ["SMN1", "HBB", "TPMT", "CYP2D6", "UGT1A1", "G6PD"]) {
      expect(await query({ gene })).toMatchObject({ total: 1, genes: [{ gene_symbol: gene, hi_score: null, ts_score: null, review_date: null }] });
      for (const score of [-5, 0, 1, 2, 3, 30, 40]) {
        expect(await query({ gene, hi_score: score })).toMatchObject({ total: 0, genes: [] });
        expect(await query({ gene, ts_score: score })).toMatchObject({ total: 0, genes: [] });
      }
    }
    expect(await query({ hi_score: 40 })).toMatchObject({ total: 0, genes: [] });
    expect(fetcher).not.toHaveBeenCalled();
  } finally { fetcher.mockRestore(); }
});
