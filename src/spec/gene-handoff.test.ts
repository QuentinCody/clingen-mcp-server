/// <reference types="node" />
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
import { geneHandoffWorkflow } from "./gene-handoff";

const row = (classification: string, id = "HGNC:3603") => ({ "GENE SYMBOL": "FBN1", "GENE ID (HGNC)": id, "DISEASE ID (MONDO)": "MONDO:0000001", CLASSIFICATION: classification, MOI: "AD", GCEP: "separate panel" });
function fixture() {
  const validity = { records: [row("Disputed"), row("Definitive"), row("Limited", "HGNC:36030"), row("Disputed")] };
  const g2p = { gene_symbol: "FBN1", records_summary: [{ stable_id: "G2P01013", confidence: "limited", genotype: "monoallelic_autosomal" }] };
  const record = { stable_id: "G2P01013", locus: { gene_symbol: "FBN1", ids: { HGNC: "HGNC:3603" } }, disease: { ontology_terms: ["retained native terms"] }, genotype: "monoallelic_autosomal", confidence: "limited" };
  const api = { get: vi.fn().mockResolvedValueOnce(validity).mockResolvedValueOnce(g2p).mockResolvedValue(record), query: vi.fn() };
  return { validity, g2p, record, api };
}
const run = (api: unknown, code = geneHandoffWorkflow.code) => runInNewContext(`(async()=>{${code}})()`, { api });

it("matches HGNC exactly and preserves disputed, repeated and differently qualified assertions", async () => {
  const f = fixture(); const result = await run(f.api);
  expect(result.validity_selection.rows).toEqual([f.validity.records[0], f.validity.records[1], f.validity.records[3]]);
  expect(result.g2p).toEqual(f.g2p); expect(result.g2p_record).toEqual(f.record); expect(result.g2p_selection.gene_identity_verified).toBe(true);
  expect(result.disease_equivalence_verified).toBe(false); expect(f.api.get).toHaveBeenCalledTimes(3);
});

it("checks overflow without claiming a capped selection is complete", async () => {
  const f = fixture(); f.validity.records = Array.from({ length: 105 }, () => row("Disputed"));
  const result = await run(f.api); expect(result.validity_selection.rows).toHaveLength(100); expect(result.validity_selection.more_matches).toBe(true);
});

it("queries the current staged export with exact HGNC identity and an overflow row", async () => {
  const f = fixture(); f.api.get.mockReset().mockResolvedValueOnce({ __staged: true, data_access_id: "export" }).mockResolvedValueOnce(f.g2p);
  f.api.query.mockResolvedValue({ results: [row("Disputed")] });
  expect((await run(f.api)).validity_selection.rows).toEqual([row("Disputed")]);
  expect(f.api.query).toHaveBeenCalledWith("export", 'SELECT * FROM validity_curations WHERE "GENE ID (HGNC)" = \'HGNC:3603\' LIMIT 101');
});

it("preserves both source and recursively staged query handles", async () => {
  const f = fixture(); const staged = { __staged: true, data_access_id: "export" }; f.api.get.mockReset().mockResolvedValueOnce(staged).mockResolvedValueOnce(f.g2p);
  const query = { __staged: true, data_access_id: "query" }; f.api.query.mockResolvedValue(query);
  expect(await run(f.api)).toMatchObject({ validity: staged, validity_query: query, validity_selection: { status: "inspect_staged_query" } });
});

it.each([0, 1])("retains a successful peer when source %s fails", async failing => {
  const f = fixture(); const values = [f.validity, f.g2p] as unknown[]; values[failing] = { __api_error: true, status: 503, data_access_id: "error-source" };
  f.api.get.mockReset().mockResolvedValueOnce(values[0]).mockResolvedValueOnce(values[1]);
  expect(await run(f.api)).toMatchObject({ __api_error: true, validity: values[0], g2p: values[1] });
});

it("does not report a rejected provider read as an empty source", async () => {
  const f = fixture(); f.api.get.mockReset().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(f.g2p);
  expect(await run(f.api)).toMatchObject({ __api_error: true, g2p: f.g2p, validity: { __api_error: true, message: "offline" } });
});

it("labels no match only within the retrieved export", async () => {
  const f = fixture(); f.validity.records = [row("Definitive", "HGNC:999")];
  expect((await run(f.api)).validity_selection.status).toBe("no_match_in_retrieved_export");
});

it.each([null, { records: null }, { __staged: true, data_access_id: "export" }])("does not silently accept malformed export/query shapes %#", async validity => {
  const f = fixture(); f.api.get.mockReset().mockResolvedValueOnce(validity).mockResolvedValueOnce(f.g2p); f.api.query.mockResolvedValue({});
  expect((await run(f.api)).__api_error).toBe(true);
});

it("rejects a G2P symbol mismatch while retaining its native response", async () => {
  const f = fixture(); f.g2p.gene_symbol = "ADAMTSL4";
  expect(await run(f.api)).toMatchObject({ __api_error: true, g2p: f.g2p });
});

it("retains a symbol change under a matching HGNC ID without pretending the symbols match", async () => {
  const f = fixture(); f.validity.records[0]["GENE SYMBOL"] = "OLDER_SYMBOL";
  expect((await run(f.api)).validity_selection.symbol_matches).toEqual([false, true, true]);
});

it("does not fetch an unobserved G2P stable ID or choose a different record", async () => {
  const f = fixture(); f.g2p.records_summary[0].stable_id = "G2P99999";
  expect((await run(f.api)).g2p_selection).toEqual({ status: "selected_record_not_observed", gene_identity_verified: false });
  expect(f.api.get).toHaveBeenCalledTimes(2);
});

it.each(["wrong-hgnc", "wrong-stable-id"])("rejects %s in the full record", async kind => {
  const f = fixture(); if (kind === "wrong-hgnc") f.record.locus.ids.HGNC = "HGNC:36030"; else f.record.stable_id = "G2P99999";
  expect(await run(f.api)).toMatchObject({ __api_error: true, g2p_record: f.record });
});

it("keeps staged full G2P evidence pending inspection without claiming identity", async () => {
  const f = fixture(); f.api.get.mockReset().mockResolvedValueOnce(f.validity).mockResolvedValueOnce(f.g2p).mockResolvedValue({ __staged: true, data_access_id: "g2p-record" });
  expect((await run(f.api)).g2p_selection).toEqual({ status: "inspect_staged_record", gene_identity_verified: false });
});
