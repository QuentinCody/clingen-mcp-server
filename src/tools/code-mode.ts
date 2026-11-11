/**
 * ClinGen Code Mode — registers search + execute tools for full API access.
 *
 * search: In-process catalog query, returns matching endpoints with docs.
 * execute: V8 isolate with api.get/api.post + searchSpec/listCategories.
 */

import type { McpServer } from "@bio-mcp/shared/mcp";
import { createSearchTool } from "@bio-mcp/shared/codemode/search-tool";
import { createExecuteTool } from "@bio-mcp/shared/codemode/execute-tool";
import { clingenCatalog } from "../spec/catalog";
import { createClingenApiFetch } from "../lib/api-adapter";
import { clingenResponse } from "../lib/tool-result";

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
	const register = server.tool.bind(server) as (...args: unknown[]) => void;
	const dualHost = { tool: (...args: unknown[]) => {
		const [name, ...rest] = args;
		const handler = rest.pop() as (input: unknown, extra: unknown) => ReturnType<typeof clingenResponse>;
		const respond = (input: unknown, extra: unknown) => clingenResponse(() => handler(input, extra), env, String(name), extra, input);
		register(name, ...rest, respond);
		register(`mcp_${String(name)}`, ...rest, respond);
	} };

	// Register the search tool (in-process, no isolate)
	const searchTool = createSearchTool({
		prefix: "clingen",
		catalog: clingenCatalog,
	});
	searchTool.register(dualHost);

	// Register the execute tool (V8 isolate via DynamicWorkerExecutor)
	const executeTool = createExecuteTool({
		prefix: "clingen",
		// Verifiable provenance: clingen_execute results carry a _meta.citation.
		source: { id: "clingen", name: "ClinGen", url: "https://www.clinicalgenome.org", license: "CC0 1.0" },
		catalog: clingenCatalog,
		apiFetch,
		preserveApiErrors: true,
		timeout: 60_000,
		maxInlineBytes: 30 * 1024,
		doNamespace: env.CLINGEN_DATA_DO,
		loader: env.CODE_MODE_LOADER,
	});
	executeTool.register(dualHost);
}
