import { expect, it } from "vitest";
import { McpServer } from "@bio-mcp/shared/mcp";
import { registerCodeMode } from "./code-mode";
import { registerQueryData } from "./query-data";
import { registerGetSchema } from "./get-schema";
import { clingenCatalog } from "../spec/catalog";

it("registers both aliases and discovers the age-specific actionability routes", async () => {
  const server = new McpServer({ name: "fixture", version: "1" });
  registerCodeMode(server, { CODE_MODE_LOADER: { get: () => ({}) } } as unknown as Parameters<typeof registerCodeMode>[1]);
  registerQueryData(server, {}); registerGetSchema(server, {});
  const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown, extra: unknown) => Promise<unknown> }> })._registeredTools;
  for (const name of ["clingen_search", "clingen_execute", "clingen_query_data", "clingen_get_schema"]) {
    expect(tools[name]).toBeDefined(); expect(tools[`mcp_${name}`]).toBeDefined();
  }
  for (const name of ["clingen_search", "mcp_clingen_search"]) {
    const result = await tools[name].handler({ query: "actionability", category: "actionability", max_results: 5 }, {});
    expect(result).toMatchObject({ content: expect.any(Array), structuredContent: { success: true } });
    expect(JSON.stringify(result)).toContain("/actionability/{context}/summ");
  }
  expect(clingenCatalog.endpointCount).toBe(clingenCatalog.endpoints.length);
  for (const name of ["clingen_search", "mcp_clingen_search"]) {
    const result = await tools[name].handler({ query: "current dosage CSV", category: "dosage", max_results: 5 }, {});
    expect(JSON.stringify(result)).toContain("/dosage/curations");
  }
  expect(await tools.mcp_clingen_query_data.handler({ data_access_id: "clingen_fixture", sql: "SELECT 1" }, {})).toMatchObject({ isError: true, content: expect.any(Array), structuredContent: expect.any(Object) });
});
