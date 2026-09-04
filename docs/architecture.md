# Architecture

## Overview

sophiewell.com is an offline-first single-page application. Calculation remains
entirely client-side. The browser receives `index.html`, `styles.css`, and
`app.js` from the same origin, boots a vanilla JavaScript application, and renders the home view: one
combobox over all 1,704 utilities, and nothing else. Each utility runs entirely
client side and operates either on user-supplied input or on bundled reference
data served from the same origin.

The one hosted write path is an anonymous tool report: a separate API-only
Cloudflare Worker validates a bounded, user-initiated submission with Turnstile
and writes it to a private D1 queue. The Worker is routed only to
the exact `/api/reports` and `/api/reports/config` paths, has no static asset
binding, and is never invoked during normal
tool use. See [calculator-reports.md](calculator-reports.md).

The application is structurally identical in spirit to encryptalotta.com: one
HTML file, one CSS file, one JavaScript file (or a small set of vanilla ES
modules), a data folder, and a service worker. A Content Security Policy keeps
connections same-origin and permits only the lazy Turnstile script/frame
needed by reporting. The user can save the page and use it offline forever.

## Diagram

```
+---------------------------+         +-----------------------------------+
|         Browser           |         |       Static origin (Pages)       |
|                           |  HTTPS  |                                   |
|  +---------------------+  | <-----> |  index.html                       |
|  | index.html          |  |  same   |  styles.css                       |
|  | styles.css          |  |  origin |  app.js                           |
|  | app.js (router,     |  |  only   |  sw.js                            |
|  |   utilities, math)  |  |         |  data/                            |
|  +---------------------+  |         |    clinical/  formulas + citations|
|           |               |         |    synonyms.json                  |
|           v               |         |    (other small per-tile shards   |
|  +---------------------+  |         |     for the calculators that      |
|  | Service worker      |  |         |     consume a bundled table       |
|  |  (sw.js)            |  |         |     inside their math)            |
|  |  - precaches shell  |  |         |                                   |
|  |  - caches shards    |  |         |                                   |
|  |    on first use     |  |         |                                   |
|  +---------------------+  |         |                                   |
|  | Cache storage       |  |         |  _headers                         |
|  |  (offline copy of   |  |         |                                   |
|  |   shell + shards)   |  |         |  Separate report API Worker.     |
|  +---------------------+  |         |  Private report D1 queue.        |
|                           |         |  No analytics endpoint.           |
|  CSP: bounded exceptions  |         |  No telemetry.                    |
+---------------------------+         +-----------------------------------+
```

There is no server-side calculator, analytics endpoint, telemetry, or AI
inference. Pages serves ordinary traffic. The isolated report Worker accepts
only the deliberate feedback form and cannot read or serve the asset tree.

## Runtime Architecture

The user navigates to sophiewell.com. The browser receives `index.html`,
`styles.css`, and `app.js`. The application boots, registers a service worker
for offline use, and renders the home view: a `#hero-search` combobox, a line
of example questions, and no other affordance. There is no category nav and no
tile grid — spec-v51/v53 replaced the tile-grid + audience-filter-chip home, and
spec-v751–v756 reduced what replaced it to the single box. Focusing the empty
input lists the whole catalogue A–Z, which is the "browse everything" path the
retired picker used to provide. The combobox routes a typed query
through a deterministic name/id ranker plus the `lib/prompt.js` synonym/phrasing
resolver; an `#a=<audience>` deep-link still biases that resolver toward one of
the spec-v29 §5.3 audiences (Nurse is the default), but there is no on-page
filter bar. Selecting a tile loads only the data shards relevant to that utility
(when a tile needs one).
No data is loaded eagerly. Most tiles ship no shard at all — the formula
is in `app.js` / `lib/*.js` and the citation is in `lib/meta.js`.

Calculation runs in the main thread. The two Web-Worker *tiles* from earlier
specs (Medical Bill Decoder, Hospital Price Transparency Lookup) were retired in
the spec-v10 clinical pivot and the spec-v29 wave 29-2 prune.

**One Web Worker does run**, and this section said the opposite until spec-v1058.
The prior-authorization packet linter (`pa-lint`, spec-v52) offers optional
on-device OCR, and `tesseract.js` runs its engine in a worker in the tab. Nothing
about it is eager or off-origin — see the next section — but a contributor
reasoning about threading, the CSP, or the offline story needs to know it is
there. It is the one part of the runtime that does not look like the rest, and it
was the one part this document did not mention.

The service worker caches the application shell on first load. Data shards are
cached on first access. The cache version is keyed to the build hash, so a new
deployment invalidates old caches cleanly.

## The document linter (`pa-lint`)

One tile is shaped unlike every other, and it is worth a paragraph because it is
the only place the runtime departs from "a formula and a citation".

`pa-lint` reads a prior-authorization packet the user drops in — PDF, DOCX, plain
text, or an image — and checks it against a deterministic rule set
(`lib/pa/`, fourteen modules: extraction, classification, redaction, the rule
engine, the source-staleness ledger, the report writer). Three vendored libraries
do the reading: `pdfjs` for PDFs, `mammoth` for DOCX, `tesseract.js` for OCR of
scans. All three are same-origin under `/vendored/`, disclosed with their
licenses on `/commitments/`, and checked by `check-commitments.mjs` (spec-v1051,
spec-v1052).

Three properties keep it inside the posture the rest of the site holds:

- **Lazy.** None of it loads until a file is dropped, and the ~9 MB OCR engine
  not until the user clicks *Run on-device OCR*. An idle page costs nothing.
- **Same-origin.** Worker, WASM core and language data all ship from
  `/vendored/tesseract/`; the CSP's `script-src 'self' 'wasm-unsafe-eval'`
  admits them and nothing else.
- **On-device.** The document never leaves the tab. That is what lets the tile
  accept a patient's paperwork at all — see spec-v52 §4.7 on the PHI posture.

The rule engine is the deterministic part: OCR is an *input adapter* that
produces the text a human would otherwise type, and makes no determination of
its own.

## Data Pipeline (Build Time Only)

A single Node script, `scripts/build-data.mjs`, runs in CI on a schedule. It
downloads canonical public files, verifies SHA-256 hashes against
`scripts/expected-hashes.json`, parses source formats, produces sharded JSON
in `data/`, writes per-dataset manifests with version and integrity hashes,
and commits the result via a pull request. The build script never runs in
production. The browser only sees the resulting static files.

## Shared renderers (v4)

Four small ES modules in `lib/` provide reusable UI patterns so v4 utility
tiles can be added without each renderer reimplementing the same chrome.
None of them introduce runtime dependencies; all use `el()` from
`lib/dom.js` and forbid raw HTML insertion.

- **`lib/tree.js`** -- step-wise decision-tree renderer. Pure helpers
  (`traverseTree`, `encodePath`, `decodePath`) plus
  `renderDecisionTree(rootEl, tree, opts)`. Used by tetanus, rabies,
  bloodborne-pathogen, Canadian C-spine, IDR eligibility, COBRA timeline,
  Medicare enrollment, ACA SEP, TRICARE picker, birthday-rule, VA
  eligibility. Encodes the chosen path in the URL hash under key `t`.
- **`lib/screener.js`** -- screening-instrument renderer (PHQ-9, GAD-7,
  AUDIT-C, CAGE, EPDS, Mini-Cog, CIWA-Ar, COWS, NEXUS). Pure helpers
  (`scoreScreener`, `bandFor`, `isComplete`, `serializeAnswers`,
  `parseAnswers`) plus `renderScreener(rootEl, config)`. Always renders
  the "Screening, not diagnosis" notice. Hash-encodes the answer vector
  under key `a`.
- **`lib/table.js`** -- searchable / sortable / row-copyable lookup table.
  Pure helpers (`filterRows`, `sortRows`, `formatRowAsTSV`) plus
  `renderTable(rootEl, opts)`. After the spec-v29 wave 29-2 prune the
  only surviving consumer is the small handful of tiles whose math
  reads a bundled table inline; the static code-index and reference-
  range tiles that originally drove this module are gone.
- **`lib/print.js`** -- printable-template renderer for HIPAA
  Authorization, ROI, Wallet Card, Discharge Instructions, Appeal
  Letter, and the SBAR handoff template. Pure helper
  (`validateSections`) plus `renderPrintable(rootEl, config)`. Renders
  into an `<article>` with a Print button that triggers
  `window.print()` against the `@media print` block in `styles.css`.

Each module has a unit-test suite in `test/unit/{tree,screener,table,print}.test.js`
covering pure helpers plus the render path via the minimal DOM stub at
`test/fixtures/dom-stub.js`.

## Why calculation stays client-side

None of the utilities require server computation. Every lookup is a search over
a bundled dataset; every calculator is a published formula. The report endpoint
does not participate in calculation and fails closed without affecting any
tool. Keeping those paths separate preserves offline use and constrains the new
privacy and maintenance surface to one explicit action.

## Tile groups

Every tile carries a single-letter `group`, and `GROUP_LABELS` in `app.js` is the
source of truth for what that letter is called on screen. The label is declared
five times — once in `app.js` and once in each builder that renders it onto a
pre-rendered page, plus the audit report — and `check-catalog-truth.mjs` holds
all five in step (spec-v953). It holds this table too, both the names and the
counts (spec-v994), because a taxonomy restated in prose drifts: this section
used to name five of the six groups it listed incorrectly and call three of them
retired while they were live.

| Group | Label | Tiles |
| --- | --- | --- |
| A | Billing & Coding | 3 |
| B | Billing & Reimbursement | 25 |
| C | Insurance & Patient Literacy | 11 |
| E | Clinical Math & Conversions | 188 |
| F | Medication & Infusion | 63 |
| G | Clinical Scoring & Risk | 1344 |
| H | Workflow & Documentation | 26 |
| I | EMS & Field Medicine | 21 |
| J | Immunization & Infectious Disease | 5 |
| K | Reference Ranges | 0 |
| L | Insurance Glossary | 0 |
| M | State & Coverage Reference | 0 |
| N | Pediatrics & Neonatal | 17 |
| O | High-Alert & Safety | 0 |
| P | Revenue Cycle & Utilization | 1 |

Four labels survive with no tiles behind them. K, L and O were emptied by the
spec-v29 wave 29-2 nurse-first prune — the static reference-range, code-locator
and glossary tables went, and the thresholds they carried are embedded in the
calculators that need them (`lab-interpret`, NEWS2, `abx-renal`). M went the
same way. The labels stay declared so a tile can be moved back into one of
those letters without reintroducing a name, and they are kept in step by the
same check as the live ones.

There is no group D. It was "Provider & Plan Lookup", and spec-v5 cut it with
the 38 live-data tiles that were its whole contents; the letter was not reused.
