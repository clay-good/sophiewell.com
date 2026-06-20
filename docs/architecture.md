# Architecture

## Overview

sophiewell.com is a single-page static web application. There is no backend. The
browser receives `index.html`, `styles.css`, and `app.js` from the same origin,
boots a vanilla JavaScript application, and renders the home view (a
hero-search combobox over all 530 utilities plus a static browse-by-category
nav). Each utility runs entirely client side and operates either on user-supplied
input or on bundled reference data served from the same origin.

The application is structurally identical in spirit to encryptalotta.com: one
HTML file, one CSS file, one JavaScript file (or a small set of vanilla ES
modules), a data folder, and a service worker. A Content Security Policy
forbids outbound network connections except to the same origin. The user can
save the page and use it offline forever.

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
|  |   shell + shards)   |  |         |  No application server.           |
|  +---------------------+  |         |  No database.                     |
|                           |         |  No analytics endpoint.           |
|  CSP: connect-src 'self'  |         |  No telemetry.                    |
+---------------------------+         +-----------------------------------+
```

There is no backend. There is no API. There is no analytics endpoint. There is
no telemetry. There is no AI inference. The diagram on the right is a static
file host; it serves files and nothing else.

## Runtime Architecture

The user navigates to sophiewell.com. The browser receives `index.html`,
`styles.css`, and `app.js`. The application boots, registers a service worker
for offline use, and renders the home view: a `#hero-search` combobox and a
static browse-by-category nav (the spec-v51/v53 redesign replaced the earlier
tile-grid + audience-filter-chip home). The combobox routes a typed query
through a deterministic name/id ranker plus the `lib/prompt.js` synonym/phrasing
resolver; an `#a=<audience>` deep-link still biases that resolver toward one of
the spec-v29 §5.3 audiences (Nurse is the default), but there is no on-page
filter bar. Selecting a tile loads only the data shards relevant to that utility
(when a tile needs one).
No data is loaded eagerly. Most tiles ship no shard at all — the formula
is in `app.js` / `lib/*.js` and the citation is in `lib/meta.js`.

All computation runs in the main thread. The two Web-Worker tiles from
earlier specs (Medical Bill Decoder, Hospital Price Transparency Lookup)
were retired in the spec-v10 clinical pivot and the spec-v29 wave 29-2
prune; no Web Workers remain at runtime.

The service worker caches the application shell on first load. Data shards are
cached on first access. The cache version is keyed to the build hash, so a new
deployment invalidates old caches cleanly.

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

## Why No Backend

A backend would introduce operating cost, an account system or rate limiting,
a privacy surface for user input, a maintenance burden, and a dependency the
user cannot inspect. None of the utilities require server computation. Every
lookup is a search over a bundled dataset; every calculator is a published
formula. Holding the line against a backend is the single most important
durability decision in the project.

## v4 group expansion (post-v29 surface)

spec-v4 originally added six new tile groups (J-O) alongside the existing
A-I. After the spec-v29 wave 29-2 nurse-first prune, the surviving group
shape is:

- **J Public Health & Infectious Disease**: decision trees for
  tetanus prophylaxis, rabies PEP, bloodborne-pathogen exposure, TB
  testing interpretation, and STI screening intervals. (The ACIP /
  Yellow Book traveller schedules were never v29-relevant and remain
  on the v30 deferred list.)
- **K Lab Reference** — *retired in spec-v29 wave 29-2 §2.4.* The
  static adult / pediatric reference-range tables, TDM table, and
  tox-level table were removed. Calculators that consume these
  thresholds inside their math (e.g. `lab-interpret`, NEWS2,
  `abx-renal`) remain and embed the thresholds inline.
- **L Forms & Numbers Literacy** — *retired in spec-v29 wave 29-2
  §2.2.* The CMS-1500 and UB-04 field-locator decoders and the EOB
  jargon glossary were removed. The workflow generators that
  *assemble* a tailored document (appeal letter, HIPAA Right of
  Access, HIPAA authorization, ROI, discharge instructions,
  specialty-visit questions, wallet card, SBAR handoff) stay.
- **N Literacy Helpers**: universal unit converter, time-to-dose
  helper, pediatric weight converter — the calculator-shaped tiles
  in this group stay.
- **O Patient Safety** — *retired in spec-v29 wave 29-2 §2.4.* The
  ISMP high-alert wallet card was removed; the safety thresholds it
  carried are now embedded in the calculators that need them.

Each surviving tile reuses the four shared renderers added in v4.0
(`lib/tree.js`, `lib/screener.js`, `lib/table.js`, `lib/print.js`)
plus the bundled offline-seed datasets. No new architecture, no new
runtime dependencies, and no change to the CSP / storage / no-AI
postures established in v1-v3.
