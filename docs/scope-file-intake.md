# Scope — file intake: drop what you have, get the answer

**Status:** Specified September 29, 2026. Nothing built yet.
**Specs:** [spec-v1610](spec-v1610.md) (charter) through [spec-v1615](spec-v1615.md).
**When built:** no new catalog entries. The program is a way into the tools that exist and
are planned, a fix to how bundled data is labeled and refreshed, and two MCP tools.

## The idea in one line

The one box already turns a sentence into an answer. This program makes it turn a file
into an answer: drop a remittance file, a price file, a claims export, a health record or
a whole folder, and the site says what each file is, opens the tool that reads it, and
runs it, in the tab, with a receipt.

## Why this, and why now

- **The file tools exist and are hard to find.** Remittance, claim, eligibility and claim
  status readers, the hospital price-file check, the appeal worklist, the adherence and
  340B batch tools and the packet linter all take files. Each hides behind its own name.
- **People already hold these files.** Every certified patient portal must offer a C-CDA
  download (45 CFR 170.315(e)(1)); Medicare's Blue Button and plans' Patient Access APIs
  export CARIN claims; billing offices live in 835s; hospital and insurer price files
  are public.
- **The browser can now do all of it locally.** Folder selection (`webkitdirectory`)
  reached Baseline in 2025; `DecompressionStream` (gzip and deflate-raw, so zip without a
  library) has worked in every current browser since 2023; workers and streaming parsers
  handle multi-gigabyte price files.

## What the audit found

Planning this required reading how data reaches the tools. The finding is recorded in
[spec-v1614](spec-v1614.md): the weekly refresh renews `fetchDate` on hand-written sample
datasets, and the page prints *"fetched"* beneath them. Few tools read those samples
(the [spec-v77](spec-v77.md) doctrine keeps most tools input-driven), so answers are not
wrong today, but the labels are. v1614 fixes the labels first and sets the freshness rules
the file tools need before they read any bundled table.

## Patterns borrowed from the sibling projects

| Pattern | From | Where here |
|---|---|---|
| One drop surface for files, folders and zips, with deterministic classification before any rule runs | Vaulytica's intake | [v1611](spec-v1611.md), [v1612](spec-v1612.md) |
| A result hash and a stamped knowledge-base version, so a report can be re-checked | Vaulytica's `result_hash` and `verify` | [v1615](spec-v1615.md) |
| A build that disables anything depending on a stale source rather than shipping it | Vaulytica's staleness gate | [v1614](spec-v1614.md) §5 |
| The same pure engine behind the page and the agent surface, with a parity test | Vaulytica's CLI parity | [v1615](spec-v1615.md) §3 |
| Uncertainty and provenance as fields, not footnotes | Nidus, Hypnos, Onkos, Harmonia | the evidence line on every recognition; the data stamp on every result |

## Research record

Read September 29, 2026.

| Finding | Effect |
|---|---|
| `webkitdirectory` is Baseline 2025; `webkitGetAsEntry` walks dropped folders; the File System Access API is still Chromium-only | two inputs plus drop; no `showDirectoryPicker` |
| `DecompressionStream` supports gzip, deflate and deflate-raw in all current browsers since May 2023 | zip and `.json.gz` without adding a library |
| Hospital price file CSV v3: row 1 carries `hospital_name`, `last_updated_on`, `version` | certain recognition from the header |
| Transparency in Coverage JSON top-level keys `reporting_entity_name`, `in_network`, `provider_references`; indexes use `reporting_structure` | head-only recognition of multi-gigabyte files |
| Medicare Blue Button 2.0 returns CARIN Blue Button ExplanationOfBenefit bundles (FHIR R4) | the CARIN profile check in recognition |
| Apple Health's export zip carries `export.xml`, `export_cda.xml` and clinical records as FHIR JSON when a portal is linked | vitals from XML, labs only from the FHIR records |
| USCDI v3 C-CDA is what certified portals produce for view/download/transmit; ONC enforcement discretion for 2025–2026 | C-CDA results and vitals by LOINC |

## Verify at build

- The exact Apple Health export layout for clinical records (folder name and file form)
  on current iOS.
- The X12 version identifiers in [spec-v1611](spec-v1611.md) §2.1 against the current CMS
  companion guides.
- Header strings of the CMS reference files ([spec-v1611](spec-v1611.md) §2.5).
- Branch protection and token permissions for the refresh auto-merge
  ([spec-v1614](spec-v1614.md) §5).
- The NCCI file sizes after sharding, against the site's asset budget.

## Rejected

| Idea | Why |
|---|---|
| A second hero section for files | splits the one box; a line under the box and a page-wide drop target are enough ([spec-v1610](spec-v1610.md)) |
| Guessing a file's kind from its name | names lie; content decides and the name is only evidence |
| An XLSX reader | kept rejected ([spec-v1500](spec-v1500.md)); Excel gets a specific "save as CSV" message |
| Reading narrative text in records to answer yes/no questions (smoker, diabetes) | judgment over free text; the reader answers these |
| Filling the URL with file-derived values so links reproduce | a URL is history, sync and screenshots; receipts reproduce results instead |
| Keeping dropped files for next time | no persistent input memory |
| Fetching the files an insurer's index names | network; the reader downloads the ones they want |
