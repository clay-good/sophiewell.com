# spec-v1610 — Drop a file: the one box takes files too (charter)

**Status:** Proposed, September 29, 2026. Specs only; nothing here is built.
**Program ledger:** [scope-file-intake.md](scope-file-intake.md).
**Specs:** spec-v1610 (this charter) through [spec-v1615](spec-v1615.md).
**Builds on:** the one box ([scope-one-box.md](scope-one-box.md)), the upload workbench
([spec-v1501](spec-v1501.md) §3), the file tools of [spec-v1515](spec-v1515.md) and
[spec-v1516](spec-v1516.md), and the refresh contract of [spec-v1517](spec-v1517.md).

## What this does for the reader

Today a biller with a remittance file has to know that a tool called "Remittance File
(835) Reader" exists, search for it, and open it before they can use it. A patient with a
record downloaded from their portal has no idea that five calculators could read it. The
file tools are good and nobody can find them.

After this program, the reader drops whatever they have onto the home page (a file, a
few files, a folder or a zip), and the site says what each file is, opens the tool that
reads it, and runs it. A folder of mixed files gets a table: each file, what it is, and
where it went. Nothing leaves the tab.

| The reader drops | They get |
|---|---|
| A remittance (835) file | the remittance reader, run, with the denial worklist one click away |
| A folder of 30 remittance files from one month | one combined remittance analysis and one appeal worklist across all 30 |
| A hospital's price file | the price-file check, run |
| Their own record downloaded from a patient portal (C-CDA) or a FHIR export | the calculators their record can fill, with the values and dates shown |
| Their insurer's claims export (CARIN Blue Button) | the claims reader ([spec-v1602](spec-v1602.md)) |
| A pharmacy fill history CSV | the adherence tools whose columns it matches |
| A prior-authorization packet (PDF, DOCX, images) | the packet linter |
| Something we can't read | exactly what we saw, and the list of what we can read |

## The design decision: one box, not two

The home page stays one box ([spec-v751](spec-v751.md)). A second hero for files would
split attention and break the page's one promise. Instead:

1. **The box accepts a drop.** Dragging a file anywhere over the home page turns the box
   into a drop target ("Drop to read it here. Nothing is uploaded."). Dropping on the page
   outside the box works too.
2. **One quiet line under the box** makes it discoverable without competing: *"Or open a
   file or folder"*, two buttons styled as links. The folder button appears only where
   the browser supports choosing folders ([spec-v1612](spec-v1612.md) §1).
3. **A sample chip.** The existing "Try:" row gains one chip, *"a sample remittance file"*,
   which runs the same path with a bundled synthetic file. A reader sees what dropping
   does before they have to trust it with their own file.
4. **Search knows about files.** Typing "835", "remittance file", "price file" or "my
   records" surfaces the file tools and the line "you can also drop the file on this page."

## Rules for the whole program

1. **Recognition is deterministic and shown.** A file's kind comes from its contents
   (signatures, headers, keys), never from its name alone, and the result always says
   what evidence decided it ([spec-v1611](spec-v1611.md)).
2. **Never guess.** A file that matches no kind, or two kinds equally, is shown as such.
   The reader picks, or learns what we accept. A wrong guess run confidently is worse than
   no answer.
3. **Nothing leaves the tab, and nothing is kept.** Files are read in a worker, held in
   memory, and gone when the tab closes. No value that came from a file is ever written to
   the URL, history, storage or a report link ([spec-v1613](spec-v1613.md) §5).
4. **Every answer states its data.** A result that used a bundled dataset names the
   dataset, its edition and when it was last checked; a dataset past its date stops the
   answer instead of quietly using old numbers ([spec-v1614](spec-v1614.md)).
5. **Every run can be proved.** A run produces a receipt: which files (by hash), which
   tool, which code version, which data editions, and a hash of the result
   ([spec-v1615](spec-v1615.md)). The same inputs give the same receipt.
6. **One registry.** Every tool that reads a file is listed in one table with the kinds it
   accepts. A file input that isn't in the table, or a table row with no tool, fails CI.

## What the program will not do

| Out | Why |
|---|---|
| Upload to a server "for bigger files" | rule 3, and the site has no server |
| Read free text in notes to fill clinical scores | judgment over free text ([spec-v1500](spec-v1500.md)); only coded values (LOINC, units, dates) fill fields |
| OCR scanned images outside the packet linter | error-prone and slow in a browser; images route to the packet linter, which already handles them, and nowhere else |
| Remember files between visits | [product decision: no persistent input memory](product-decisions.md#no-persistent-input-memory) |
| An account or a saved workspace | same |

## The queue

| Spec | What it does | Depends on |
|---|---|---|
| [v1611](spec-v1611.md) | File recognition: the signature table, archives, folders, limits | — |
| [v1612](spec-v1612.md) | The drop surface and the routing: one box, the inventory table, hand-off to tools | v1611 |
| [v1613](spec-v1613.md) | Records to calculators: a patient's record fills the tools it can | v1611, v1612 |
| [v1614](spec-v1614.md) | Data truth: honest manifests, real refresh builders, freshness at run time | — |
| [v1615](spec-v1615.md) | Receipts and agent parity: provable runs, the same recognizer over MCP | v1611, v1614 |

**Build order.** v1614 first and in parallel with the rest: it fixes a problem that exists
today ([scope-file-intake.md](scope-file-intake.md), "What the audit found"), and every
other spec leans on its freshness status. Then v1611 → v1612 (the feature is usable at
this point, for the file kinds that already have tools) → v1615 → v1613.

## Acceptance for the whole program

- Dropping each bundled sample file on the home page opens and runs the right tool, in
  Chromium, Firefox and WebKit (Playwright), with the network blocked.
- Keyboard-only and screen-reader users can do everything a drag can, through the two
  buttons (axe clean; the status line is `aria-live`).
- The registry gate and the "never guess" tests pass ([spec-v1611](spec-v1611.md) Tests).
- No existing tool's own file input changes behavior; each gains the hand-off entry point
  and keeps its own picker.
