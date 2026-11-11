import { afterEach, expect, it, vi } from "vitest";
import { createApiProxyTool } from "@bio-mcp/shared/tools/api-proxy";
import { createClingenApiFetch } from "./api-adapter";
import { clingenCatalog } from "../spec/catalog";
import { DOSAGE_FEED_URL, fetchDosageFeed, parseDosageFeed } from "./dosage-feed";

// Provider layout observed in the official September 30 export; synthetic rows.
const prefix = '"CLINGEN DOSAGE SENSITIVITY CURATIONS","","","","",""\r\n"FILE CREATED: 2026-09-30","","","","",""\r\n"GENE SYMBOL","HGNC ID","HAPLOINSUFFICIENCY","TRIPLOSENSITIVITY","ONLINE REPORT","DATE"\r\n"++++","++++","++++","++++","++++","++++"\r\n';
const row = '"CFTR","HGNC:1884","Gene Associated with Autosomal Recessive Phenotype","Not yet evaluated","https://search.clinicalgenome.org/kb/gene-dosage/HGNC:1884","2016-08-22T17:47:03+00:00"\r\n';
const request = { method: "GET" as const, path: "/dosage/curations" };
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("preserves native classifications, evaluation timestamps, raw CSV and source metadata", async () => {
  const raw = `\uFEFF${prefix}${row}`;
  const fetcher = vi.fn<typeof fetch>(async () => new Response(raw, { headers: { etag: '"v1"' } }));
  const result = await fetchDosageFeed(request, fetcher);
  expect(fetcher).toHaveBeenCalledWith(DOSAGE_FEED_URL, expect.objectContaining({ redirect: "manual", signal: expect.any(AbortSignal) }));
  expect(result.data).toMatchObject({
    raw_csv: raw, record_count: 1, etag: '"v1"', source_url: DOSAGE_FEED_URL,
    response_sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    records: [{ "HGNC ID": "HGNC:1884", TRIPLOSENSITIVITY: "Not yet evaluated", DATE: "2016-08-22T17:47:03+00:00" }],
    source_preamble: [["CLINGEN DOSAGE SENSITIVITY CURATIONS", "", "", "", "", ""], ["FILE CREATED: 2026-09-30", "", "", "", "", ""]],
  });
  expect(result.data.records[0]).not.toHaveProperty("ts_score");
  const replay = { ...request, params: { expected_sha256: result.data.response_sha256.toUpperCase() } };
  await expect(fetchDosageFeed(replay, fetcher)).resolves.toMatchObject({ status: 200 });
  await expect(fetchDosageFeed({ ...request, params: { expected_sha256: "0".repeat(64) } }, fetcher)).rejects.toThrow("changed");
});

it("keeps extra native fields, commas, escaped quotes and multiline text without trimming", () => {
  const raw = prefix.replace('"DATE"\r\n', '"DATE","NEW FIELD"\r\n') + row.trimEnd() + ',"  α, ""quoted""\nsecond line  "\r\n';
  expect(parseDosageFeed(raw).records[0]["NEW FIELD"]).toBe('  α, "quoted"\nsecond line  ');
});

it.each([
  "<html>maintenance</html>", prefix, prefix + row.replace("HGNC:1884", "1884"),
  prefix + row.trimEnd() + ',"extra"', prefix + row.replace('"CFTR"', '"CFTR"oops'),
  prefix + row.slice(0, -3), prefix.replace('"HGNC ID"', '"unknown"') + row,
])("rejects changed or incomplete exports instead of reporting empty valid data", raw => {
  expect(() => parseDosageFeed(raw)).toThrow();
});

it.each([{ gene: "CFTR" }, { page: 1 }, { expected_sha256: 5 }])("rejects unsupported params before contacting ClinGen", async params => {
  const fetcher = vi.fn<typeof fetch>();
  await expect(fetchDosageFeed({ ...request, params }, fetcher)).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});

it("retains upstream status and retry guidance and never follows redirects", async () => {
  for (const status of [302, 429, 503]) {
    const fetcher = vi.fn<typeof fetch>(async () => new Response("untrusted body", { status, headers: { "retry-after": "60" } }));
    await expect(fetchDosageFeed(request, fetcher)).rejects.toMatchObject({ status, data: { retry_after: "60" } });
    expect(fetcher).toHaveBeenCalledTimes(1);
  }
});

it("cancels oversized responses and rejects invalid UTF-8", async () => {
  const cancel = vi.fn();
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(8_000_001)); }, cancel });
  await expect(fetchDosageFeed(request, async () => new Response(stream))).rejects.toThrow("8MB");
  expect(cancel).toHaveBeenCalled();
  await expect(fetchDosageFeed(request, async () => new Response(new Uint8Array([0xff])))).rejects.toThrow();
});

it("bounds a stalled body and clears its deadline on completion", async () => {
  vi.useFakeTimers();
  const cancel = vi.fn();
  const work = fetchDosageFeed(request, async () => new Response(new ReadableStream({ cancel })));
  const assertion = expect(work).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(30_000);
  await assertion;
  expect(cancel).toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it("stages the complete feed and its native evidence through the existing Code Mode proxy", async () => {
  const raw = prefix + row.repeat(200);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(raw)));
  const stored: unknown[] = [];
  const ns = { idFromName: (name: string) => name, get: () => ({ fetch: async (req: Request) => {
    if (new URL(req.url).pathname === "/process") {
      stored.push((await req.json() as { data: unknown }).data);
      return Response.json({ success: true, tables_created: ["dosage_curations"], total_rows: 200, input_rows: 200, table_row_counts: { dosage_curations: 200 } });
    }
    return Response.json({ success: true, schema: { tables: { dosage_curations: { columns: [{ name: "hgnc_id" }] } } } });
  } }) } as unknown as DurableObjectNamespace;
  const proxy = createApiProxyTool({ apiFetch: createClingenApiFetch(), catalog: clingenCatalog, doNamespace: ns, stagingPrefix: "clingen", maxInlineBytes: 30 * 1024 });
  const result = await proxy.handler(request, { sql: () => [] });
  expect(result).toMatchObject({ __staged: true, data_access_id: expect.any(String) });
  const canonical = JSON.parse(stored[0] as string);
  expect(canonical).toMatchObject({ raw_csv: raw, record_count: 200, source_url: DOSAGE_FEED_URL });
  expect(canonical.records).toHaveLength(200);
  expect(stored[1]).toEqual(canonical);
  expect(new TextEncoder().encode(JSON.stringify(result)).byteLength).toBeLessThan(30_000);
});
