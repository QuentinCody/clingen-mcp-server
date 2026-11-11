import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";

const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
const query = (params: Record<string, unknown>, path = "/validity/curations") =>
  proxy.handler({ method: "GET", path, params }, { sql: () => [] });
afterEach(() => vi.restoreAllMocks());

// Independent expectations from official ClinGen summaries/reports, reviewed 2026-10-01.
it.each([
  ["PKD1", 2], ["PKD2", 1], ["COL4A5", 1], ["CFTR", 1], ["PAH", 1], ["GAA", 1],
  ["GBA1", 2], ["HBB", 6], ["F5", 2], ["SCN1A", 4], ["MECP2", 1], ["FMR1", 1],
  ["HTT", 1], ["NF1", 2], ["NF2", 1], ["FGFR3", 7], ["DMD", 1], ["SHANK3", 1],
  ["RAI1", 1], ["RET", 2], ["MEN1", 1], ["PMP22", 2],
])("exposes all reviewed %s assertions through collection and gene detail", async (gene, count) => {
  const result = await query({ gene }) as { curations: { report_url: string; source_checked_on: string }[] };
  expect(result).toMatchObject({ total: count, _dataset: { complete: false, current_curation_verified: false } });
  expect(new Set(result.curations.map(row => row.report_url)).size).toBe(count);
  expect(result.curations.every(row => ["2026-10-01", "2026-10-03"].includes(row.source_checked_on))).toBe(true);
  expect(await query({}, `/validity/curations/${String(gene).toLowerCase()}`)).toMatchObject({ total: count });
});

it.each([
  ["PKD1", "AD", "MONDO:0004691", "2021-02-26", "SOP6"],
  ["PKD1", "AR", "MONDO:0009889", "2023-01-11", "SOP9"],
  ["GBA1", "AD", "MONDO:0005180", "2022-05-03", "SOP8"],
  ["GBA1", "AR", "MONDO:0018150", "2020-06-24", "SOP10"],
  ["F5", "AD", "MONDO:0008560", "2019-09-30", "SOP6"],
  ["F5", "AR", "MONDO:0009210", "2020-03-25", "SOP6"],
])("keeps %s %s disease identity, report date and SOP separate", async (gene, moi, mondo, date, sop) => {
  expect(await query({ gene, mode_of_inheritance: moi })).toMatchObject({ total: 1, curations: [{
    mondo_id: mondo, mode_of_inheritance: moi, report_date: date, sop_version: sop,
  }] });
});

it("retains all six HBB entities and the provider's obsolete ontology warning", async () => {
  const result = await query({ gene: "HBB" }) as { curations: { mondo_id: string }[] };
  expect(result.curations.map(row => row.mondo_id).sort()).toEqual([
    "MONDO:0011381", "MONDO:0013517", "MONDO:0017146", "MONDO:0018023", "MONDO:0020459", "MONDO:0054801",
  ]);
  expect(await query({ gene: "HBB", disease: "sickle" })).toMatchObject({ total: 1, curations: [{
    disease_name: "obsolete sickle cell disease and related diseases", mondo_id: "MONDO:0017146",
    mondo_status: "obsolete", classification: "Definitive", mode_of_inheritance: "AR", report_date: "2023-08-23", sop_version: "SOP9",
  }] });
  expect(await query({ gene: "HBB", mode_of_inheritance: "AD" })).toMatchObject({ total: 4 });
  expect(await query({ gene: "HBB", mode_of_inheritance: "AR" })).toMatchObject({ total: 2 });
  expect(await query({ search: "MONDO:0011382" })).toMatchObject({ total: 0 });
});

it.each([
  ["MECP2", "MONDO:0010726", "2018-05-02", "SOP5"],
  ["FMR1", "MONDO:0010383", "2019-06-03", "SOP6"],
  ["DMD", "MONDO:0016106", "2024-11-14", "SOP11"],
])("preserves the provider's XL classification for %s without assigning XLD or XLR", async (gene, mondo, date, sop) => {
  expect(await query({ gene, mode_of_inheritance: "XL" })).toMatchObject({ total: 1, curations: [{
    mondo_id: mondo, report_date: date, sop_version: sop, mode_of_inheritance: "XL",
  }] });
  for (const moi of ["XLD", "XLR"]) expect(await query({ gene, mode_of_inheritance: moi })).toMatchObject({ total: 0 });
});

it("preserves Moderate SCN1A migraine and FGFR3 semidominant CATSHL assertions", async () => {
  expect(await query({ gene: "SCN1A", disease: "migraine" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0000700", classification: "Moderate", report_date: "2021-09-14",
  }] });
  expect(await query({ gene: "SCN1A", disease: "Dravet" })).toMatchObject({ total: 1, curations: [{ mondo_id: "MONDO:0100135" }] });
  expect(await query({ gene: "FGFR3", mode_of_inheritance: "SD" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0012504", classification: "Moderate", report_date: "2026-08-24", sop_version: "SOP12",
  }] });
  expect(await query({ gene: "FGFR3", classification: "Moderate" })).toMatchObject({ total: 2 });
  expect(await query({ gene: "SCN1A", disease: "migraine", classification: "Definitive" })).toMatchObject({ total: 0 });
});

it("keeps NF1 ovarian absence-of-known-relationship distinct from its Definitive neurofibromatosis", async () => {
  expect(await query({ gene: "NF1", disease: "ovarian" })).toMatchObject({ total: 1, curations: [{
    mondo_id: "MONDO:0016248", classification: "No Known Disease Relationship", report_date: "2017-02-22", sop_version: "SOP4",
  }] });
  expect(await query({ gene: "NF1", classification: "Definitive" })).toMatchObject({ total: 1, curations: [{ mondo_id: "MONDO:0018975" }] });
  expect(await query({ gene: "NF1", classification: "Refuted" })).toMatchObject({ total: 0 });
});

it("retains NF2's SOP and full classification timestamp from the verified current CSV", async () => {
  expect(await query({ gene: "NF2" })).toMatchObject({ total: 1, curations: [{
    disease_name: "NF2-related schwannomatosis", mondo_id: "MONDO:0007039", classification: "Definitive",
    report_date: "2019-02-27T17:00:00.000Z", sop_version: "SOP6", source_url: "https://search.clinicalgenome.org/kb/gene-validity/download",
    source_review_note: expect.stringContaining("official CSV"),
  }] });
  expect(await query({ search: "MONDO:0016756" })).toMatchObject({ total: 0 });
});

it.each([
  ["SMN1", "HGNC:11117", "not yet published"],
  ["TSC1", "HGNC:12362", "dosage sensitivity and clinical actionability"],
  ["TSC2", "HGNC:12363", "dosage sensitivity and clinical actionability"],
])("removes %s's uncorroborated validity claim while returning an evidence-specific review notice", async (gene, hgnc, note) => {
  const expected = { total: 0, curations: [], curation_review: {
    status: "legacy_assertions_not_corroborated", excluded_genes: [{
      gene_symbol: gene, hgnc_id: hgnc, review_note: expect.stringContaining(note),
      source_url: `https://search.clinicalgenome.org/kb/genes/${hgnc}`,
    }], note: expect.stringContaining("not a Refuted or No Known Disease Relationship assertion"),
  } };
  expect(await query({ gene, classification: "Definitive" })).toMatchObject(expected);
  expect(await query({}, `/validity/curations/${gene}`)).toMatchObject(expected);
  expect(await query({ search: hgnc.toLowerCase() })).toMatchObject(expected);
  expect(await query({ gene, search: "unrelated" })).toHaveProperty("curation_review", undefined);
});

it("retains dosage evidence for excluded TSC genes and preserves PGx-specific review context", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
  for (const gene of ["TSC1", "TSC2"]) {
    expect(await query({}, `/dosage/genes/${gene}`)).toMatchObject({ gene_symbol: gene, hi_score: 3 });
  }
  expect(await query({ gene: "TPMT" })).toMatchObject({ curation_review: {
    excluded_genes: [{ review_note: expect.stringContaining("CPIC/ClinPGx") }],
  } });
  expect(fetcher).not.toHaveBeenCalled();
});

it("stages the expanded embedded subset with every assertion, warning and review notice intact", async () => {
  const stored: unknown[] = [];
  const ns = { idFromName: (name: string) => name, get: () => ({ fetch: async (req: Request) => {
    if (new URL(req.url).pathname === "/process") {
      stored.push((await req.json() as { data: unknown }).data);
      return Response.json({ success: true, tables_created: ["curations"], total_rows: 117, input_rows: 117, table_row_counts: { curations: 117 } });
    }
    return Response.json({ success: true, schema: { tables: { curations: { columns: [{ name: "mondo_status" }] } } } });
  } }) } as unknown as DurableObjectNamespace;
  const stagingProxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog,
    doNamespace: ns, stagingPrefix: "clingen", maxInlineBytes: 30 * 1024 });
  const result = await stagingProxy.handler({ method: "GET", path: "/validity/curations" }, { sql: () => [] });
  expect(result).toMatchObject({ __staged: true, data_access_id: expect.any(String) });
  const canonical = JSON.parse(stored[0] as string);
  expect(canonical).toMatchObject({ total: 117, _dataset: { complete: false, current_curation_verified: false } });
  expect(canonical.curations).toHaveLength(117);
  expect(canonical.curation_review.excluded_genes).toHaveLength(11);
  expect(canonical.curations).toContainEqual(expect.objectContaining({ mondo_id: "MONDO:0017146", mondo_status: "obsolete" }));
  expect(canonical.curations).toContainEqual(expect.objectContaining({ gene_symbol: "NF2", sop_version: "SOP6" }));
  expect(canonical.curations.every((row: { report_url: string; source_checked_on: string }) =>
    row.source_checked_on && !row.report_url.includes("/HGNC:"))).toBe(true);
  expect(new TextEncoder().encode(stored[0] as string).byteLength).toBeGreaterThan(30 * 1024);
  expect(new TextEncoder().encode(JSON.stringify(result)).byteLength).toBeLessThan(30 * 1024);
  expect(stored[1]).toEqual(canonical);
});
