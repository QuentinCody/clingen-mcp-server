import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { clingenCatalog } from "../spec/catalog";
import { createClingenApiFetch } from "./api-adapter";
import { fetchValidityFeed, parseValidityFeed, VALIDITY_FEED_URL } from "./validity-feed";

const csvRow = (fields: string[]) => fields.map(value => `"${value.replaceAll('"', '""')}"`).join(",") + "\r\n";
const headers = ["GENE SYMBOL", "GENE ID (HGNC)", "DISEASE LABEL", "DISEASE ID (MONDO)", "MOI", "SOP", "CLASSIFICATION", "ONLINE REPORT", "CLASSIFICATION DATE", "GCEP"];
const preamble = csvRow(["CLINGEN GENE DISEASE VALIDITY CURATIONS", ...Array(9).fill("")]) + csvRow(["FILE CREATED: 2026-10-01", ...Array(9).fill("")]);
const prefix = preamble + csvRow(headers) + csvRow(Array(10).fill("++++"));
// Selected source cells observed October 1 at VALIDITY_FEED_URL (not an archived full export).
const rows = [
  ["ACO2", "HGNC:118", "mitochondrial disease", "MONDO:0044970", "AD", "SOP9", "Strong", "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_2bca6e9c-e167-4862-bf45-3ec787b92f49-2023-10-19T040000.000Z", "2023-10-19T04:00:00.000Z", "Mitochondrial Diseases Gene Curation Expert Panel"],
  ["ACO2", "HGNC:118", "mitochondrial disease", "MONDO:0044970", "AR", "SOP9", "Definitive", "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_5892fec8-dc8b-467b-abba-fb6be142bb7a-2023-10-19T040000.000Z", "2023-10-19T04:00:00.000Z", "Mitochondrial Diseases Gene Curation Expert Panel"],
  ["ACAT2", "HGNC:94", "acetyl-CoA acetyltransferase-2 deficiency", "MONDO:0013548", "UD", "SOP7", "No Known Disease Relationship", "https://search.clinicalgenome.org/kb/gene-validity/CGGV:assertion_7cb46678-6e33-4d34-86ba-fdf59e59fb80-2021-01-25T194853.212Z", "2021-01-25T19:48:53.212Z", "Fatty Acid Oxidation Disorders Gene Curation Expert Panel"],
];
const raw = prefix + rows.map(csvRow).join("");
const request = { method: "GET" as const, path: "/validity/export" };
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("preserves source-observed inheritance-specific assertions and non-enumerated classifications", async () => {
  const fetcher = vi.fn<typeof fetch>(async () => new Response(`\uFEFF${raw}`, { headers: { etag: '"fixture"', "last-modified": "Thu, 01 Oct 2026 09:00:00 GMT" } }));
  const result = await fetchValidityFeed(request, fetcher);
  expect(fetcher).toHaveBeenCalledWith(VALIDITY_FEED_URL, expect.objectContaining({ redirect: "manual" }));
  expect(result.data).toMatchObject({ raw_csv: `\uFEFF${raw}`, record_count: 3, columns: headers, source_url: VALIDITY_FEED_URL, evidence_domain: "gene_disease_validity", etag: '"fixture"' });
  expect(result.data.records.map(row => headers.map(key => row[key]))).toEqual(rows);
  expect(result.data.source_preamble[1][0]).toBe("FILE CREATED: 2026-10-01");
  expect(result.data.records[2].CLASSIFICATION).toBe("No Known Disease Relationship");
  expect(result.data.records[0]["CLASSIFICATION DATE"]).toBe("2023-10-19T04:00:00.000Z");
  expect(result.data.records[0]["ONLINE REPORT"]).not.toBe(result.data.records[1]["ONLINE REPORT"]);
  await expect(fetchValidityFeed({ ...request, params: { expected_sha256: result.data.response_sha256.toUpperCase() } }, fetcher)).resolves.toMatchObject({ status: 200 });
  await expect(fetchValidityFeed({ ...request, params: { expected_sha256: "0".repeat(64) } }, fetcher)).rejects.toThrow("changed");
});

it("keeps unknown columns, blanks, Unicode and escaped multiline fields", () => {
  const value = '  α, "quoted"\r\nnext line  ';
  const result = parseValidityFeed(preamble + csvRow([...headers, "FUTURE COLUMN"]) + csvRow([...rows[0].slice(0, 8), "", rows[0][9], value]));
  expect(result.records[0]["FUTURE COLUMN"]).toBe(value);
  expect(result.records[0]["CLASSIFICATION DATE"]).toBe("");
});

it.each([
  "<html>maintenance</html>", prefix, raw.replace("HGNC:118", "118"),
  raw.replace('"GENE ID (HGNC)"', '"OTHER"'), raw + '"unfinished',
  prefix + csvRow([...rows[0], "extra"]), raw.replace('"ACO2"', '"ACO2"oops'),
  preamble + csvRow([...headers, "MOI"]) + csvRow([...rows[0], "AD"]),
])("rejects malformed and changed exports without a misleading empty success", payload => {
  expect(() => parseValidityFeed(payload)).toThrow();
});

it.each([{ gene: "ACO2" }, { expected_sha256: true }, { expected_sha256: "bad" }, { page: 2 }])("rejects unsupported parameters before fetching: %j", async params => {
  const fetcher = vi.fn<typeof fetch>();
  await expect(fetchValidityFeed({ ...request, params }, fetcher)).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});

it("propagates upstream failures and never follows redirects through the actual proxy", async () => {
  for (const status of [302, 429, 503]) {
    const fetcher = vi.fn(async () => new Response("failure", { status, headers: { "retry-after": "60" } }));
    vi.stubGlobal("fetch", fetcher);
    const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, stagingPrefix: "clingen" });
    expect(await proxy.handler(request, { sql: () => [] })).toMatchObject({ __api_error: true, status, data: { retry_after: "60" } });
    expect(fetcher).toHaveBeenCalledTimes(1);
  }
});

it("bounds body size, rejects invalid UTF-8 and cancels stalled reads", async () => {
  const cancel = vi.fn();
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(8_000_001)); }, cancel });
  await expect(fetchValidityFeed(request, async () => new Response(stream))).rejects.toThrow("8MB");
  expect(cancel).toHaveBeenCalled();
  await expect(fetchValidityFeed(request, async () => new Response(new Uint8Array([0xff])))).rejects.toThrow();
  vi.useFakeTimers();
  const work = fetchValidityFeed(request, async () => new Response(new ReadableStream({ cancel })));
  const failure = expect(work).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(30_000);
  await failure;
  expect(vi.getTimerCount()).toBe(0);
});

it("executes the published Code Mode example and stages every assertion with native source evidence", async () => {
  const largeCsv = prefix + Array.from({ length: 120 }, () => rows.map(csvRow).join("")).join("");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(largeCsv)));
  const stored: unknown[] = [];
  const ns = { idFromName: (name: string) => name, get: () => ({ fetch: async (req: Request) => {
    if (new URL(req.url).pathname === "/process") {
      stored.push((await req.json() as { data: unknown }).data);
      return Response.json({ success: true, tables_created: ["records"], total_rows: 360, input_rows: 360, table_row_counts: { records: 360 } });
    }
    return Response.json({ success: true, schema: { tables: { records: { columns: [{ name: "MOI" }] } } } });
  } }) } as unknown as DurableObjectNamespace;
  const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, doNamespace: ns, stagingPrefix: "clingen", maxInlineBytes: 30 * 1024 });
  const endpoint = clingenCatalog.endpoints.find(entry => entry.path === request.path)!;
  const execute = new Function("api", `return (async () => { ${endpoint.example} })();`);
  const result = await execute({ get: (path: string) => proxy.handler({ method: "GET", path }, { sql: () => [] }) });
  expect(result).toMatchObject({ __staged: true, data_access_id: expect.any(String) });
  const canonical = JSON.parse(stored[0] as string);
  expect(canonical).toMatchObject({ raw_csv: largeCsv, record_count: 360, source_url: VALIDITY_FEED_URL, evidence_domain: "gene_disease_validity" });
  expect(canonical.records.slice(0, 3).map((row: Record<string, string>) => headers.map(key => row[key]))).toEqual(rows);
  expect(stored[1]).toEqual(canonical);
  expect(new TextEncoder().encode(JSON.stringify(result)).byteLength).toBeLessThan(30_000);
  expect(clingenCatalog.endpointCount).toBe(clingenCatalog.endpoints.length);
});

it("retains the legacy embedded validity route without contacting upstream", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const result = await createClingenApiFetch()({ method: "GET", path: "/validity/curations", params: { gene: "BRCA1" } });
  expect(result.data).toMatchObject({ _dataset: { kind: "embedded_subset", complete: false }, curations: expect.any(Array) });
  expect(fetcher).not.toHaveBeenCalled();
});
