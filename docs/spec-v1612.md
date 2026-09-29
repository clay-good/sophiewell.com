# spec-v1612 — The drop surface and routing

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1610](spec-v1610.md). **Depends on:** [spec-v1611](spec-v1611.md).

## 1. How files arrive

Three ways in, one code path after:

| Way in | API | Where it works |
|---|---|---|
| Drag and drop onto the home page | `drop` event; `DataTransferItem.webkitGetAsEntry()` to walk dropped folders | desktop browsers |
| "Open a file" button | `<input type="file" multiple>` | everywhere, including phones |
| "Open a folder" button | `<input type="file" webkitdirectory>` (Baseline since 2025) | shown only when `'webkitdirectory' in HTMLInputElement.prototype` and the device is not a phone; hidden otherwise, never a dead button |

All three produce the same list of `{ file, relativePath }` and hand it to one function,
`intake(list)`. The File System Access API (`showDirectoryPicker`) is not used: it is
Chromium-only and adds nothing the two inputs don't.

**The home page markup** (edits to `index.html` and the home view only):

- Under the search box, one line: *"Or [open a file] or [open a folder]. Nothing is
  uploaded."* The two are `<button>`s styled as links, each wired to a hidden input.
- A page-level `dragenter` shows an overlay on the box: *"Drop to read it here. Nothing is
  uploaded."* `dragleave` and `drop` remove it. The overlay is `aria-hidden`; the buttons
  are the accessible path.
- The "Try:" row gains the chip *"a sample remittance file"* that calls `intake()` with
  the bundled synthetic 835 ([spec-v1611](spec-v1611.md) §3).
- The search corpus gains entries so typing "835", "remittance file", "price file",
  "C-CDA", "my records" or "upload" shows the matching file tools plus the line *"You can
  also drop the file on this page."*

## 2. What happens after a drop

`intake(list)` reads each file's head in a worker, calls `recognize()`, and then:

| Situation | What the reader sees |
|---|---|
| One file, one certain tool | The tool opens with the file loaded and runs. A line above the result: *"Read as a remittance (835) file: starts with ISA; ST01 is 835."* with a "Not right? Choose another tool" link. |
| One file, several tools (for example an 835 has four) | The primary tool (the first in the registry row) opens and runs; the others are listed under the result as "Also from this file:" links that reuse the file without a new drop. |
| One CSV, likely match | The matched tool opens at its column-mapping step (the step that exists today). Nothing runs until the reader confirms. |
| One file, ambiguous or unknown | A short panel with the evidence and the choices, or the "what we read" message ([spec-v1611](spec-v1611.md) §5). |
| Several files or a folder | The **inventory** (§3). |

The URL changes to the tool's route (`#x12-835-reader`) so back and forward work, but the
file itself is never in the URL: it's held in memory by the hand-off (§4). Reloading the
page shows the tool empty, with the line *"Files aren't kept after a reload. Drop it
again."*

## 3. The inventory

For more than one file, a table replaces the home results:

| File | What it is | Goes to | Status |
|---|---|---|---|
| `2026-09/era_0912.835` | Remittance (835), 2 transactions | Remittance reader, Denial pattern report, Appeal worklist | Ready |
| `2026-09/era_0913.835` | Remittance (835), 1 transaction | same | Ready |
| `prices/mercy.csv` | Hospital price file (CSV) | Price file check | Ready |
| `notes.docx` | Word document | Packet linter | Ready |
| `claims.xlsx` | Excel workbook | none | Save as CSV |
| `.DS_Store` | system file | skipped | — |

Then **one action per tool**, not per file: *"Run the remittance reader on 12 files."*
Tools that accept several files ([spec-v1611](spec-v1611.md) §3) get all of that kind at
once, so a month of remittances becomes one denial pattern report and one appeal
worklist. Tools that take one file at a time get a "Run each" action that shows results
one after another on one page, each under its file name.

The inventory is a view of the same registry, so a new file tool shows up here the day it
is registered, with no change to this spec's code.

## 4. The hand-off: tools accept files they didn't pick

Each file tool today owns its `<input type="file">` and its change handler. The change is
mechanical and the same for every tool:

1. Split the handler into "get files" (the input) and `acceptFiles(files)` (everything
   after).
2. Export `acceptFiles` from the tool's view alongside its renderer.
3. `intake()` renders the tool, then calls its `acceptFiles` with the in-memory files.

A tool's own picker keeps working exactly as before. The registry gate
([spec-v1611](spec-v1611.md) §3) fails when a registered tool doesn't export
`acceptFiles`.

## 5. Limits, progress and failure

- Recognition reads only heads, so an inventory of 2,000 files appears in seconds.
  Running tools reads whole files, in the tool's worker, with the existing progress
  status line.
- A file that fails in its tool (malformed segment, schema error) shows the tool's own
  error on that row. The other files still run.
- The memory ceiling is the tool's own stated limit ([spec-v1501](spec-v1501.md) §3: 50 MB
  per CSV; streamed kinds have their own). An oversized file is refused on its row with
  the limit, not truncated.
- Everything runs with the network blocked. The Content Security Policy is unchanged:
  workers load from `'self'` and files are read with `Blob` APIs, which `connect-src
  'self'` does not affect.

## 6. Copy

- The word is "open" or "drop," never "upload": nothing is uploaded.
- Every file-derived screen carries the line *"Read in this tab. Not uploaded, not kept."*
- House vocabulary stays off the screen: no "kind", "registry", "intake" or "hand-off".

## Tests

- Playwright, all three engines: drop the sample 835 on the home page → the reader runs;
  open a folder of mixed samples → the inventory lists each with its tool; the folder
  button is absent on the mobile viewport.
- Keyboard only: tab to "open a file," choose the sample, reach the result, with focus
  moved to the result heading.
- A reload after a drop shows the "drop it again" line and no stale result.
- The URL after a drop contains the tool route and nothing derived from the file.
- Network blocked for the whole suite; no request is made during intake or runs.
