# Architecture

## Overview

sophiewell.com is a single-page static web application. There is no backend. The
browser receives `index.html`, `styles.css`, and `app.js` from the same origin,
boots a vanilla JavaScript application, and renders a tile grid of utilities.
Each utility runs entirely client side and operates either on user-supplied
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
|  +---------------------+  |         |    icd10cm/   shards + manifest   |
|           |               |         |    hcpcs/                         |
|           v               |         |    cpt-summaries/                 |
|  +---------------------+  |         |    mpfs/      shards + GPCI + CF  |
|  | Service worker      |  |         |    nadac/                         |
|  |  (sw.js)            |  |         |    ndc/       shards              |
|  |  - precaches shell  |  |         |    npi/       shards              |
|  |  - caches shards    |  |         |    crosswalks/ pos, mod, rev,     |
|  |    on first use     |  |         |                carc, rarc         |
|  +---------------------+  |         |    ncci/    mue/    coverage/     |
|           |               |         |    enforcement/  hospital-prices/ |
|           v               |         |    no-surprises/  state-rights/   |
|  +---------------------+  |         |    clinical/                      |
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
for offline use, and renders the home view with a tile grid. A filter bar at
the top of the grid lets the user filter by audience tag (Patients, Billers
and Coders, Nurses and Clinicians, Educators) and by group (A through H).
Selecting a tile loads only the data shards relevant to that utility. No data
is loaded eagerly. The largest shard is kept under one megabyte after gzip.

Most computation runs in the main thread. Two utilities, the Medical Bill
Decoder and the Hospital Price Transparency Lookup, run inside a Web Worker so
the UI remains responsive on large inputs.

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
- **`lib/table.js`** -- searchable / sortable / row-copyable lookup table
  for small bundled datasets (POS, TOB, revenue codes, condition codes,
  DRG, APC, lab ranges, etc.). Pure helpers (`filterRows`, `sortRows`,
  `formatRowAsTSV`) plus `renderTable(rootEl, opts)`. Wires the
  data-source stamp from each dataset's `manifest.json` when
  `manifestId` is supplied.
- **`lib/print.js`** -- printable-template renderer for HIPAA
  Authorization, ROI, Wallet Card, Discharge Instructions, Appeal
  Letter, ABN Explainer, Insurance Card Decoder, MSN Decoder. Pure
  helper (`validateSections`) plus `renderPrintable(rootEl, config)`.
  Renders into an `<article>` with a Print button that triggers
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

## v4 group expansion (J-O)

spec-v4 adds six new tile groups alongside the existing A-I:

- **J Public Health & Travel** (utilities 172-180): ACIP routine adult /
  child / catch-up schedules, CDC Yellow Book by country, and decision
  trees for tetanus prophylaxis, rabies PEP, bloodborne-pathogen
  exposure, TB testing interpretation, and STI screening intervals.
- **K Lab Reference** (181-184): adult / pediatric reference ranges,
  therapeutic drug levels, toxicology levels.
- **L Forms & Numbers Literacy** (185-187): CMS-1500 and UB-04 field-by-
  field decoders plus an EOB jargon glossary.
- **M Eligibility & Benefits** (188-191): Medicaid by state, VA priority
  groups, TRICARE plan picker (decision tree), IHS eligibility.
- **N Literacy Helpers** (192-194): universal unit converter,
  time-to-dose helper, pediatric weight converter.
- **O Patient Safety** (195-197): high-alert wallet card (ISMP),
  FDA drug recalls weekly snapshot, vaccine lot recall lookup.

Each new tile reuses the four shared renderers added in v4.0
(`lib/tree.js`, `lib/screener.js`, `lib/table.js`, `lib/print.js`) plus
the bundled offline-seed datasets added in v4.1. No new architecture, no
new runtime dependencies, and no change to the CSP / storage / no-AI
postures established in v1-v3.
