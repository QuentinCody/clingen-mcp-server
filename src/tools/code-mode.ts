/**
 * ClinGen Code Mode — registers search + execute tools for full API access.
 *
 * search: In-process catalog query, returns matching endpoints with docs.
 * execute: V8 isolate with api.get/api.post + searchSpec/listCategories.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSearchTool } from "@bio-mcp/shared/codemode/search-tool";
import { createExecuteTool } from "@bio-mcp/shared/codemode/execute-tool";
import { clingenCatalog } from "../spec/catalog";
import { createClingenApiFetch } from "../lib/api-adapter";

interface CodeModeEnv {
	CLINGEN_DATA_DO: DurableObjectNamespace;
	CODE_MODE_LOADER: WorkerLoader;
}

/**
 * Register clingen_search and clingen_execute tools.
 */
export function registerCodeMode(
	server: McpServer,
	env: CodeModeEnv,
): void {
	const apiFetch = createClingenApiFetch();

	// Register the search tool (in-process, no isolate)
	const searchTool = createSearchTool({
		prefix: "clingen",
		catalog: clingenCatalog,
	});
	searchTool.register(server as unknown as { tool: (...args: unknown[]) => void });

	// Register the execute tool (V8 isolate via DynamicWorkerExecutor)
	const executeTool = createExecuteTool({
		prefix: "clingen",
		catalog: clingenCatalog,
		apiFetch,
		doNamespace: env.CLINGEN_DATA_DO,
		loader: env.CODE_MODE_LOADER,
	});
	executeTool.register(server as unknown as { tool: (...args: unknown[]) => void });
}
