import type { WorkflowRecipe } from "@bio-mcp/shared/codemode/catalog";

export const geneHandoffWorkflow: WorkflowRecipe = {
  title: "Compare Orphadata gene handoff with ClinGen and G2P evidence",
  keywords: ["Orphadata", "Orphanet", "HGNC", "G2P", "validity", "disease", "handoff"],
  description: "Replace selection with the Orphadata handoff, retain its source evidence, and choose one G2P stable ID from a prior summary. Filter the current ClinGen export by exact HGNC ID, keeping at most 100 native assertions with an overflow check. Independently retrieve G2P summaries; verify the explicitly selected stable ID is present before fetching its full record and checking exact HGNC identity. Empty export matches are scoped to that retrieved file. No ranking, disease equivalence, inheritance translation or automatic fan-out.",
  code: `const selection = {orphacode: 284963, symbol: "FBN1", hgnc_id: "HGNC:3603", g2p_stable_id: "G2P01013"};
if (!Number.isSafeInteger(selection.orphacode) || selection.orphacode < 1 || !/^[A-Za-z0-9_.-]+$/.test(selection.symbol) || !/^HGNC:[1-9][0-9]*$/.test(selection.hgnc_id) || !/^G2P[0-9]+$/.test(selection.g2p_stable_id)) throw new Error("Invalid disease or gene selection");
const evidence = {selection, selection_source: "caller-supplied Orphadata handoff; retain original evidence separately", coverage_complete: false, disease_equivalence_verified: false};
const read = async path => {try {return await api.get(path);} catch (error) {return {__api_error: true, message: error.message, status: error.status, data: error.data};}};
const [validity, g2p] = await Promise.all([read("/validity/export"), read("/g2p/gene/" + selection.symbol + "/summary")]);
evidence.validity = validity;
evidence.g2p = g2p;
const failures = [];
if (!validity || validity.__api_error || validity.__stage_error) failures.push({source: "ClinGen validity", cause: validity});
else {
  let rows;
  if (validity.__staged) {
    try {
      const query = await api.query(validity.data_access_id, "SELECT * FROM validity_curations WHERE \\"GENE ID (HGNC)\\" = '" + selection.hgnc_id + "' LIMIT 101");
      evidence.validity_query = query;
      if (query?.__staged) evidence.validity_selection = {status: "inspect_staged_query", maximum_rows: 100};
      else if (query?.__api_error || query?.__stage_error) failures.push({source: "ClinGen validity query", cause: query});
      else rows = query?.results;
    } catch (error) {failures.push({source: "ClinGen validity query", message: error.message});}
  } else if (Array.isArray(validity.records)) rows = validity.records.filter(row => row["GENE ID (HGNC)"] === selection.hgnc_id).slice(0, 101);
  if (rows !== undefined) {
    if (!Array.isArray(rows) || rows.some(row => !row || row["GENE ID (HGNC)"] !== selection.hgnc_id)) failures.push({source: "ClinGen validity", message: "Invalid HGNC-filtered records"});
    else evidence.validity_selection = {status: rows.length ? "observed" : "no_match_in_retrieved_export", rows: rows.slice(0, 100), maximum_rows: 100,
      more_matches: rows.length > 100, gene_identity_basis: "exact HGNC ID", symbol_matches: rows.slice(0, 100).map(row => row["GENE SYMBOL"] === selection.symbol)};
  } else if (!evidence.validity_selection && !failures.some(row => row.source.startsWith("ClinGen"))) failures.push({source: "ClinGen validity", message: "Unknown export or query shape"});
}
if (!g2p || g2p.__api_error || g2p.__stage_error) failures.push({source: "G2P", cause: g2p});
else if (g2p.__staged) evidence.g2p_selection = {status: "inspect_staged_summary", gene_identity_verified: false};
else if (g2p.gene_symbol !== selection.symbol || !Array.isArray(g2p.records_summary)) failures.push({source: "G2P", message: "Gene summary identity or shape mismatch"});
else if (!g2p.records_summary.some(row => row?.stable_id === selection.g2p_stable_id)) evidence.g2p_selection = {status: "selected_record_not_observed", gene_identity_verified: false};
else {
  evidence.g2p_record = await read("/g2p/lgd/" + selection.g2p_stable_id);
  const record = evidence.g2p_record;
  if (!record || record.__api_error || record.__stage_error) failures.push({source: "G2P record", cause: record});
  else if (record.__staged) evidence.g2p_selection = {status: "inspect_staged_record", gene_identity_verified: false};
  else if (record.stable_id !== selection.g2p_stable_id || record.locus?.ids?.HGNC !== selection.hgnc_id) failures.push({source: "G2P record", message: "Stable ID or HGNC identity mismatch"});
  else evidence.g2p_selection = {status: "gene_identity_matched", gene_identity_verified: true, gene_identity_basis: "exact HGNC ID", symbol_matches: record.locus.gene_symbol === selection.symbol};
}
return {...evidence, ...(failures.length ? {__api_error: true, status: 502, failures} : {}), step: "compare_separate_evidence",
  interpretation: "Classifications and confidence are source-specific. Keep repeated assertions, disputed/refuted rows and different diseases or inheritance modes. ORPHAcode and MONDO/OMIM references require explicit mapping evidence, including relation and validation status. Missing observations do not refute an association."
};`,
};
