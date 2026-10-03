# spec-v1623 — Build: file intake (recognition, drop surface, routing, hand-off)

**Status:** Build spec, September 29, 2026. Implements [spec-v1611](spec-v1611.md) and
[spec-v1612](spec-v1612.md). **Plan:** [spec-v1620](spec-v1620.md), milestone M3.
**Depends on:** M1 ([spec-v1622](spec-v1622.md)) for the data stamp shown on results.

Each step below is one pull request that leaves `npm test`, `npm run lint` and the e2e
suite green. No step changes a tool's compute or its answers.

## Files

| File | New or changed | Holds |
|---|---|---|
| `lib/file-kinds.js` | new | the registry table and `recognize(head, meta)`; pure; imported by browser worker, tests and MCP |
| `lib/file-head.js` | new | `readHead(file, bytes = 262144)` (Blob.slice + TextDecoder with BOM sniff), `sha256(file)` streaming via `crypto.subtle` in 8 MB chunks |
| `lib/x12-envelope.js` | new | reads ISA separators, GS01/GS08, ST01 from a head; pure. The existing `x12-*-v1515.js` parsers keep their own full parsers |
| `lib/json-head.js` | new | depth-limited streaming tokenizer returning top-level keys, `resourceType`, first `meta.profile`, and NDJSON detection from a head |
| `lib/zip-reader.js` | new | browser zip reader: end-of-central-directory scan, member list, per-member `DecompressionStream('deflate-raw')` stream; stored and deflate only; limits from §Limits |
| `lib/intake-worker.js` | new | worker: takes `{ file, relativePath }[]`, returns per-file `{ kind, confidence, evidence, tools, size, relativePath }`; unwraps zip and gzip |
| `views/intake.js` | new | the home line, the drop overlay, the single-file result banner, the inventory table, the ambiguous/unknown panels |
| `scripts/check-file-kinds.mjs` | new | the registry gate; added to `npm run lint` |
| `test/fixtures/file-kinds/` | new | one synthetic sample per kind (list in §Fixtures) |
| `test/unit/file-kinds.test.js`, `test/unit/zip-reader.test.js`, `test/unit/json-head.test.js`, `test/unit/x12-envelope.test.js` | new | unit tests |
| `test/integration/intake.spec.js` | new | Playwright, three engines, network blocked |
| `index.html` | changed | the one line and two buttons under `#hero-search`; one "Try:" chip |
| `app.js` | changed | page-level `dragenter/dragover/drop` on `#home-view`; the chip handler; route hand-off (§Step 4) |
| `views/group-v1515.js`, `views/group-v1516.js`, `views/group-v1509.js`, `views/group-v1513.js`, `views/rx-match-workbench.js`, `views/upload-workbench.js`, `views/pa-lint.js` | changed | each file tool exports `acceptFiles` (§Step 3) |
| `data/tool-copy/` or the search corpus source | changed | search entries for "835", "remittance file", "price file", "C-CDA", "my records", "upload" |
| `sw.js` | changed | precache the new modules (the shell list) |

## The registry row

Each row of the table in `lib/file-kinds.js`:

| Field | Type | Meaning |
|---|---|---|
| `kind` | string | `x12-835`, `hpt-csv`, `ccda-ccd`, ... |
| `label` | string | reader-facing, e.g. "Remittance (835) file" |
| `family` | `'x12' \| 'xml' \| 'json' \| 'csv' \| 'binary'` | which check group runs it |
| `match(head, facts)` | function | returns `null` or `{ confidence, evidence: string[] }`; `facts` is what the family parser already extracted (so each head is parsed once) |
| `tools` | `{ id, multi: boolean, status: 'live' \| 'planned' }[]` | first is primary |
| `sample` | path | its fixture |

CSV tools are not hand-listed: the CSV family builds its candidates at load time from each
upload-workbench tool's declared `fields` (the same objects `uploadWorkbench` receives),
exported from each view as `uploadFields` so the worker can score headers without
rendering anything.

## Steps

### Step 1 — Recognition core (no UI)

Build `file-head`, `x12-envelope`, `json-head`, `zip-reader`, `file-kinds` and their unit
tests, and the fixtures. The recognizer covers every kind in [spec-v1611](spec-v1611.md)
§2, including planned ones (they return `status: 'planned'` tools). `check-file-kinds.mjs`
lands here with the first three gate rules; the `acceptFiles` rule is added in Step 3.

Done when: every fixture is recognized with the expected kind, confidence and evidence;
the "never guess" cases in [spec-v1611](spec-v1611.md) Tests pass; a generated 2 GB
sparse TiC file (written in the test's temp dir, not committed) is recognized from its
head in under one second.

### Step 2 — Intake worker and the inventory, behind a query flag

`lib/intake-worker.js` and `views/intake.js`. Reachable only at `#/intake` for review.
Folder walking uses `webkitGetAsEntry` for drops and `webkitRelativePath` for the folder
input. Skipped names (`.` prefix, `__MACOSX/`, `Thumbs.db`, `desktop.ini`) are counted.

Done when: the Playwright spec drops the fixtures folder at `#/intake` and sees one row
per fixture with the right label, and one "skipped" count.

### Step 3 — Hand-off: every file tool exports `acceptFiles`

For each file input, split its `change` handler into the input read and a function taking
`File[]`, and export it from the view module next to `renderers`, keyed by tool id:
`export const acceptFiles = { 'x12-835-reader': (root, files) => ..., ... }`.

| View file | Tool ids |
|---|---|
| `views/group-v1515.js` | `x12-835-reader`, `denial-pattern-report`, `underpayment-check` (two inputs: remittances and fee schedule; the hand-off fills remittances only), `x12-837-check`, `x12-271-reader`, `x12-277-reader`, `hpt-file-check` |
| `views/group-v1516.js` | `appeal-worklist` (835 files input and the CSV workbench) |
| `views/group-v1509.js` | `340b-patient-check` |
| `views/group-v1513.js` | `mpr-gap-days`, `med-sync-plan`, `pdc-star`, `adherence-outreach-list` |
| `views/rx-match-workbench.js` | `340b-rx-match` |
| `views/pa-lint.js` | `pa-lint` |
| `views/upload-workbench.js` | gains `acceptFile(file)` on the object it returns, used by the five workbench tools above |

The gate's fourth rule lands: every registry tool with `status: 'live'` has an
`acceptFiles` entry, and every `type: 'file'` input in `views/` belongs to a registry
tool.

Done when: a unit test per view calls `acceptFiles` with its fixture and gets the same
result as the input path (compare the rendered result text).

### Step 4 — The home page

- `index.html`: under `.task-hero`, a `<p class="hero-files">` with the two buttons and the
  words "Nothing is uploaded." Two hidden inputs: `#hero-file` (`multiple`) and
  `#hero-folder` (`webkitdirectory`). The folder button renders only when
  `'webkitdirectory' in HTMLInputElement.prototype` and `matchMedia('(pointer: fine)')`
  matches.
- The chip "a sample remittance file" loads `test/fixtures/file-kinds/x12-835.835`, copied
  to `samples/` by `scripts/build.mjs` (fixtures aren't shipped; `samples/` is).
- `app.js`: `dragenter` on `#home-view` adds `.drop-active` to `.task-hero`; `drop`
  calls `intake(list)`. Intake for one certain file sets `location.hash` to the tool
  route, renders the tool, then calls its `acceptFiles` with the in-memory files, and
  shows the recognition banner above the result. The files are held in a module-level
  `pendingFiles` map keyed by a random id, cleared on route change.
- The query-flag route from Step 2 is removed; `#/intake` remains only as the inventory
  view reached by a multi-file drop.
- Search corpus entries (see Files).

Done when: the [spec-v1612](spec-v1612.md) Tests pass on all three engines with the
network blocked, axe reports no new violations, and the mobile viewport shows no folder
button and no horizontal scroll (`test:mobile`).

### Step 5 — Excel and unknown messages; reference kinds

The `.xlsx` message, the unknown-file message with the accepted list generated from the
registry labels, and the reference kinds of [spec-v1611](spec-v1611.md) §2.5 recognized
but routed nowhere until [spec-v1621](spec-v1621.md) builds their consumers.

## Limits

One constants block in `lib/file-kinds.js`, printed on the inventory page from the same
constants: 2,000 files per drop; 20 levels of folders; zip total uncompressed 4 GB; any
zip member with ratio over 100:1 refused; head 256 KB. Tool limits stay the tools' own.

## Fixtures (synthetic; no real person's data)

`x12-835.835` (two ST groups), `x12-837p.837`, `x12-837i.837`, `x12-271.271`,
`x12-277.277`, `x12-277ca.277`, `hpt-tall.csv`, `hpt.json`, `tic-in-network.json`,
`tic-toc.json`, `carin-eob.json`, `pas-request.json`, `fhir-clinical.ndjson`,
`ccd.xml`, `apple-health-export.zip` (a minimal `export.xml` and one clinical record),
`fill-history.csv`, `ambiguous.csv` (satisfies two tools), `claims.xlsx` (a real empty
workbook), `unknown.json`, `csv-named.835` (CSV content, `.835` name), `nested.zip`,
`bomb.zip` (generated at test time, not committed), `packet.pdf`.

The X12 fixtures reuse the synthetic files the existing v1515 tests already use where they
exist.

## Build status

| Step | Status | Differs from the spec |
|---|---|---|
| 1 Recognition core | **Built September 29, 2026.** `lib/file-kinds.js` (38 kinds, `recognize`, `recognizeArchive`, `unknownMessage`, `LIMITS`), `lib/x12-envelope.js`, `lib/json-head.js`, `lib/zip-reader.js` (zip, gzip, bomb and size refusals), `lib/file-head.js`; 39 synthetic fixtures; `scripts/check-file-kinds.mjs` in `npm run lint` with the first three rules. | The CSV tools' fields moved from the views into one pure module, `lib/upload-fields.js` (`CSV_TOOLS`), which the views import, instead of each view exporting `uploadFields`: the worker and MCP can then read them without importing a view. The 340B matcher joins `CSV_TOOLS` through its prescriptions file. `sha256(file)` moves to M4 ([spec-v1625](spec-v1625.md)): `crypto.subtle` cannot hash in chunks, so it needs an incremental implementation, and receipts are its first user. A head that is not UTF-8 but is almost all printable is read as Windows-1252 (CMS ships its CSVs that way) and says so. The clinical kinds route to the records panel of [spec-v1624](spec-v1624.md), marked `planned` and `route: true`. |
| 2 Worker and inventory | **Built September 29, 2026.** `lib/intake.js` (`inventory`: folders, nested zips and gzip unpacked, system files skipped and counted, limits and zip bombs refused with a reason), `lib/intake-worker.js`, `views/intake.js` at `#/intake` (file and folder inputs, folder drop through `webkitGetAsEntry`). | The inventory logic is a module of its own so it is tested in Node (`test/unit/intake.test.js`) as well as in the page (`test/integration/intake.spec.js`, three engines, no off-origin request). |
| 3 `acceptFiles` hand-off | **Built September 29, 2026.** Every live file tool exports `acceptFiles` from its view (`group-v1515`, `group-v1516`, `group-v1509`, `group-v1513`, `pa-lint`); the gate's fourth rule fails a live registry tool without one. | One mechanism for all: `lib/hand-off.js` puts the files into the tool's own input with `DataTransfer` and fires `change`, so the hand-off cannot drift from the input path. `test/integration/accept-files.spec.js` proves it per tool: a handed-off fixture renders exactly what choosing it renders, and not what the empty tool shows. `appeal-worklist` routes an 835 to its 835 input and a CSV to its workbench; `underpayment-check` gets the remittances (the fee schedule is chosen on the page). |
| 4 The home page | **Built September 29, 2026.** `index.html`: "Choose files" and, on a wide screen with a fine pointer, "Choose a folder", "Nothing is uploaded.", and the "a sample remittance file" chip (`samples/x12-835.835`, held identical to the fixture by a unit test). `views/home-files.js`: drops and choices are read in the worker; one certain file opens its primary tool with the file in it under a line saying what it was read as, "Read in this tab. Not uploaded, not kept.", "Also from this file:" links and "Not right? Choose another tool"; anything else opens the inventory, which offers one action per multi-file tool ("Open Denial Pattern Report with 2 files"). After a reload the tool says "Files aren't kept after a reload. Drop it again." | The drop surface is `#home-view` (the hero outlines while a file is over it). The reload line reads `history.state`, which records that a file was dropped, never the file, so nothing touches storage. The folder button also needs a viewport at least 600 px wide. The search phrases the spec listed were not added: "835" and "price file" already find their tools by name, and the record phrases wait for M5. `test/integration/home-files.spec.js`: three engines, no off-origin request (the synthetic drop test skips WebKit, which ignores a script-made `DataTransfer`). |
| 5 Excel, unknown, reference kinds | **Built with steps 1-2.** The Excel and unknown messages (with the accepted list) show in the inventory; reference tables say "drop it with the file it should be used for" and open nothing. | Routing a reference table to a tool waits for the tools that consume one ([spec-v1626](spec-v1626.md)). |
