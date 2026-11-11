import { afterEach, describe, expect, it, vi } from "vitest";
import { actionabilityRequest, columnarRows, fetchActionability } from "./actionability";
import { createClingenApiFetch } from "./api-adapter";

afterEach(() => vi.unstubAllGlobals());
const request = { method: "GET" as const, path: "/actionability/Adult/summ" };
const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "content-type": "application/json", etag: '"fixture"' } });

describe("official actionability routes", () => {
  it.each(["Adult", "Pediatric"])("keeps %s context explicit for all linked representations", context => {
    const base = `https://actionability.clinicalgenome.org/ac/${context}/api/summ`;
    expect(actionabilityRequest({ ...request, path: `/actionability/${context}/summ` }).url).toBe(base);
    expect(actionabilityRequest({ ...request, path: `/actionability/${context}/summ`, params: { flavor: "flat" } }).url).toBe(`${base}?flavor=flat`);
    expect(actionabilityRequest({ ...request, path: `/actionability/${context}/assertions` }).url).toBe(`${base}/assertion?format=tsv`);
    expect(actionabilityRequest({ ...request, path: `/actionability/${context}/assertions`, params: { assertion_type: "all" } }).url).toBe(`${base}/assertion?assertionType=all&format=tsv`);
  });
  it.each([
    { method: "POST" as const }, { body: {} }, { path: "/actionability/adult/summ" },
    { path: "/actionability/Adult/../summ" }, { params: { gene: "PHEX" } },
    { params: { page: 1 } }, { params: { flavor: "csv" } },
    { params: { expected_sha256: "latest" } },
    { path: "/actionability/Pediatric/assertions", params: { assertion_type: "strong" } },
  ])("rejects unsupported requests before network access: %j", async change => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(fetchActionability({ ...request, ...change }, fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

it("preserves all synthetic source fields, including distinct dates, classification and report version", async () => {
  // Synthetic schema; a live provider JSON body was unavailable during implementation.
  const raw = { reports: [{ gene: "PHEX", classification: "Limited", curationDate: "2026-03-02", version: "2.0.0", futureField: { score: null } }], errors: [] };
  const fetcher = vi.fn<typeof fetch>(async () => json(raw));
  const result = await fetchActionability(request, fetcher);
  expect(result.data).toMatchObject({ context: "Adult", raw_response: raw, etag: '"fixture"', evidence_domain: "clinical_actionability", response_sha256: expect.stringMatching(/^[a-f0-9]{64}$/) });
  expect(result.data).toMatchObject({ raw_json: JSON.stringify(raw) });
  expect(result.data).not.toHaveProperty("curation_date");
  expect(fetcher.mock.calls[0][1]).toMatchObject({ method: "GET", redirect: "manual", signal: expect.any(AbortSignal) });
});

it("hashes the complete retrieved representation and rejects snapshot drift", async () => {
  const first = await fetchActionability(request, async () => json({ records: [] }));
  const params = { expected_sha256: first.data.response_sha256.toUpperCase() };
  await expect(fetchActionability({ ...request, params }, async () => json({ records: [] }))).resolves.toMatchObject({ data: { response_sha256: first.data.response_sha256 } });
  await expect(fetchActionability({ ...request, params }, async () => json({ records: [1] }))).rejects.toMatchObject({ status: 409,
    data: { expected_sha256: params.expected_sha256, observed_sha256: expect.stringMatching(/^[a-f0-9]{64}$/) } });
});

it("preserves TSV bytes as text, including BOM, CRLF, IDs and missing scores", async () => {
  const text = "\uFEFFgene\tclassification\tscore\r\nHGNC:0001\tStrong\t\r\n";
  const result = await fetchActionability({ ...request, path: "/actionability/Pediatric/assertions" }, async () => new Response(text));
  expect(result.data).toMatchObject({ context: "Pediatric", assertion_type: "consensus", raw_tsv: text });
  expect(result.data).toMatchObject({ records: [{ gene: "HGNC:0001", classification: "Strong", score: "" }], record_count: 1 });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  expect(result.data.response_sha256).toBe(Buffer.from(digest).toString("hex"));
});

it("retains observed assertion headers, duplicate assertions, leading zeros and quoted tab/newline cells", async () => {
  const text = '# docId\tmondo\tsuggestedAssertion\tscorer\tconsensusAssertion\r\nAC1084\t0008948\tStrong Actionability\tCONSENSUS\t"α\tquoted\nline"\r\nAC1084\t0008948\tStrong Actionability\tCONSENSUS\t"α\tquoted\nline"\r\n';
  const result = await fetchActionability({ ...request, path: "/actionability/Adult/assertions", params: { assertion_type: "all" } }, async () => new Response(text));
  expect(result.data).toMatchObject({ raw_tsv: text, record_count: 2, records: [
    { "# docId": "AC1084", mondo: "0008948", scorer: "CONSENSUS", consensusAssertion: "α\tquoted\nline" },
    { "# docId": "AC1084", mondo: "0008948", scorer: "CONSENSUS", consensusAssertion: "α\tquoted\nline" },
  ] });
});

it("rejects TSV column mismatch instead of shifting assertion values", async () => {
  await expect(fetchActionability({ ...request, path: "/actionability/Adult/assertions" }, async () => new Response("# docId\tmondo\nAC1084\t0008948\textra\n"))).rejects.toThrow("does not match");
});

it("maps observed columnar rows losslessly without assuming a provider field schema", () => {
  expect(columnarRows({ columns: ["id", "date", "newField"], rows: [["001", null, { value: "α" }]] })).toEqual([{ id: "001", date: null, newField: { value: "α" } }]);
  expect(columnarRows({ reports: [] })).toBeUndefined();
  expect(() => columnarRows({ columns: ["id", "id"], rows: [] })).toThrow(/columnar/);
  expect(() => columnarRows({ columns: ["id"], rows: [[1, 2]] })).toThrow(/row 0/);
});

it.each(["null", "42", '{"error":"provider failure"}', '{"errors":["bad request"]}', "<html>unavailable</html>"])("does not treat malformed/error content as an empty dataset: %s", async body => {
  await expect(fetchActionability(request, async () => new Response(body))).rejects.toThrow();
});

it("rejects HTML disguised as a TSV export", async () => {
  await expect(fetchActionability({ ...request, path: "/actionability/Adult/assertions" }, async () => new Response("<html>\tbusy</html>"))).rejects.toThrow(/TSV/);
});

it("retains status and retry guidance without retries", async () => {
  const fetcher = vi.fn<typeof fetch>(async () => new Response("busy", { status: 429, headers: { "retry-after": "90" } }));
  await expect(fetchActionability(request, fetcher)).rejects.toMatchObject({ status: 429, data: { body: "busy", retry_after: "90" } });
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("bounds streamed bytes and cancels an oversized body", async () => {
  const cancel = vi.fn();
  const body = new ReadableStream<Uint8Array>({ pull(controller) { controller.enqueue(new Uint8Array(1_000_001)); }, cancel });
  await expect(fetchActionability(request, async () => new Response(body))).rejects.toThrow(/8MB/);
  expect(cancel).toHaveBeenCalledOnce();
});

it("does not hide body-stream failure", async () => {
  const body = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("stream interrupted")); } });
  await expect(fetchActionability(request, async () => new Response(body))).rejects.toThrow(/stream interrupted/);
});

it("labels every embedded route as a partial unverified snapshot and retains unavailable dosage", async () => {
  const api = createClingenApiFetch();
  for (const path of ["/validity/curations", "/validity/curations/BRCA1", "/validity/classifications", "/validity/gceps", "/dosage/genes", "/dosage/genes/CFTR", "/validity/curations/NOT_A_GENE"]) {
    expect((await api({ method: "GET", path })).data).toMatchObject({ _dataset: { complete: false, declared_snapshot: "2026-03", current_curation_verified: false } });
  }
  expect((await api({ method: "GET", path: "/dosage/genes/SMN1" })).data).toMatchObject({ hi_score: null, ts_score: null, curation_status: "no_published_curation" });
  expect((await api({ method: "GET", path: "/dosage/genes" })).data).toMatchObject({ hi_score_legend: { 30: "Gene associated with autosomal recessive phenotype", 40: "Dosage sensitivity unlikely" } });
});
