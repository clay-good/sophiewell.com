# spec-v1501 — Shared machinery for the medication-access program

**Status:** Proposed, September 25, 2026. No new tools; every later wave depends on this.
**Charter:** [spec-v1500](spec-v1500.md).

Six pieces. Each exists so that about 100 tools can be kept correct by a weekly job and
an occasional review, not by a person re-reading regulations every January.

## 1. Group Q

Add `Q: 'Medication Access & Pharmacy'` to `GROUP_LABELS` in all five files that
`scripts/lib/group-labels.mjs` lists. The drift check in
`node scripts/check-catalog-truth.mjs` already fails if one is missed.

## 2. The data contract: every changing number has an owner

A tool may depend on a value that changes on a calendar only through one of three
routes. The route is declared in the tool's library module, and a unit test reads the
declaration.

| Route | Used for | How it stays correct | What happens when it lapses |
|---|---|---|---|
| **A. Fetched file** | A machine-readable federal file: the ASP pricing file, NADAC, the FDA NDC directory, Orange Book, Purple Book, the poverty guidelines, the Medicare Coverage Database export | The weekly `data-refresh` workflow fetches it, checks its hash and shape, and opens a pull request ([spec-v1517](spec-v1517.md)) | Past `expiresOn`, the tool stops using it and asks for the value |
| **B. Dated constant** | A number published only as prose or PDF: the Part D out-of-pocket threshold, the IRMAA brackets, the Part A deductible | A row in `pa-staleness-ledger.json` with the source URL, plus a **page watch**: the refresh job hashes the source page and flags the row when the page changes | Past its `validThrough` date (for example, a CY2026 constant on January 1, 2027), the tool asks for the value |
| **C. Reader input** | Anything payer-specific or contract-specific: a plan's deductible, a state's Medicaid threshold, a contract's fee | The reader supplies it; the tool shows where to find it | Nothing lapses |

**The shared accessor.** Every A and B value is read through one function,
`datedValue(id, key, now)` in a new `lib/dated-data.js`. It returns
`{ value, edition, source }` while the value is current and `{ expired: true, edition }`
after. Tools render the expired case as an input field pre-labeled with the old
edition: *"The 2026 Part D deductible was $615. Enter the 2027 figure from the CMS
announcement."* The tool never computes from an expired value on its own.

**Why this matters over decades.** Today a CY2026 constant goes wrong on January 1,
2027 with no signal. Under this contract it goes *silent* on January 1 (the tool asks
for the number) and the page watch has usually flagged the new announcement months
earlier. The maintainer's yearly job becomes: merge the refresh PRs, and update the
flagged ledger rows.

**Page watch.** For each route-B row, the refresh job fetches the source URL, strips
volatile markup, hashes the text, and compares with the hash stored when the row was
last verified. A change writes a line to the refresh PR's summary: *"CMS Part D
announcement page changed since 2026-04-07: re-verify `partd-oop-threshold`."* It
never edits the constant itself. A human reads the new page, because a regex that
extracts a dollar figure from prose will one day extract the wrong one.

## 3. Upload workbench

Several waves take a file instead of a form: a fill history, a remittance file, a
dispensing log, a price file. They share one intake, built on the `pa-lint` posture
([spec-v52](spec-v52.md) §3.2):

- **Formats:** CSV and TSV (RFC 4180, with a delimiter sniff), X12 text
  ([spec-v1515](spec-v1515.md)), and JSON. No XLSX parser is vendored; the page tells
  the reader to save as CSV. Revisit only if readers ask repeatedly.
- **Column mapping:** a deterministic header matcher (a synonym table per field:
  `fill_date`, `date_filled`, `dispense date` and so on) proposes a mapping, and the
  reader confirms or corrects it in a table before anything runs. Unmapped required
  columns block the run and are named.
- **Where it runs:** a Web Worker, entirely in the browser. Nothing is uploaded, stored
  or remembered after the tab closes ([product decision: no persistent input
  memory](product-decisions.md#no-persistent-input-memory)).
- **Output:** an on-screen summary, a row-level results table, and a CSV download of
  the input rows with the result columns appended. A "redacted" download reuses
  `lib/pa/redact.js`.
- **Limits:** 50 MB per file and 500,000 rows, stated on the page. Past that, the tool
  says so; it doesn't truncate silently.
- **Batch mode for form tools.** Any single-case tool in this program whose inputs are
  all scalar can also run over a CSV (one case per row) through the same intake. A
  counselor with 40 families to screen against the poverty line uploads one file
  instead of filling the form 40 times. The tool's own compute function is called per
  row; there is no second implementation.

## 4. Document builder

The generators ([spec-v1504](spec-v1504.md), [spec-v1508](spec-v1508.md)) produce a
letter or request that the reader edits and sends. They share:

- **Output:** print-ready HTML on the page, plus a DOCX download through
  `lib/pa/docx.js`.
- **Blanks the tool will not fill.** Clinical reasoning, the patient's history and
  anything the tool wasn't told appear as a visible, bracketed prompt:
  `[State why the formulary alternatives are not appropriate for this patient]`. A
  document with unfilled blanks carries a banner in the download. Nothing is invented.
- **What the tool does fill:** the parties, the dates it computed, the deadline the
  reader is working to, the regulation that gives the right to ask, the standard the
  reviewer must apply, and the list of enclosures the rule requires.

## 5. Clock engine extensions

`lib/deadline.js` counts calendar and federal business days. The coverage and notice
rules also need:

| Need | Example | Where |
|---|---|---|
| Hours from a timestamp | "72 hours from receipt of the request" | reuse `addHours` from `lib/state-calendar.js` |
| "Calendar days, but a weekend deadline moves to the next business day" | several state Medicaid windows (as reader input) | new `rollForward` option already declared in `deadline()`; test it |
| Month windows | Medicare's 7-month initial enrollment period; 18/29/36-month COBRA durations | new `addMonthsUtc`, end-of-month safe |
| "First day of the month after X" | Medicare general-enrollment effective date; Marketplace effective dates | new `firstOfNextMonth` |
| Midnight counting | the 3-day qualifying hospital stay; the two-midnight benchmark | new `countMidnights(admit, discharge)` |

Each helper gets property tests (month-end, leap day, daylight-saving change) in the
style of the existing deadline tests.

## 6. Licensing screen

Checked for every tool before its spec is marked buildable. The table is filled from
the research recorded in [scope-medication-access.md](scope-medication-access.md).

| Material | Ship? | How we use it |
|---|---|---|
| CFR, U.S. Code, CMS manuals, Federal Register, agency data files | Yes | Rules and numbers, cited to section |
| CMS price-transparency schemas and validators (GitHub `CMSgov`) | Yes (government work; the hospital validator states CC0) | Schema checks in [spec-v1515](spec-v1515.md) |
| HL7 FHIR core and the Da Vinci / CARIN guides | Yes (CC0), except the X12, CPT and NUBC value sets inside them | Structure checks; code values checked for format only |
| CARC, RARC, claim-status and group code **values** | Yes | Denial routing takes the code the reader has |
| CARC and RARC **description text** | **No.** X12's code-list FAQ calls the lists copyrighted and forbids altered descriptions | Codes plus our own plain-language notes, written from scratch, and a link to x12.org/codes. The existing `data/crosswalks/` seed ships eight descriptions verbatim and is being reviewed separately |
| X12 implementation guides (segment layouts, internal code lists such as EB01 and service types) | Facts only | The parser reads the structure; no guide text and no internal-list labels ship. Public CMS and MAC companion guides are the citation, and the labels are our own |
| NCPDP standards and the reject-code list | No | Reject codes are reader input with short original guidance, citing a public state payer sheet (for example, Medi-Cal Rx Appendix D) |
| CPT descriptors | No | Codes are reader input, format-checked only (existing posture) |
| USP chapter text | No | Beyond-use limits cite USP's own free *Compounding BUD Fact Sheet* |
| PQA measure specifications and NDC value sets | Method only, via CMS | The adherence method is taken from the public CMS Star Ratings Technical Notes, never the PQA manual |
| CAQH CORE (now DataSpring) operating rules | Facts only (free to read, no redistribution license) | Code tuples and response-time facts, cited; no rule text |
| Medicare Coverage Database export | Yes, with CPT description columns stripped | LCD article diagnosis checks in [spec-v1505](spec-v1505.md) |

## 7. Copy rules for this program

- Every result carries the posture line from [spec-v77](spec-v77.md) §2 clause 5,
  adapted: *"This is the rule's arithmetic, not a coverage decision. The plan's
  notice and contract control."*
- A deadline answer names the rule, the event that started the clock, and the date,
  in that order: *"42 CFR 423.582: 65 days from the notice date (March 3, 2026), so
  May 7, 2026."*
- Dollar amounts are computed in integer cents and formatted once ([spec-v59](spec-v59.md)).
- House vocabulary stays off the screen: no "tile", "wave", "spec" or "route".

## Tests

- `test/unit/dated-data.test.js`: current, expiring-today and expired values; an
  unknown id throws.
- `test/unit/upload-intake.test.js`: delimiter sniffing, quoted fields with embedded
  newlines, a byte-order mark, header synonyms, and a missing required column.
- `test/unit/deadline-months.test.js`: January 31 plus one month, February 29, and
  the first-of-next-month rule on the last day of a month.

## Build status

- **Built 2026-09-26:** §2's accessor, `datedValue()` and `expiredPrompt()` in `lib/dated-data.js`
  (the first route-B rows, the Medicare amounts in controversy, live in `lib/partd-appeals-v1503.js`
  and are selected by filing year); §5's `addMonthsUtc`, `firstOfNextMonth` and `countMidnights` in
  `lib/deadline.js`, with `rollForward` now tested. Tests: `test/unit/dated-data.test.js`,
  `test/unit/deadline-months.test.js`.
- **Built 2026-09-26:** §1 group Q, with its first tools ([spec-v1502](spec-v1502.md)).
- **Built 2026-09-28:** §3's pure CSV/TSV intake in `lib/upload-intake.js`: delimiter
  detection, quoted fields and embedded newlines, UTF-8 byte limits (50 MiB), a
  500,000-data-row limit, and column mapping by normalized names and synonyms.
  Malformed quotes and inconsistent row widths reject the whole file. Values stay
  strings, preserving leading zeros. Ambiguous mappings require a reader choice;
  validation rejects missing required columns and columns reused for two inputs.
  Tests: `test/unit/upload-intake.test.js`. No external source or clinical rule changed.
- **Built 2026-09-28:** §3's browser Worker and explicit mapping table are live on
  all four [spec-v1513](spec-v1513.md) adherence tools. The file stays local;
  parsing, mapping and computation run in `lib/upload-worker.js`, reusing the
  tools' existing functions
  with structured rows and retaining those rows off the UI thread. The Worker is
  cached with the application shell for offline use. Tests:
  `test/integration/upload-workbench.spec.js` and
  `test/unit/pdc-star-v1513.test.js`.
- **Built 2026-09-28:** adherence uploads now show a capped row-level preview and
  produce full or patient-redacted CSV downloads with result columns appended.
  The complete table remains in the Worker until a download is requested, and
  CSV cells that could run spreadsheet formulas are emitted as text. Redaction
  reuses `lib/pa/redact.js` and always masks the mapped patient column.
- **Built 2026-09-28:** the first scalar batch tool is live on
  `340b-patient-check`. Every CSV or TSV row calls the same pure function as the
  form and exports either its decision or its input error.
- **Built 2026-09-28:** §3's first X12 intake, `x12-835-reader`, validates an
  835's separators and envelope controls in a Worker, then exports a claim table.
- **Built 2026-09-28:** §3's 835 intake also feeds `denial-pattern-report`,
  `appeal-worklist` and `underpayment-check`; all keep remittance and fee-schedule rows in a Worker
  and produce full or patient-redacted CSVs.
- **Built 2026-10-03:** §3's generic batch mode for form tools, `lib/batch-tools.js`. A tool is listed
  with its upload fields (named for its compute function's arguments) and, for a choice, its options and
  aliases. Each row calls the tool's own function in the upload Worker, and the download appends
  `sophiewell_result` and `sophiewell_detail`. **Differed from the spec:** a field marked `fromForm` is
  context the whole file shares (where people live, the program, the year). A blank or missing cell for
  one of those takes the form's answer, so a counselor's file needs only household size and income. Every
  other field is a fact about the row and stays the row's own, blank or not. A missing income is refused,
  and a blank wage cell counts no wages; neither is answered with what the form holds. A tool's
  `formOnly` arguments (a hospital's discount tiers) are never columns: the form gives them to every row.
  The tools are `fpl-percent`, `extra-help-msp-screen` and `fap-discount`. Tests: `test/unit/batch-tools.test.js`,
  `test/integration/fpl-batch.spec.js`.
- **Built 2026-10-03:** §2's page watch, with [spec-v1517](spec-v1517.md#build-status).
- **Built 2026-10-07:** batch mode for `irmaa` (filing status and MAGI per person, the year from the file or
  the form). A bare "MFS" cell is refused with what to write instead: the married-filing-separately brackets
  apply only to someone who lived with the spouse during the year, and SSA uses the single brackets otherwise,
  so the row must say which ("MFS lived with spouse", or "single").
- **Built 2026-10-07:** batch mode for `premium-tax-credit` (a navigator's households: income, size and each
  household's own benchmark premium; region and year from the file or the form). A file with a benchmark column
  also fits `fpl-percent`, so the reader chooses, the credit estimate listed first.
- **Built 2026-10-07:** batch mode for `medicare-ffs-pa-required`: a biller's list of scheduled services
  (code, date of service, and optionally setting and state; a file without them takes the form's answer).
  **Added:** a batch field can be `strict`. This tool reads an unknown state as no state and answers in
  general terms, so a cell like "Tx." would have been answered quietly instead of refused; a strict field
  refuses the row and names the cell. States can be spelled out ("Texas", "District of Columbia").
  Tests: `test/unit/batch-tools.test.js`, `test/integration/fpl-batch.spec.js`.
- **Not yet built:** §3's JSON intake, the remaining X12 transactions, batch mode for the
  other scalar tools (each needs its fields listed in `lib/batch-tools.js`), and upload integration for
  the remaining file-based tools.
- **Built 2026-10-03:** §4's download. `renderPrintable` (`lib/print.js`) takes an optional `docx`, which
  adds "Download as Word (.docx)". The file is built on click by `renderDocumentDocx` in `lib/pa/docx.js`,
  the same deterministic first-party writer the PA lint report uses. While any bracketed blank is left, the
  document opens with a bold "NOT READY TO SEND" line that counts them. The count is read from the
  document itself. The seven [spec-v1504](spec-v1504.md) letter builders use it. Tests:
  `test/unit/document-docx.test.js`, `test/integration/letter-docx.spec.js`. **Not built:** attaching
  files to the download (the enclosures are listed, not bundled).
