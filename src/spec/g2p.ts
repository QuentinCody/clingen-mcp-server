import type { ApiEndpoint } from "@bio-mcp/shared/codemode/catalog";

export const g2pEndpoints: ApiEndpoint[] = [
  { method: "GET", path: "/g2p/gene/{symbol}/summary", category: "g2p",
    summary: "Retrieve current G2P summaries for a gene symbol. Preserve distinct stable IDs, genotypes, mechanisms, confidence, panels and last_updated. These summaries do not include a verified HGNC identity or full evidence dossiers.",
    pathParams: [{ name: "symbol", type: "string", required: true, description: "Gene symbol, e.g. FBN1." }],
    example: 'return await api.get("/g2p/gene/FBN1/summary");' },
  { method: "GET", path: "/g2p/lgd/{stable_id}", category: "g2p",
    summary: "Retrieve one G2P locus-genotype-mechanism-disease-evidence record by an observed stable ID. Preserve locus.ids.HGNC, disease ontology terms, evidence support, confidence, publications, panels, dates and review status. Generated summary text is separate from curated evidence.",
    pathParams: [{ name: "stable_id", type: "string", required: true, description: "G2P stable ID selected from a summary/search response, e.g. G2P01013. No automatic fan-out." }],
    example: 'return await api.get("/g2p/lgd/G2P01013");' },
];
