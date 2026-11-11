import { afterEach, expect, it, vi } from "vitest";
import { createClingenApiFetch } from "./api-adapter";

const api = createClingenApiFetch();
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it.each(["/g2p/gene/FBN1", "/g2p/gene/FBN1/", "/g2p/gene/FBN1/summary"])("routes %s to the documented summary without changing native evidence", async path => {
  const native = { gene_symbol: "FBN1", records_summary: [{ stable_id: "G2P01013", genotype: "monoallelic_autosomal", confidence: "definitive", molecular_mechanism: "loss of function", future_field: null }] };
  const mock = vi.fn(async () => Response.json(native)); vi.stubGlobal("fetch", mock);
  expect(await api({ method: "GET", path })).toMatchObject({ status: 200, data: native, completeness: { complete: false, returned: 1 } });
  expect(mock).toHaveBeenCalledWith("https://www.ebi.ac.uk/gene2phenotype/api/gene/FBN1/summary/", expect.objectContaining({ method: "GET", redirect: "manual" }));
});

it.each(["/g2p/lgd/G2P01013", "/g2p/panel/DD"])("preserves full evidence or count objects for %s", async path => {
  const native = { locus: { ids: { HGNC: "HGNC:3603" } }, unknown: ["0.001", null, "α"] };
  const mock = vi.fn(async () => Response.json(native)); vi.stubGlobal("fetch", mock);
  expect((await api({ method: "GET", path })).data).toEqual(native);
  expect(mock.mock.calls).toHaveLength(1);
});

it("forwards search filters and page without following native next URLs", async () => {
  const native = { count: 42, next: "https://example.invalid/next", previous: null, results: [{ stable_id: "G2P01013", confidence: "disputed" }] };
  const mock = vi.fn(async (_url: string) => Response.json(native)); vi.stubGlobal("fetch", mock);
  const params = { query: "FBN1", type: "gene", panel: "DD", page: 2, genotype: "monoallelic_autosomal", mechanism: "loss of function", variant_consequence: "SO:0002317" };
  expect(await api({ method: "GET", path: "/g2p/search", params })).toMatchObject({ data: native, completeness: { complete: false, returned: 1, total_available: 42, truncation: { reason: "page_limit" } } });
  const url = new URL(mock.mock.calls[0][0]);
  expect(Object.fromEntries(url.searchParams)).toEqual({ ...params, page: "2" });
  expect(mock).toHaveBeenCalledTimes(1);
});

it.each([
  { path: "/g2p/gene/FBN1/../../panel/DD" }, { path: "/g2p/gene/%2F" }, { path: "/g2p/lgd/invalid" },
  { path: "/g2p/gene/FBN1", params: { page: 1 } }, { path: "/g2p/search", params: {} },
  { path: "/g2p/search", params: { query: " " } }, { path: "/g2p/search", params: { query: "FBN1", page: 0 } },
  { path: "/g2p/search", params: { query: "FBN1", page: "2" } }, { path: "/g2p/search", params: { query: "FBN1", page: 1.2 } },
  { path: "/g2p/search", params: { query: "FBN1", size: 100 } }, { path: "/g2p/search", params: { query: "FBN1", type: "all" } },
])("rejects invalid requests before fetching %#", async request => {
  const mock = vi.fn(); vi.stubGlobal("fetch", mock);
  await expect(api({ method: "GET", ...request })).rejects.toThrow(); expect(mock).not.toHaveBeenCalled();
});

it.each([
  new Response("<html>down</html>", { headers: { "content-type": "text/html" } }),
  new Response("{broken", { headers: { "content-type": "application/json" } }),
  Response.json(null), Response.json([]),
  new Response("{}", { status: 206, headers: { "content-type": "application/json" } }),
  new Response("{}", { headers: { "content-type": "application/json", "content-range": "bytes 0-1/8" } }),
])("rejects non-native or incomplete representations %#", async response => {
  vi.stubGlobal("fetch", vi.fn(async () => response));
  await expect(api({ method: "GET", path: "/g2p/gene/FBN1" })).rejects.toMatchObject({ status: 502, data: { body: expect.any(String), source_url: expect.any(String), response_sha256: expect.stringMatching(/^[a-f0-9]{64}$/) } });
});

it("retains a native error and retry hint instead of reporting no associations", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response('α {"detail":"maintenance"}', { status: 503, headers: { "retry-after": "60" } })));
  await expect(api({ method: "GET", path: "/g2p/gene/FBN1" })).rejects.toMatchObject({ status: 503, data: { body: 'α {"detail":"maintenance"}', retry_after: "60" } });
});

it("bounds a stalled G2P body using the shared feed deadline", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream({ start() {} }), { headers: { "content-type": "application/json" } })));
  const pending = expect(api({ method: "GET", path: "/g2p/gene/FBN1" })).rejects.toMatchObject({ status: 504 });
  await vi.advanceTimersByTimeAsync(30_001); await pending;
});

it("rejects a malformed search count/results contract", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ count: "42", results: [] })));
  await expect(api({ method: "GET", path: "/g2p/search", params: { query: "FBN1" } })).rejects.toThrow("invalid search page");
});
