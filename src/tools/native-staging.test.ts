/// <reference types="node" />
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it, vi } from "vitest";
import { McpServer } from "@bio-mcp/shared/mcp";
import { hashCanonicalJson, verifyCitationEnvelope } from "@bio-mcp/shared";
import { DynamicWorkerExecutor } from "@bio-mcp/shared/codemode/execute-tool";
vi.mock("cloudflare:workers", () => ({ RpcTarget: class {}, DurableObject: class { constructor(public ctx: unknown, public env: unknown) {} } }));
import { ClingenDataDO } from "../do";
import { registerCodeMode } from "./code-mode";
import { registerQueryData } from "./query-data";
import { registerGetSchema } from "./get-schema";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function createStore() {
  const database = new DatabaseSync(":memory:");
  let ready = Promise.resolve();
  const exec = (query: string, ...values: any[]) => {
    const rows = database.prepare(query).all(...values);
    const iterator = rows[Symbol.iterator]();
    return { toArray: () => rows, one: () => rows[0], next: () => iterator.next(), [Symbol.iterator]: () => iterator };
  };
  const transactionSync = <T>(run: () => T): T => {
    database.exec("BEGIN");
    try { const result = run(); database.exec("COMMIT"); return result; }
    catch (error) { database.exec("ROLLBACK"); throw error; }
  };
  const ctx = { blockConcurrencyWhile: (run: () => Promise<void>) => { ready = run(); return ready; }, storage: { sql: { exec }, transactionSync } };
  const instance = new ClingenDataDO(ctx as unknown as DurableObjectState, {} as Cloudflare.Env);
  return { database, instance, ready };
}

function fixture() {
  // Run the generated API helpers and user program, replacing only the Cloudflare isolate.
  vi.spyOn(DynamicWorkerExecutor.prototype, "execute").mockImplementation(async (code, functions) => {
    const staged: Array<Record<string, unknown>> = [];
    try {
      const run = new Function("codemode", "__stagedResults", "console", `return (${code})();`);
      const result = await run(functions, staged, { warn() {}, log() {} });
      return { result: JSON.parse(JSON.stringify(result)), __stagedResults: staged };
    } catch (error) { return { error: String((error as Error).message), __stagedResults: staged }; }
  });
  const stores = new Map<string, ReturnType<typeof createStore>>();
  const namespace = { idFromName: (name: string) => name, get: (id: string) => ({ fetch: async (request: Request) => {
    let store = stores.get(id);
    if (!store) { store = createStore(); stores.set(id, store); }
    await store.ready;
    return store.instance.fetch(request);
  } }) };
  const env = { CLINGEN_DATA_DO: namespace, CODE_MODE_LOADER: { get: () => ({}) } } as unknown as Parameters<typeof registerCodeMode>[1];
  const server = new McpServer({ name: "fixture", version: "1" });
  registerCodeMode(server, env); registerQueryData(server, env); registerGetSchema(server, env);
  const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown, extra: unknown) => Promise<any> }> })._registeredTools;
  return { tools, close: () => { for (const store of stores.values()) store.database.close(); } };
}

async function recover(f: ReturnType<typeof fixture>, id: string, prefix: string) {
  const rows = async (sql: string) => {
    const output = await f.tools[`${prefix}clingen_query_data`].handler({ data_access_id: id, sql }, {});
    expect(output.isError, JSON.stringify(output)).not.toBe(true);
    expect(output.structuredContent.staged).not.toBe(true);
    expect(new TextEncoder().encode(JSON.stringify(output)).byteLength).toBeLessThan(30720);
    return output.structuredContent.data.rows;
  };
  const text = async (table: string, column: string, where: string) => {
    const [{ n }] = await rows(`SELECT length(${column}) AS n FROM ${table} WHERE ${where}`);
    let result = "";
    for (let start = 1; start <= n; start += 1000) {
      const [row] = await rows(`SELECT substr(${column}, ${start}, 1000) AS part FROM ${table} WHERE ${where}`);
      result += row.part;
    }
    return result;
  };
  let raw = await text("payloads", "root_json", "id = 1");
  if (raw.startsWith("__CHUNKED__:")) {
    const chunk = raw.slice("__CHUNKED__:".length);
    expect(chunk).toMatch(/^chunk_[a-f0-9]{32}$/);
    const parts = await rows(`SELECT chunk_index FROM content_chunks WHERE content_id = '${chunk}' ORDER BY chunk_index`);
    raw = "";
    for (const part of parts) raw += await text("content_chunks", "chunk_data", `content_id = '${chunk}' AND chunk_index = ${part.chunk_index}`);
  }
  const decoded = JSON.parse(raw);
  return typeof decoded === "string" ? JSON.parse(decoded) : decoded;
}

it("recovers source cells, oversized SQL and helper citations through both aliases", async () => {
  const f = fixture();
  const raw = { columns: ["docId", "mondo", "context", "evidence"], rows: [["AC1084", "0008948", "Adult", 'α 🧬 "'.repeat(5000)]] };
  vi.stubGlobal("fetch", vi.fn(async () => Response.json(raw)));
  try {
    for (const prefix of ["", "mcp_"]) {
      const code = " \nreturn await api.get('/actionability/Adult/summ',{flavor:'flat'});\r\n";
      const result = await f.tools[`${prefix}clingen_execute`].handler({ code }, {});
      expect(result.isError).not.toBe(true);
      const id = result.structuredContent.data.data_access_id;
      const original = await recover(f, id, prefix);
      expect(original.raw_response).toEqual(raw);
      const proof = await verifyCitationEnvelope({ citation: result.structuredContent._meta.citation,
        structuredContent: result.structuredContent, toolArguments: { code }, materialized: { value: original } });
      expect(proof.verification).toMatchObject({ query: "verified", result: "verified" });
      for (const [name, args] of [
        ["query_data", { data_access_id: id, sql: "SELECT docId, mondo, context FROM actionability_records" }],
        ["get_schema", { data_access_id: id }],
      ] as const) {
        const response = await f.tools[`${prefix}clingen_${name}`].handler(args, {});
        expect(response.isError).not.toBe(true);
        const verified = await verifyCitationEnvelope({ citation: response.structuredContent._meta.citation,
          structuredContent: response.structuredContent, toolArguments: args });
        expect(verified.verification).toMatchObject({ query: "verified", result: "verified" });
        if (name === "query_data") expect(response.structuredContent.data.rows).toEqual([{ docId: "AC1084", mondo: "0008948", context: "Adult" }]);
      }
      const args = { data_access_id: id, sql: "SELECT evidence FROM actionability_records" };
      const large = await f.tools[`${prefix}clingen_query_data`].handler(args, {});
      expect(new TextEncoder().encode(JSON.stringify(large)).byteLength).toBeLessThan(30720);
      expect(large.structuredContent.staged).toBe(true);
      const full = await recover(f, large.structuredContent.data_access_id, prefix);
      expect(full.structuredContent.data.rows[0].evidence).toBe(raw.rows[0][3]);
      const verified = await verifyCitationEnvelope({ citation: large.structuredContent._meta.citation,
        structuredContent: large.structuredContent, toolArguments: args, materialized: { value: full } });
      expect(verified.verification).toMatchObject({ query: "verified", result: "verified" });
    }
  } finally { f.close(); }
});

it("retains native HTTP errors and recoverable evidence after a program error", async () => {
  const f = fixture();
  try {
    for (const prefix of ["", "mcp_"]) {
      const raw = "α".repeat(40000);
      vi.stubGlobal("fetch", vi.fn(async () => new Response(raw, { status: 503, headers: { "retry-after": "60" } })));
      const result = await f.tools[`${prefix}clingen_execute`].handler({ code: "return await api.get('/dosage/curations');" }, {});
      expect(result).toMatchObject({ isError: true, structuredContent: { success: false, data: { __api_error: true, status: 503 } } });
      const preserved = await recover(f, result.structuredContent.data.data.data_access_id, prefix);
      expect(preserved).toMatchObject({ body: raw, retry_after: "60" });
      vi.stubGlobal("fetch", vi.fn(async () => Response.json({ columns: ["docId"], rows: [["x".repeat(40000)]] })));
      const partial = await f.tools[`${prefix}clingen_execute`].handler({ code: "const r=await api.get('/actionability/Adult/summ',{flavor:'flat'});throw new Error('after fetch');" }, {});
      expect(partial).toMatchObject({ isError: true, structuredContent: { success: false, disposition: "partial", program_error: expect.anything() } });
      expect(new TextEncoder().encode(JSON.stringify(partial)).byteLength).toBeLessThan(30720);
    }
  } finally { f.close(); }
});
