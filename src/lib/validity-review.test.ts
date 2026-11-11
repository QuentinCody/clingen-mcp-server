import { expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
const query = (params: Record<string, unknown>, path = "/validity/curations") =>
  proxy.handler({ method: "GET", path, params }, { sql: () => [] });

// Independent expected identities/dates from the official CSV, reviewed 2026-10-01:
// https://search.clinicalgenome.org/kb/gene-validity/download
it.each([
  ["PALB2", "MONDO:0700272", "SOP10", "2024-08-29T17:00:00.000Z"],
  ["ATM", "MONDO:0700270", "SOP11", "2024-11-22T18:00:00.000Z"],
  ["CHEK2", "MONDO:0700271", "SOP10", "2024-11-04T18:00:00.000Z"],
  ["CDH1", "MONDO:0100488", "SOP10", "2024-03-22T17:00:00.000Z"],
])("returns the reviewed %s cancer assertion through the Code Mode proxy", async (gene, mondo, sop, date) => {
  expect(await query({ gene, classification: "Definitive", mode_of_inheritance: "AD" })).toMatchObject({
    total: 1, curations: [{ gene_symbol: gene, mondo_id: mondo, sop_version: sop,
      report_date: date, classification: "Definitive", source_checked_on: "2026-10-01",
      gcep: "Hereditary Cancer Gene Curation Expert Panel",
      report_url: expect.stringMatching(/\/CGGV:assertion_[a-f0-9-]+-2024-/),
    }], _dataset: { complete: false, current_curation_verified: false },
  });
  expect(await query({ gene, classification: "Moderate" })).toMatchObject({ total: 0, curations: [] });
  expect(await query({ gene, classification: "Strong" })).toMatchObject({ total: 0, curations: [] });
});

it.each([
  ["PALB2", "MONDO:0012565", "Fanconi anemia complementation group N"],
  ["ATM", "MONDO:0008840", "ataxia telangiectasia"],
])("keeps %s recessive disease separate from dominant cancer predisposition", async (gene, mondo, disease) => {
  expect(await query({ gene, mode_of_inheritance: "AR" })).toMatchObject({ total: 1,
    curations: [{ mondo_id: mondo, disease_name: disease, mode_of_inheritance: "AR", classification: "Definitive" }],
  });
  expect(await query({}, `/validity/curations/${gene.toLowerCase()}`)).toMatchObject({ total: 2 });
});

it("does not transfer CHEK2 cancer-predisposition validity to ovarian or colon assertions", async () => {
  expect(await query({ gene: "CHEK2", disease: "ovarian" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0016248", classification: "Refuted", report_date: "2024-11-04T18:00:00.000Z",
  }] });
  expect(await query({ gene: "CHEK2", disease: "colon" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0018630", classification: "Limited", report_date: "2017-03-13T00:00:00",
    gcep: "Breast/Ovarian Cancer Gene Curation Expert Panel",
  }] });
  expect(await query({}, "/validity/curations/CHEK2")).toMatchObject({ total: 3 });
});

it("exposes No Known Disease Relationship without converting it to Refuted", async () => {
  const nativeLabel = "No Known Disease Relationship";
  expect(clingenCatalog.endpoints.find(e => e.path === "/validity/curations")?.queryParams?.find(p => p.name === "classification")?.enum).toContain(nativeLabel);
  expect(await query({ gene: "CDH1", classification: nativeLabel })).toMatchObject({ total: 1, curations: [{
    disease_name: "familial ovarian cancer", classification: nativeLabel, mondo_id: "MONDO:0016248",
    report_date: "2017-08-03T00:00:00", report_url: "https://search.clinicalgenome.org/kb/gene-validity/CGGCIEX:assertion_8503",
  }] });
  expect(await query({ gene: "CDH1", classification: "Refuted" })).toMatchObject({ total: 0 });
  expect(await query({}, "/validity/classifications")).toMatchObject({ classifications: { [nativeLabel]: 2 } });
  expect(await query({}, "/validity/gceps")).toMatchObject({ gceps: {
    "Hereditary Cancer Gene Curation Expert Panel": 31,
    "Breast/Ovarian Cancer Gene Curation Expert Panel": 3,
  } });
});

it("keeps corrected embedded lookups offline with distinct assertion IDs and explicit subset scope", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  try {
    const result = await query({ search: "HGNC:16627" }) as {curations: {report_url: string}[]};
    expect(new Set(result.curations.map(r => r.report_url)).size).toBe(3);
    expect(fetcher).not.toHaveBeenCalled();
    expect(result).toMatchObject({ _dataset: { kind: "embedded_subset", complete: false, current_curation_verified: false } });
  } finally { fetcher.mockRestore(); }
});
