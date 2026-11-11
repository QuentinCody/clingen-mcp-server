# ClinGen MCP Server

This is a [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server. It lets MCP clients (Claude Desktop, Claude Code, Continue, etc.) query the upstream ClinGen API in natural language. It is one of 100+ servers in the [Bio MCP](../../README.md) monorepo.

## Connect

Configured production endpoint (the October 3 additions and fixes below are locally validated; deployment remains pending):

```
https://clingen-mcp-server.quentincody.workers.dev/mcp
```

Add it to your MCP client (Claude Desktop → Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "clingen": {
      "command": "npx",
      "args": ["mcp-remote", "https://clingen-mcp-server.quentincody.workers.dev/mcp"]
    }
  }
}
```

For local development the server runs at `http://localhost:8825/mcp` (start it with `./scripts/dev-servers.sh clingen`):

```json
{
  "mcpServers": {
    "clingen-local": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:8825/mcp"]
    }
  }
}
```

## Tools

- `clingen_search` — discover available API operations, including clinical actionability
- `clingen_execute` — **Code Mode**: write JavaScript in a V8 isolate (`api.get()` / `api.post()` / `searchSpec()`) instead of issuing tool calls one by one
- `clingen_query_data` — run SQL over large responses auto-staged into a per-session SQLite database
- `clingen_get_schema` — inspect the inferred schema of a staged dataset

Large responses (>30KB) are auto-staged into a queryable SQLite database; the tools return a `data_access_id` you can query with SQL.

Every tool returns both a human-readable `content` summary and a structured `structuredContent` payload.

Each tool is also registered with the `mcp_` prefix.

## G2P gene evidence and Orphadata handoff

The provider's [published API schema](https://github.com/EBI-G2P/gene2phenotype_api/blob/main/gene2phenotype_project/schema.json)
defines gene summaries at `/gene/{name}/summary/`. The adapter exposes
`/g2p/gene/{symbol}/summary`; the older `/g2p/gene/{symbol}` spelling now maps to
that same upstream summary. It returns native `gene_symbol` and
`records_summary`, including distinct stable IDs, genotypes, mechanisms,
confidence, panels and dates. Retrieve one explicitly selected full record at
`/g2p/lgd/{stable_id}` for gene identifiers, disease terms, curated evidence and
review status. Preserve generated summary prose separately from those fields.

`/g2p/panel/{name}` returns summary counts. For records use `/g2p/search` with
`query`, optional `type`, `panel`, `genotype`, `mechanism`, `variant_consequence`
and positive one-based `page`. Keep `count`, `next` and `previous`; the adapter
does not follow pages automatically. JSON reads share the existing feed reader's
30-second deadline and 8 MB bound, reject partial/HTML responses and preserve
native HTTP error bodies. Schema-based local validation does not establish
fresh upstream availability or a deployed release.

The discoverable workflow `Compare Orphadata gene handoff with ClinGen and G2P
evidence` follows the [Orphadata recipe](../orphanet-mcp-server/README.md#compare-a-gene-association-with-clingen-and-g2p).
Supply the subtype, symbol and HGNC ID from that handoff, keep the Orphadata
evidence separately, and choose one G2P stable ID from an observed summary.
The example uses ORPHAcode `284963`, FBN1, HGNC:3603 and G2P01013. The code verifies
that G2P ID is still in the current summary before reading its full record and
checking the exact HGNC ID. No other record is chosen automatically.

The current ClinGen CSV is filtered by HGNC ID, retaining up to 100 assertions
plus an overflow check. The complete export handle remains available. A staged
SQL selection can include `_rowid`, a local row identifier, alongside the native
columns. Repeated assertions and conflicting classifications stay separate;
no match is scoped to that retrieved file. The embedded validity subset is not
used. G2P and export failures retain successful peer evidence. An `inspect_*`
status leaves identity unverified until its staged response is examined.

The result explicitly leaves disease equivalence unverified. Compare the
Orphadata mapping relation/validation and each source's disease identifiers,
inheritance, mechanism, evidence classification, panel and dates before drawing
cross-source conclusions. Matching HGNC IDs does not make those assertions
interchangeable. See the [validation review](../../docs/audits/2026-10-06-gene-disease-workflow-review.md).

## Clinical actionability

ClinGen's [official downloads page](https://search.clinicalgenome.org/kb/downloads)
links separate Adult and Pediatric feeds. This adapter exposes:

- `GET /actionability/{Adult|Pediatric}/summ`: nested JSON by default, or `flavor: "flat"`.
- `GET /actionability/{Adult|Pediatric}/assertions`: original TSV and lossless queryable records,
  `assertion_type: "consensus"` by default or `"all"`.

```javascript
const [adult, pediatric] = await Promise.all([
  api.get("/actionability/Adult/summ", { flavor: "flat" }),
  api.get("/actionability/Pediatric/summ", { flavor: "flat" }),
]);
return { adult, pediatric };
```

Keep age contexts separate and retain gene/disease identifiers, source classifications,
report versions and curation/literature dates when present. Clinical actionability is a
separate evidence domain from variant pathogenicity, dosage sensitivity and gene-disease
validity. Preserve failed-call markers and staging handles when combining results; inspect
staged schemas with `clingen_get_schema` before querying them.

The response preserves the original JSON text in `raw_json` and parsed JSON in
`raw_response`, or the original TSV in `raw_tsv`, plus context, source URL, retrieval
time, HTTP validators and a SHA-256 of the source bytes. Flat JSON and TSV also expose
native `columns` and lossless `records`, preserving duplicates, empty strings, zeros,
identifiers and source status. After staging, query `actionability_records`; quote
native names such as `"# docId"` and `"status-overall"`. No gene filtering or provider
paging is assumed. All tool aliases, including SQL/schema helpers and error responses,
carry verifiable citations. Complete MCP envelopes over 30 KiB stage for recovery.

Optional `expected_sha256` rejects changed bytes with 409 and expected/observed hash
evidence; it does not retrieve an archived release. Native JSON/TSV ordering and anonymous
scorer labels vary between observations. Pediatric AC104 (Gaucher disease) also returned
different consensus assertions with unchanged report metadata. Preserve each observation
and its original text/hash; neither anonymous scorer labels nor report metadata alone
establish a stable cross-snapshot identity or classification. Retrieval time and HTTP
validators are not curation dates. The adapter does not reconcile these differences.

Requests have one 30-second deadline covering fetch and body reading, an 8 MB streamed
response limit, no redirects and no automatic retries. A stalled fetch, reader or stream
cancellation cannot bypass the deadline. Partial responses are rejected; native HTTP
errors retain body, status, response hash and `Retry-After` guidance. Larger feeds require
provider downloads outside this tool.

October 3 native and local Worker observations through both aliases cover all eight
age/format combinations: Adult/Pediatric nested JSON **154/131 reports**, flat JSON
**255/196 rows**, consensus TSV **323/306 rows**, and all-assertions TSV **3,375/3,251
rows**. Counts are dated observations, not release guarantees. Adult exports include
**8 flat, 7 consensus and 46 all-assertion Retracted rows**; these remain intact, so
inspect `status-overall` before selecting evidence. Separate downloads are compared
with their ordering and scorer-label variability explicitly recorded; each MCP response
retains the exact original bytes for independent parsing and hash verification.

## Current gene-disease validity curations

`GET /validity/export` reads ClinGen's [official current CSV summary](https://search.clinicalgenome.org/kb/gene-validity/download),
listed on the [provider downloads page](https://search.clinicalgenome.org/kb/downloads).
Use the existing Code Mode tool:

```javascript
return await api.get("/validity/export");
```

The response retains every assertion, all native columns, raw CSV, source preamble,
HTTP validators and SHA-256. Classifications, inheritance, SOP, expert panel and
report links remain separate for each row, including multiple assertions for the
same gene/disease. No classification ranking or variant-pathogenicity inference
is applied. Classification dates, file-created text and retrieval time are distinct.

Optional `expected_sha256` rejects changed response bytes; it does not retrieve
an older release. This route has no provider filtering/pagination. Large results
use the existing staging tools: retain the handle, inspect `clingen_get_schema`,
and filter with `clingen_query_data`. Retrieval is bounded to 8 MB and 30 seconds.
Errors do not fall back to the embedded subset. The export summarizes assertions;
it is not a download of each assertion's full supporting evidence dossier.

October 3 local Worker acceptance recovered all **3,695 assertions** from the
**1,127,611-byte** native CSV through both aliases, with exact source bytes, native
columns, preamble and parsed rows. The SQL table is `validity_curations`; quote native
column names such as `"GENE SYMBOL"` and `"GENE ID (HGNC)"`. Multiple ACO2 inheritance
assertions and ACAT2's “No Known Disease Relationship” label remain distinct.
`/validity/curations` and its gene/filter routes retain the separately labeled embedded
subset for compatibility.

## Current dosage curations

`GET /dosage/curations` is an adapter route over ClinGen's
[official gene-only CSV](https://search.clinicalgenome.org/kb/gene-dosage/download).
It retrieves the current export in the existing Worker:

```javascript
return await api.get("/dosage/curations");
```

The response retains `raw_csv`, all native columns in `records`, the source preamble,
source URL, retrieval time, HTTP validators and response SHA-256. Classification strings
and source `DATE` timestamps remain unchanged; “Not yet evaluated” is not converted to
“No evidence.” The export covers genes, not genomic regions or assembly coordinates.

Large results use the existing staging path. Pass the returned handle to
`clingen_get_schema`, then filter with `clingen_query_data`; the table hint is
`dosage_curations`. Keep the staging handle or error marker intact in Code Mode.
There is no upstream gene filter or pagination. Optional `expected_sha256` rejects changed
bytes; it does not retrieve a historical release. Requests reject redirects, limit streamed
responses to 8MB and time out after 30 seconds. Invalid or incomplete CSV fails explicitly.
October 3 local Worker acceptance recovered all **1,715 rows** from the
**326,682-byte** native CSV through both aliases, preserving source bytes and all cells.
Quote native SQL columns such as `"GENE SYMBOL"` and `"HGNC ID"`. A gene missing from this export is not proof of absent evidence elsewhere in ClinGen.

## Embedded dataset limitations

The legacy `/validity/curations`, `/validity/classifications`, `/validity/gceps` and
`/dosage/genes*` routes return partial embedded subsets with a 2026-03 base, not
current comprehensive ClinGen releases. `_dataset` records that limitation on each
response, including no-match results. An absent gene is not evidence that ClinGen lacks
a curation. Use the [current official downloads](https://search.clinicalgenome.org/kb/downloads)
for full coverage.

On October 1, 2026, nine assertions for PALB2, ATM, CHEK2 and CDH1 were checked
against the [official gene-validity export](https://search.clinicalgenome.org/kb/gene-validity/download).
Four cancer-predisposition records now use the provider's Definitive classifications,
current disease names/MONDO identifiers, SOPs, panel names, timestamps and assertion links.
Five additional assertions preserve recessive PALB2/ATM conditions, CHEK2's Refuted
ovarian and Limited colon associations, and CDH1's No Known Disease Relationship
ovarian assertion. Classifications apply to each gene–disease–inheritance assertion,
not to the gene as a whole. `source_checked_on` is the local review date; `report_date`
retains the provider timestamp for these CSV-reviewed rows.
Code Mode also discovers `/validity/classifications` and `/validity/gceps`; their
counts refer to the embedded subset only.

A further 21 assertions across BRCA1, BRCA2, TP53, MLH1, MSH2, MSH6, APC, RB1,
PTEN, VHL and WT1 were checked against ClinGen's gene-summary pages and linked
assertion reports on October 1. These replace eleven legacy rows with corrected
disease identities, SOPs, dates and working assertion links. Recessive Fanconi-anemia
and mismatch-repair assertions are separate from dominant cancer predisposition;
MLH1/MSH2 breast-carcinoma assertions are Refuted and MSH6's is Disputed. APC and
WT1 each retain two distinct disease entities. See, for example,
[MLH1's current curations](https://search.clinicalgenome.org/kb/genes/HGNC:7127).

For these HTML-reviewed rows, `report_date` preserves the displayed classification
date at day precision. It is not inferred from the report URL: the October 1
BRCA2 recessive report displayed April 19, 2019 despite its old 2018 URL. October 3
reconciliation replaces that link with the current CSV assertion URL. The follow-up
reviews below cover the remaining legacy rows; the subset is not a complete current release.

The pharmacogenomics follow-up removed eight uncorroborated legacy validity
claims for DPYD, TPMT, CYP2D6, CYP2C19, CYP2C9, UGT1A1, NUDT15 and SLCO1B1.
Their former "CPIC Pharmacogenomics GCEP" attribution, Definitive labels, dates
and constructed assertion URLs could not be corroborated. Queries return a
separate `curation_review` with gene-summary source links and the review date;
these notices do not contribute to `curations`, `total` or classification/panel
counts. Notice selection uses only gene or symbol/HGNC search, independently of
clinical filters. Exclusion is not a Refuted/No Known Disease Relationship
assertion or proof of global absence. CPIC/ClinPGx drug-guidance levels remain a
different evidence category; see [TPMT's source summary](https://search.clinicalgenome.org/kb/genes/HGNC:12014).

Source-checked validity remains available for
[G6PD](https://search.clinicalgenome.org/kb/genes/HGNC:4057) (two distinct X-linked
assertions), [RYR1](https://search.clinicalgenome.org/kb/genes/HGNC:10483)
(hyperthermia and separate dominant/recessive myopathies), and
[CACNA1S](https://search.clinicalgenome.org/kb/genes/HGNC:1397) (Moderate malignant-
hyperthermia validity). These six records preserve corrected disease identities,
inheritance, SOPs, panels, assertion URLs and day-precision classification dates.
Other evidence routes, including DPYD dosage, remain available.

The cardiovascular review replaced ten legacy gene records with 39 source-checked
assertions for FBN1, MYH7, MYBPC3, LMNA, TTN, KCNQ1, KCNH2, SCN5A, DSP and PKP2.
Distinct disease and inheritance assertions retain their own classifications:
[MYBPC3](https://search.clinicalgenome.org/kb/genes/HGNC:7551) dilated-cardiomyopathy
assertions are Limited for both AD and AR inheritance; [TTN](https://search.clinicalgenome.org/kb/genes/HGNC:12403)
hypertrophic cardiomyopathy is Limited and its arrhythmogenic relationship is Disputed.
The updated [SCN5A](https://search.clinicalgenome.org/kb/genes/HGNC:10593) rhythm-disorder
identity is preserved alongside its separate dilated, arrhythmogenic and congenital
heart-disease assertions. Report dates use displayed classification days, including
MYH7's March 4, 2026 date despite the old 2025 report URL; October 3 reconciliation
updates that URL to the current CSV link.
Panel labels follow the provider's gene summaries, with the linked current congenital-
myopathies panel name retained consistently.

The final legacy-row review replaced 22 renal, metabolic, hematologic, neurological,
developmental and endocrine gene records with 42 supported assertions. These include
separate dominant/recessive [PKD1](https://search.clinicalgenome.org/kb/genes/HGNC:9008),
GBA1 and F5 entities; six [HBB](https://search.clinicalgenome.org/kb/genes/HGNC:4827)
entities; and the August 2026 Moderate/semidominant FGFR3 CATSHL assertion.
MECP2, FMR1 and DMD preserve the provider's XL inheritance label. The HBB sickle-cell
assertion retains the report's obsolete disease label and `mondo_status: "obsolete"`;
no replacement identifier or classification is inferred from ontology obsolescence.

The former SMN1, TSC1 and TSC2 validity claims could not be corroborated and now
return separate `curation_review` notices, alongside the eight pharmacogenomic
exclusions above. Each notice has its own `review_note`: SMN1's source says no
curations have been published, while TSC1/TSC2 expose dosage and actionability
evidence. These categories remain available and are not converted into validity
assertions. [NF2's summary](https://search.clinicalgenome.org/kb/genes/HGNC:7773)
supports its corrected disease identity, classification, inheritance, panel and
date. The October 3 current CSV now establishes **SOP 6** and the full classification
timestamp **2019-02-27T17:00:00.000Z**. Its source URL/check date identify that evidence;
this summary verification does not establish the full assertion evidence dossier.

All **117** retained embedded validity assertions were reconciled with the October 3
CSV by exact current report URL, gene/HGNC, disease/MONDO, inheritance, classification,
SOP and classification day. Eight stale assertion links were corrected. Legacy panel
abbreviations are not claimed to equal full CSV panel names. This completes review
of the retained subset, not complete ClinGen coverage. Large unfiltered responses
still stage with ontology warnings and excluded-claim review context intact.

The official dosage legend uses **30** for an autosomal recessive phenotype and **40**
for dosage sensitivity unlikely. Some legacy embedded records incorrectly used 40 with
recessive descriptions. On September 30, CFTR, PAH and DPYD were reconciled against the
[official CSV](https://search.clinicalgenome.org/kb/gene-dosage/download) and their linked
curation reports: HI is 30 for each. CFTR TS is **-5 (not yet evaluated)**, distinct from
0 (evaluated with no evidence). Their `review_date` now matches the provider's evaluation
date; `source_url` and `source_checked_on` identify the correction evidence. This is a
local correction, not a continuously refreshed dataset.

October 1 review removed unsupported numeric scores and evaluation dates from six more
records. [HBB](https://search.clinicalgenome.org/kb/gene-dosage/HBB),
[CYP2D6](https://search.clinicalgenome.org/kb/gene-dosage/CYP2D6),
[UGT1A1](https://search.clinicalgenome.org/kb/gene-dosage/UGT1A1) and
[G6PD](https://search.clinicalgenome.org/kb/gene-dosage/G6PD) report **Awaiting Review**;
their native status and dosage IDs are retained with `curation_status: "awaiting_review"`.
[SMN1](https://search.clinicalgenome.org/kb/genes/HGNC:11117) reports no published
curations (`no_published_curation`). [TPMT](https://search.clinicalgenome.org/kb/genes/TPMT)
only established pharmacogenomics evidence in the inspected page, so dosage remains
`unverified`; absence from the inspected gene-only export is not proof of absent ClinGen
evidence. These six records retain their lookup identities with **null** `hi_score`,
`ts_score` and `review_date`. Null is neither 0 nor -5 and never matches numeric score
filters. Do not coerce it to zero in Code Mode. Each record has a dated source link;
these checks do not establish comprehensive or continuously refreshed coverage.

A further October 1 reconciliation checked the remaining 24 published embedded dosage
rows against the official CSV's classifications and date column. Corrected gene-level
TS to **0** for SHANK3, MECP2, RAI1, PMP22, FOXG1, MBD5 and DYRK1A, and to **1** for
EHMT1. Regional duplication evidence must not be substituted for a gene-level score.
All 24 evaluation dates now match that export and have dated source links.
[HTT](https://search.clinicalgenome.org/kb/gene-dosage/HTT) is **Under Primary Review**
(ISCA-31043), retained as `under_primary_review` with null scores and date, separate
from Awaiting Review and evaluated no-evidence results. Its numeric filters exclude it.
The score review is distinct from the description review below. The gene-validity
subset review is described above; existing Code Mode routes and staging remain.

The October 1 description review checked the 24 remaining legacy clinical summaries.
Twenty-three now use report-based paraphrases with `description_review` recording
the source, check date and summary status. These retain distinctions between focal
and regional gains, loss of function and increased dosage, and variant-specific
phenotypes. For example, [DMD](https://search.clinicalgenome.org/kb/gene-dosage/HGNC:2928)
intragenic duplications do not establish whole-gene triplosensitivity;
[KCNQ1](https://search.clinicalgenome.org/kb/gene-dosage/HGNC:6294) retains dominant
long QT and recessive Jervell and Lange-Nielsen contexts. Unsupported universal
de novo percentages and deterministic genotype/severity statements were removed.

[EHMT1's gene summary](https://search.clinicalgenome.org/kb/genes/HGNC:24650) and
the official CSV report HI/TS scores **3/1**, while its
[linked dosage report](https://search.clinicalgenome.org/kb/gene-dosage/HGNC:24650)
says **Awaiting Review**. The local row retains the export scores/date, identifies
their `score_source_url`, and exposes `description_review.status: "source_conflict"`
with both source observations. Its old clinical prose is not treated as verified.
Fresh October 3 CSV, gene-summary and linked-report reads reconfirm this conflict;
it remains unresolved. NF2's SOP is now established separately from the validity CSV.

APC and MYH7 also preserve report-displayed dates in `provider_last_evaluated`,
separately from the date component of the export timestamp in `review_date`.
No date conversion or source-precedence resolution is inferred. These are dated
source observations; they do not make the embedded subset continuously current.

## Development

```bash
./scripts/dev-servers.sh clingen            # run locally (port 8825)
pnpm --filter clingen-mcp-server run deploy   # deploy to Cloudflare Workers
```

See [`docs/adding-mcp-servers.md`](../../docs/adding-mcp-servers.md) and the root [README](../../README.md) for the full architecture (Code Mode, staging, portals).

---

*Auto-generated baseline README — refine with server-specific detail as needed.*

<!-- license-and-data-terms:start -->
## License and data terms

The code in this repository is licensed under the Apache License 2.0 (see `LICENSE`).
If you use it in your work, please cite it (see `CITATION.cff`). Citation is requested, not required.

The license covers the code only. Data that this server returns comes from ClinGen and stays under the terms of that source: CC0.
You are responsible for your use of the data under those terms.
<!-- license-and-data-terms:end -->
