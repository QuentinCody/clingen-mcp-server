import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
const query = (params: Record<string, unknown>, path = "/validity/curations") =>
  proxy.handler({ method: "GET", path, params }, { sql: () => [] });
afterEach(() => vi.restoreAllMocks());

// Independently transcribed expectations from ClinGen gene summaries and
// assertion reports, reviewed 2026-10-01. No completeness claim beyond these genes.
it.each([
  ["FBN1", 2], ["MYH7", 5], ["MYBPC3", 5], ["LMNA", 3], ["TTN", 7],
  ["KCNQ1", 4], ["KCNH2", 3], ["SCN5A", 4], ["DSP", 2], ["PKP2", 4],
])("preserves each reviewed %s assertion in Code Mode collection and detail queries", async (gene, count) => {
  const result = await query({ gene }) as { curations: { report_url: string; source_checked_on: string }[] };
  expect(result).toMatchObject({ total: count, _dataset: { complete: false, current_curation_verified: false } });
  expect(new Set(result.curations.map(row => row.report_url)).size).toBe(count);
  expect(result.curations.every(row => ["2026-10-01", "2026-10-03"].includes(row.source_checked_on))).toBe(true);
  expect(await query({}, `/validity/curations/${String(gene).toLowerCase()}`)).toMatchObject({ total: count });
});

it.each([
  ["MYH7", "MONDO:0013262"], ["LMNA", "MONDO:0007269"],
  ["TTN", "MONDO:0011400"], ["SCN5A", "MONDO:0011003"],
])("uses %s's disease-specific 2026 dilated-cardiomyopathy assertion", async (gene, mondo) => {
  expect(await query({ gene, disease: "dilated", classification: "Definitive" })).toMatchObject({
    total: 1, curations: [{ mondo_id: mondo, report_date: "2026-03-04", sop_version: "SOP7", mode_of_inheritance: "AD" }],
  });
});

it.each([
  ["FBN1", "Shprintzen", "MONDO:0008426", "Disputed"],
  ["MYH7", "arrhythmogenic", "MONDO:0016587", "Limited"],
  ["TTN", "arrhythmogenic", "MONDO:0016587", "Disputed"],
  ["KCNQ1", "hypertrophic", "MONDO:0005045", "Disputed"],
  ["KCNH2", "Brugada", "MONDO:0015263", "Disputed"],
  ["SCN5A", "congenital", "MONDO:0005453", "Disputed"],
  ["DSP", "hypertrophic", "MONDO:0005045", "Disputed"],
  ["PKP2", "dilated", "MONDO:0005021", "Disputed"],
])("does not transfer %s Definitive evidence to its %s relationship", async (gene, disease, mondo, classification) => {
  expect(await query({ gene, disease })).toMatchObject({ total: 1, curations: [{ mondo_id: mondo, classification }] });
  expect(await query({ gene, disease, classification: "Definitive" })).toMatchObject({ total: 0 });
});

it("keeps dominant and recessive MYBPC3 dilated-cardiomyopathy assertions distinct", async () => {
  for (const [moi, date] of [["AD", "2026-03-04"], ["AR", "2025-05-16"]]) {
    expect(await query({ gene: "MYBPC3", disease: "dilated", mode_of_inheritance: moi })).toMatchObject({
      total: 1, curations: [{ mondo_id: "MONDO:0005021", classification: "Limited", mode_of_inheritance: moi, report_date: date, sop_version: "SOP10" }],
    });
  }
  expect(await query({ gene: "MYBPC3", disease: "dilated", classification: "Definitive" })).toMatchObject({ total: 0 });
});

it("preserves semidominant LMNA lipodystrophy and recessive KCNQ1 hearing-loss evidence", async () => {
  expect(await query({ gene: "LMNA", mode_of_inheritance: "SD" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0006573", disease_name: "lipodystrophy", report_date: "2024-10-09", sop_version: "SOP11",
  }] });
  expect(await query({ gene: "KCNQ1", mode_of_inheritance: "AR" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0002441", disease_name: "Jervell and Lange-Nielsen syndrome", report_date: "2017-12-19", sop_version: "SOP8",
  }] });
  expect(await query({ gene: "KCNQ1", disease: "short QT" })).toMatchObject({ total: 1, curations: [{ classification: "Strong" }] });
});

it("preserves TTN's separate Moderate myopathies and Limited hypertrophic assertion", async () => {
  const moderate = await query({ gene: "TTN", classification: "Moderate" }) as { curations: { mondo_id: string }[] };
  expect(moderate.curations.map(row => row.mondo_id).sort()).toEqual(["MONDO:0010870", "MONDO:1060225"]);
  expect(await query({ gene: "TTN", disease: "hypertrophic" })).toMatchObject({ total: 1, curations: [{
    classification: "Limited", report_date: "2025-10-28", sop_version: "SOP11",
  }] });
});

it("corrects FBN1, DSP and SCN5A disease identities without substituting legacy labels", async () => {
  expect(await query({ gene: "FBN1", classification: "Definitive" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0019625", disease_name: "familial thoracic aortic aneurysm and aortic dissection",
    report_date: "2017-01-23", sop_version: "SOP4",
    report_url: "https://search.clinicalgenome.org/kb/gene-validity/CGGCIEX:assertion_8251",
  }] });
  expect(await query({ gene: "DSP", classification: "Definitive" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0011581", disease_name: "arrhythmogenic cardiomyopathy with wooly hair and keratoderma",
  }] });
  expect(await query({ gene: "SCN5A", disease: "cardiac rhythm disorder" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:1010181", disease_name: "SCN5A-related cardiac rhythm disorder", report_date: "2025-10-08",
  }] });
  expect(await query({ gene: "SCN5A", disease: "long QT syndrome 3" })).toMatchObject({ total: 0 });
});

it("uses displayed dates rather than report-URL timestamps and keeps embedded queries offline", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  expect(await query({ gene: "MYH7", disease: "dilated" })).toMatchObject({ total: 1, curations: [{
    report_date: "2026-03-04",
    report_url: "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_4ec27d4f-70ea-4c6a-ad67-d6260ecadcde-2026-03-04T170000.000Z",
  }] });
  expect(await query({ search: "HGNC:9024" })).toMatchObject({ total: 4 });
  expect(fetcher).not.toHaveBeenCalled();
});
