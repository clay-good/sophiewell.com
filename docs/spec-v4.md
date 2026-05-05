# spec-v4.md — sophiewell.com utility expansion

This spec layers on top of spec.md (v1 architecture and chrome), spec-v2.md
(operability, citations, copy/share, leader keys), and spec-v3.md (Field
Medicine / Group I). It assumes all three are complete and shipped.

The goal of v4 is a deep expansion of utility coverage so the site becomes
a comprehensive public utility for patients, billers and coders, clinicians,
educators, and field-medicine workers — with no new architecture, no new
runtime dependencies, and no change to the legal, security, accessibility,
or stability postures defined in v1-v3.

## 1. Scope

Add the utilities listed in section 5. Add the new datasets listed in
section 4. Open six new tile groups (J Public Health & Travel, K Lab
Reference, L Forms & Numbers Literacy, M Eligibility & Benefits, N Literacy
Helpers, O Patient Safety) alongside Groups A-I. Every new tile follows
the existing rules:

- One static page, no backend, browser-only computation.
- CSP `connect-src 'self'` unchanged. No outbound runtime fetches.
- Zero runtime dependencies. No new npm runtime packages.
- Every calculator live-renders, has a Copy and Copy-all button, has a
  Test-with-example button, has a citation block, and shows the inline
  clinical or legal notice where applicable.
- Every lookup tile shows a data-source stamp pulled from the dataset's
  `manifest.json`.
- Every dataset has a `manifest.json` with source URL, agency, status
  (`public-domain`, `numeric-facts-with-attribution`, `mit-original`,
  `government-work`, `licensed-link-only`), cadence, fetch date, record
  count, and per-shard SHA-256.
- Every dataset is built by `scripts/build-data.mjs` and refreshed by
  the existing weekly `data-refresh.yml` workflow.
- No PHI storage. No localStorage, sessionStorage, cookies, IndexedDB.
  All inputs are processed in memory and discarded on close.
- No medical, legal, or financial advice. The standard inline notices
  govern.

The total utility count after v4 lands is **161** (existing 79 + 82 new).
The 79-tile constant in `index.html`, `app.js` `UTILITIES`,
`scripts/build-ld.mjs`, `scripts/build-sitemap.mjs`, and the README must
be updated wherever it appears.

## 2. Audiences

Unchanged from v3: patients, billers/coders, clinicians, educators,
field-medicine. Several new tiles primarily serve patients (insurance
card decoder, ABN explainer, COBRA timeline, FPL calculator, Medicaid
state quick-card). Several primarily serve billers/coders (DRG, APC,
NCCI extensions, POS, TOB, revenue codes). The audience-filter buttons
already established in v3 are reused; v4 adds **no new audience tag**.

## 3. Data sources and legal posture

All datasets are public-domain US-government works or are used under
the same numeric-facts-with-attribution posture established by v3 for
AHA. The site bundles **no** licensed content (no AMA CPT descriptors,
no SNOMED, no Broselow, no proprietary scales like MoCA full instrument).

### Permitted bundling
- CMS public files (HCPCS, MPFS, OPPS, IPPS, ASC, CLFS, DMEPOS, ASP,
  Wage Index, GPCI, NCCI PTP, MUE, POS list, opt-out, OIG-LEIE).
- NUBC public summaries for TOB / Revenue / Condition / Occurrence /
  Value codes (numeric / structural facts only — no NUBC manual prose).
- IRS published rates (medical mileage, HSA/FSA limits).
- HHS Poverty Guidelines (FPL).
- HRSA Health Center directory.
- NLM RxNorm full release.
- NLM DailyMed Structured Product Labels (SPLs) for FDA labeling.
- FDA Drug Recalls API snapshots, FDA Recalls (devices, food).
- CDC ACIP immunization schedules (adult, child, catch-up).
- CDC Yellow Book by-country tables.
- CDC STI Treatment Guidelines (numeric / interval facts only).
- CDC Field Triage (already in v3).
- CDC opioid prescribing guidance MME conversion factors.
- NIOSH Pocket Guide (CDC public).
- PHMSA Emergency Response Guidebook (DOT public).
- NUCC Health Care Provider Taxonomy (public CSV).
- NIH MedlinePlus reference ranges (HHS public).
- NPPES NPI registry (already in v1).
- NLM WISER (HHS public, retired but still public-domain).
- KFF Medicaid by-state policy data (curated; KFF is not US-gov but
  publishes most state Medicaid policy summaries under permissive use;
  for v4 we *link out* rather than bundle KFF prose, and bundle only
  the numeric thresholds drawn from state Medicaid agency files).

### Forbidden bundling (linked instead)
- AMA CPT descriptors. CPT structural data only; descriptor lookup is
  a link to the AMA's free public CPT lookup.
- SNOMED CT in full. If we ever add a SNOMED tile, restrict to the US
  Core problem-list subset that's freely redistributable.
- AHA flowcharts (numeric ACLS/PALS/BLS values are permitted under the
  v3 posture; flowchart imagery and prose are not).
- LOINC at scale before reviewing the LOINC license terms in v4.5; for
  now, **no LOINC tile** (deferred).
- Broselow color bands. Pediatric weight-to-dose stays in raw kg.
- MoCA full instrument. Mini-Cog only (its scoring rules are public).
- Proprietary screening instruments not released under public terms.

### Posture per new dataset
Tracked in each dataset's `manifest.json`:

```json
{
  "id": "drg",
  "label": "MS-DRG (FY2026)",
  "agency": "CMS",
  "sourceUrl": "https://www.cms.gov/.../ipps-final-rule",
  "status": "government-work",
  "cadence": "annual",
  "fetchDate": "2026-..",
  "recordCount": 760,
  "shards": {"drg.json": "<sha256>"}
}
```

## 4. New datasets

These are added to `data/` and built by `scripts/build-data.mjs`. Each
must be implemented with an offline-seed mode (`SOPHIEWELL_OFFLINE=1`)
that produces a deterministic, hand-curated subset for tests, mirroring
the v3 pattern.

| Dataset id | Source | Cadence | Used by utilities |
|------------|--------|---------|--------------------|
| `hcpcs-modifiers` | CMS HCPCS modifier file | annual | 82 |
| `pos-codes` | CMS Place of Service file | as-needed | 85 |
| `tob-codes` | NUBC summary (numeric only) | as-needed | 86 |
| `revenue-codes` | NUBC summary (numeric only) | as-needed | 87 |
| `nubc-special-codes` | NUBC summary (numeric only) | as-needed | 88 |
| `drg` | CMS IPPS Final Rule Table 5 | annual | 89 |
| `apc` | CMS OPPS Addendum A/B | quarterly | 90 |
| `icd10-pcs` | CMS ICD-10-PCS | annual | 91 |
| `rxnorm` | NLM RxNorm monthly release | monthly | 92, 93 |
| `dmepos` | CMS DMEPOS quarterly file | quarterly | 94 |
| `clfs` | CMS CLFS quarterly file | quarterly | 95 |
| `asp` | CMS ASP file | quarterly | 96 |
| `asc` | CMS ASC Addendum AA/BB | quarterly | 97 |
| `wage-index` | CMS IPPS/OPPS Final Rule | annual | 98 |
| `gpci` | CMS GPCI table | annual | 99 |
| `cms-deductibles` | CMS annual notice | annual | 100 |
| `irmaa` | CMS annual notice | annual | 100 |
| `aca-thresholds` | CMS HHS Notice of Benefit | annual | 101 |
| `hsa-fsa-limits` | IRS Rev Proc | annual | 102 |
| `fpl` | HHS Poverty Guidelines | annual | 103 |
| `irs-mileage` | IRS notice | annual | 104 |
| `dea-rules` | DEA registration checksum rule | static | 113 |
| `nucc-taxonomy` | NUCC CSV | semi-annual | 114 |
| `acip-routine-adult` | CDC ACIP | annual | 130 |
| `acip-routine-child` | CDC ACIP | annual | 130 |
| `acip-catchup` | CDC ACIP | annual | 131 |
| `yellow-book` | CDC Yellow Book by country | annual | 132 |
| `tetanus` | CDC tetanus prophylaxis decision aid | annual | 133 |
| `rabies-pep` | CDC rabies PEP decision aid | annual | 134 |
| `bbp-exposure` | CDC HIV/HBV/HCV PEP | annual | 135 |
| `tb-tst-igra` | CDC TB testing interpretation | annual | 136 |
| `sti-screening` | CDC STI Screening Guidelines | annual | 137 |
| `lab-ranges-adult` | NIH MedlinePlus | annual | 138 |
| `lab-ranges-peds` | NIH MedlinePlus | annual | 139 |
| `therapeutic-drug-levels` | FDA labels via DailyMed | quarterly | 140 |
| `tox-levels` | NLM WISER | annual | 141 |
| `cms-1500-fields` | CMS form instructions | annual | 142 |
| `ub04-fields` | NUBC summary | annual | 143 |
| `eob-glossary` | original (project author) | static | 144 |
| `medicaid-state` | state Medicaid agency files | semi-annual | 145 |
| `va-eligibility` | VA public categories | annual | 146 |
| `tricare-plans` | TRICARE plan rules | annual | 147 |
| `ihs-eligibility` | IHS public categories | annual | 148 |
| `dot-erg` | PHMSA Emergency Response Guidebook | per-edition | 152 |
| `niosh-pg` | NIOSH Pocket Guide | per-edition | 153 |
| `tccc` | TCCC public guidelines | annual | 156 |
| `cpr-aha-numeric` | AHA numeric values only (v3 posture) | per-edition | 157 |
| `mme-factors` | CDC 2022 MME conversion factors | per-revision | 121 |
| `steroid-equiv` | original (numeric, attributed to standard pharmacology refs) | static | 122 |
| `benzo-equiv` | Ashton table (public) | static | 123 |
| `abx-renal` | FDA labels via DailyMed (subset) | quarterly | 124 |
| `vasopressor-doses` | FDA labels (subset) | annual | 125 |
| `tpn-rules` | standard nutrition reference | annual | 126 |
| `iv-to-po` | original (project author table) | annual | 127 |
| `pediatric-vitals` | PALS public values | per-edition | 60 (already in v3, extend) |
| `qtc-formulas` | (no dataset; pure formula) | — | 119 |
| `drug-recalls` | FDA recalls API snapshot | weekly | 161 |
| `vaccine-lot-recalls` | FDA/CDC lot lists | as-issued | 162 |

Total: 50 new datasets. Combined with the 22 existing v3 datasets, the
final manifest count is 72.

## 5. Utilities (groups A-O)

Numbering picks up at **82** (the v3 stopped at 81). Group letters J-O
are new groups defined in section 6. Group memberships:

### Group A — Code lookups (extensions)
- 82 HCPCS Modifier Lookup
- 83 NCCI PTP Edit Checker (uses existing NCCI dataset; this is a new
  *paired* lookup tile, not a list view)
- 84 MUE Lookup (uses existing MUE dataset; same — new tile)
- 85 Place of Service Code Lookup
- 86 Type of Bill Decoder
- 87 Revenue Code Lookup
- 88 Condition / Occurrence / Value Code Reference
- 89 MS-DRG Lookup
- 90 APC / HOPPS Lookup
- 91 ICD-10-PCS Lookup
- 92 RxNorm Lookup
- 93 NDC ↔ RxNorm Crosswalk

### Group B — Pricing (extensions)
- 94 DMEPOS Fee Schedule
- 95 CLFS Lookup
- 96 ASP Drug Pricing
- 97 ASC Payment Rates
- 98 Wage Index Lookup
- 99 GPCI Lookup
- 100 Medicare Deductibles & IRMAA Brackets
- 101 ACA Marketplace Thresholds
- 102 HSA / FSA / HDHP Limits
- 103 FPL Calculator
- 104 IRS Medical Mileage Rate

### Group C — Patient tools (extensions)
- 105 Insurance Card Decoder
- 106 ABN (Advance Beneficiary Notice) Explainer
- 107 MSN (Medicare Summary Notice) Decoder
- 108 IDR Eligibility Checker (extends NSA)
- 109 Appeal Letter Generator
- 110 HIPAA Right of Access Request Generator
- 111 Birthday Rule Resolver
- 112 COBRA Timeline
- 113 Medicare Enrollment Period Checker
- 114 ACA SEP Eligibility Checker

### Group D — Provider lookup (extensions)
- 115 DEA Registration Number Validator (Luhn-style)
- 116 NUCC Provider Taxonomy Lookup

### Group E — Clinical math (extensions)
- 117 Anion Gap & Delta-Delta
- 118 Corrected Calcium / Corrected Sodium
- 119 Osmolal Gap
- 120 A-a Gradient & P/F Ratio
- 121 Winter's Formula
- 122 MAP / Pulse Pressure / Shock Index
- 123 Body Weight & BSA Suite (IBW Devine, AdjBW, BSA Mosteller, BSA DuBois)
- 124 eGFR Suite (Cockcroft-Gault, MDRD, CKD-EPI 2021)
- 125 FENa / FEUrea
- 126 Maintenance Fluids (4-2-1)
- 127 QTc Suite (Bazett, Fridericia, Framingham, Hodges)
- 128 Pregnancy Dating (LMP, CRL, Naegele EDD)

### Group F — Medication / infusion (extensions)
- 129 Opioid MME Calculator (CDC 2022)
- 130 Steroid Equivalence Converter
- 131 Benzodiazepine Equivalence Converter
- 132 Antibiotic Renal Dose Adjustment
- 133 Vasopressor Dose ↔ Rate Calculator
- 134 TPN Macronutrient Calculator
- 135 IV-to-PO Conversion Reference

### Group G — Scoring (extensions)
- 136 TIMI Risk Score (UA/NSTEMI)
- 137 GRACE Score
- 138 HEART Score
- 139 PERC Rule
- 140 Wells PE / Geneva (Revised)
- 141 CURB-65
- 142 PSI / PORT
- 143 qSOFA / SOFA
- 144 MELD-3.0 / Child-Pugh
- 145 Ranson / BISAP
- 146 Centor / McIsaac
- 147 Wells DVT / Caprini VTE
- 148 Bishop Score
- 149 Alvarado / Pediatric Appendicitis Score
- 150 Modified Rankin Scale (mRS) Reference
- 151 PHQ-9
- 152 GAD-7
- 153 AUDIT-C
- 154 CAGE
- 155 EPDS
- 156 Mini-Cog
- 157 CIWA-Ar
- 158 COWS
- 159 ASCVD 10-year (Pooled Cohort Equations)
- 160 PREVENT 2023 (AHA/ACC successor)

### Group H — Workflow (extensions)
- 161 HIPAA Authorization Form Generator
- 162 Release of Information Request Generator
- 163 Discharge Instruction Template Generator
- 164 Specialty-Visit Question Generator
- 165 Medication Wallet Card Generator

### Group I — Field medicine (extensions)
- 166 NEXUS + Canadian C-Spine Decision Aid
- 167 DOT Emergency Response Guidebook Lookup
- 168 NIOSH Pocket Guide Lookup
- 169 CPR Numeric Reference (compressions, breaths, depth, rate; AHA-attributed)
- 170 TCCC Tourniquet & Wound-Packing Reference
- 171 CO / Cyanide / Smoke-Inhalation Antidote Reference

### Group J (NEW) — Public health & travel
- 172 Routine Adult Immunization Schedule (ACIP)
- 173 Routine Child Immunization Schedule (ACIP)
- 174 Catch-Up Immunization Schedule
- 175 Yellow Book Country Lookup
- 176 Tetanus Prophylaxis Decision Tree
- 177 Rabies Post-Exposure Prophylaxis Decision Tree
- 178 Bloodborne Pathogen Exposure Decision Tree (HIV / HBV / HCV)
- 179 TB Testing Interpretation (TST mm + IGRA)
- 180 STI Screening Interval Reference

### Group K (NEW) — Lab reference
- 181 Adult Lab Reference Ranges
- 182 Pediatric Lab Reference Ranges by Age Band
- 183 Therapeutic Drug Level Reference
- 184 Toxicology Level Reference

### Group L (NEW) — Forms & numbers literacy
- 185 CMS-1500 Field-by-Field Decoder
- 186 UB-04 Field-by-Field Decoder
- 187 EOB Jargon Glossary

### Group M (NEW) — Eligibility & benefits
- 188 Medicaid by State Quick-Card
- 189 VA Eligibility 1-2-3
- 190 TRICARE Plan Picker
- 191 IHS Eligibility Quick-Reference

### Group N (NEW) — Literacy helpers
- 192 Universal Unit Converter (lab values: glucose, cholesterol, creatinine,
  BUN, calcium, uric acid; vitals: mmHg ↔ kPa; basics: temp, mass, length)
- 193 Time-to-Dose Helper ("I took it at 14:00, every-8h means…")
- 194 Pediatric Weight Converter (lb/oz ↔ kg)

### Group O (NEW) — Patient safety
- 195 High-Alert Medication Wallet Card (ISMP-attributed)
- 196 Drug Recall Lookup (weekly FDA snapshot)
- 197 Vaccine Lot Recall Lookup

That is **116 new tiles**. Adjusted from the section 1 count: the master
total after v4 lands is **79 + 116 = 195 tiles**. Update every place
the count appears (README, JSON-LD, sitemap, footer, spec section 1).

## 6. Architecture additions

No new architecture is required for any tile. Six things are added to
the existing chrome:

1. **Six new group sections** (J-O) with the same `.home-section`
   markup and the same audience-tag set.
2. **Two new audience tags?** — no. The five existing audiences cover
   every new tile. (Patients, Billers/Coders, Clinicians, Educators,
   Field-Medicine.)
3. A new shared **decision-tree renderer** (`lib/tree.js`) for the
   step-wise tools (tetanus, rabies, BBP, c-spine, IDR eligibility,
   COBRA timeline, Medicare enrollment, ACA SEP, TRICARE picker). It
   takes a tree node spec (`{question, options: [{label, next|result}]}`)
   and renders sequential question cards with Back / Restart, with the
   chosen path encoded in the URL hash.
4. A new shared **screener renderer** (`lib/screener.js`) for the
   PHQ-9 / GAD-7 / AUDIT-C / CAGE / EPDS / Mini-Cog / CIWA-Ar / COWS
   pattern. Configurable with `{items, scale, scoring, severityBands,
   citation}`. Always shows the standard "screening, not diagnosis"
   notice; never says what to do clinically.
5. A new shared **table-lookup renderer** (`lib/table.js`) for the
   small-table tiles (POS, TOB, revenue codes, condition codes, etc.)
   with built-in column sort, search, copy-row.
6. A new shared **printable-template renderer** (`lib/print.js`) for
   tiles that produce print-ready output (HIPAA Authorization, ROI,
   Wallet Card, Discharge Instructions, Appeal Letter). Adds an
   on-screen Print button that triggers `window.print()` against an
   already-styled `@media print` stylesheet block.

All four new shared modules follow the existing rules: no `innerHTML`,
use `el()`, no third-party deps. They are each unit-tested.

## 7. Step-by-step build instructions for spec-v4

These steps are layered on top of v1 + v2 + v3. Add them in the order
listed unless a dependency arrow says otherwise. Each step is written
as a Claude Code prompt — paste each step into a fresh Claude session
and follow it to completion before moving on.

The prompts assume the reader has already run `npm install`, has the
repo at `main`, has the v3 tests green, and has `SOPHIEWELL_OFFLINE=1`
set for any data work that doesn't need the live network.

---

### Step v4.0: Foundations — shared renderers

> Before any new tiles are added, build the four shared renderers
> described in section 6 of `docs/spec-v4.md`. Create
> `lib/tree.js`, `lib/screener.js`, `lib/table.js`, and `lib/print.js`,
> each ESM, no third-party imports, no `innerHTML` anywhere; use the
> existing `el()` helper from `lib/dom.js`.
>
> `lib/tree.js` exports `renderDecisionTree(rootEl, tree, opts)` where
> `tree` is `{question, helpText?, options: [{label, next?, result?, rationale?}]}`.
> Render the current question as an `<h2>`, optional help text as a `<p>`
> with class `tree-help`, and the options as full-width buttons. On
> click, advance to `next` or, when `result` is set, show a result card
> with the `result` text, the path the user took (rendered as an `<ol>`
> of question/answer pairs), the `rationale` line, a Restart button, a
> Back button, and a Copy button using `lib/clipboard.js`. Encode the
> chosen path in the URL hash via `lib/hash.js` so the result is
> bookmarkable. Add `aria-live="polite"` to the result region.
>
> `lib/screener.js` exports `renderScreener(rootEl, config)` where
> `config` is `{id, items: [{prompt, options: [{label, value}]}],
> severityBands: [{min, max, label, advisory?}], citation, exampleAnswers?}`.
> Render every item as a fieldset with radio inputs (one per option).
> Live-render: as soon as every required item has an answer, compute
> the total via summation and render the severity band that contains
> it. Always render the "Screening, not diagnosis" inline notice — wire
> it into the existing `renderMetaBlock` notice slot. Hash-encode the
> answer vector. Provide a Test-with-example button that fills
> `exampleAnswers`.
>
> `lib/table.js` exports `renderTable(rootEl, {columns, rows, searchable,
> sortable, copyableRows, manifestId})`. The component renders an
> input search box (filters rows substring-match across all columns), a
> `<table>` with `scope="col"` headers that toggle `aria-sort` on
> click, and a per-row Copy button that copies the row as
> tab-delimited text. Wire the data-source stamp via the existing
> `renderMetaBlock` using `manifestId`.
>
> `lib/print.js` exports `renderPrintable(rootEl, {title, sections,
> warnings})`. Render the document at on-screen size using semantic
> HTML (`<header>`, `<section>`, `<footer>`). Add a Print button that
> calls `window.print()`. Add a `@media print` block to `styles.css`
> that hides the topbar, footer, breadcrumb, and any non-printable
> chrome; sets margins to 0.5in; uses 11pt body / 14pt h1; forces
> background colors via `print-color-adjust: exact`.
>
> Add unit tests in `test/unit/tree.test.js`, `test/unit/screener.test.js`,
> `test/unit/table.test.js`, `test/unit/print.test.js` (use jsdom or
> the existing renderer-test pattern from v2). Each module gets at
> least 6 tests covering happy path, edge cases (empty answer, single
> option, all-zero score, search clearing, sort stability), and
> hash round-trip.
>
> Update `docs/architecture.md` with a section "Shared renderers (v4)"
> listing the four modules and their responsibilities.
>
> Run `npm test`. Commit on a feature branch
> `feature/v4.0-shared-renderers`.

---

### Step v4.1: New dataset scaffolding

> Add the 50 new dataset entries listed in section 4 of
> `docs/spec-v4.md` to `scripts/build-data.mjs`. For each entry:
>
> 1. Append it to the `DATASETS` registry at the top of the script.
> 2. Implement an offline-seed builder (gated by `SOPHIEWELL_OFFLINE=1`)
>    that emits a small, hand-curated, deterministic shard plus a
>    valid `manifest.json` with `status`, `agency`, `sourceUrl`,
>    `cadence`, `fetchDate`, `recordCount`, `shards`.
> 3. Implement the live-fetch builder *only* for datasets with a
>    documented stable URL (CMS quarterly files, IRS Rev Proc, FDA
>    Recalls API, NLM RxNorm release). For everything else, ship
>    offline-seed only and document the fetch path in `scripts/sources.md`.
> 4. Add a row to `scripts/sources.md` with the source URL, agency,
>    status, and cadence.
>
> Update `scripts/verify-integrity.mjs` to walk all 72 manifests
> (existing 22 + new 50). Confirm every shard hash matches.
>
> Run `SOPHIEWELL_OFFLINE=1 node scripts/build-data.mjs` and
> `node scripts/verify-integrity.mjs`. Both must exit clean. Commit on
> `feature/v4.1-datasets`.
>
> Hard rules: no licensed content. Verify by spot-grep against AMA
> short descriptors (`test/unit/cpt-no-ama.test.js` style) for any
> dataset that touches CPT-adjacent codes. Verify no AHA flowchart
> n-grams in `cpr-aha-numeric` (extend
> `test/unit/aha-no-flowchart.test.js`).

---

### Step v4.2: Group A code-lookup extensions (utilities 82-93)

> Implement Group A extensions per section 5 of `docs/spec-v4.md`.
> Each tile gets a renderer in `views/group-a.js` (extend the existing
> file). Use `lib/table.js` for tiles that present a small bundled
> table; use `lib/code-search.js` (existing) for tiles that search a
> large dataset.
>
> 82 HCPCS Modifier Lookup: bundled small table (~100 rows). Columns:
> Modifier, Long Description (numeric/structural — no AMA prose),
> Common Use, Pairing Caution. Source: CMS HCPCS modifier file. Add
> the inline data source stamp.
>
> 83 NCCI PTP Edit Checker: paste two HCPCS codes, return whether
> they appear together in the bundled NCCI PTP table, the modifier
> indicator (0/1/9), and a plain-English category. Use the existing
> `data/ncci/` shards. Live-render. Copy-all.
>
> 84 MUE Lookup: type/paste a code, return the MUE unit cap and the
> adjudication indicator. Use the existing `data/mue/` shards.
>
> 85 POS Lookup: bundled ~70-row table. Columns: Code, Name, Setting,
> Facility-vs-Non-facility flag.
>
> 86 TOB Decoder: 4-digit input, decompose into Type of Facility /
> Bill Classification / Frequency per the bundled NUBC summary table.
>
> 87 Revenue Code Lookup: bundled ~250-row table. Columns: Revenue
> Code, Category, Typical Pairing.
>
> 88 Condition / Occurrence / Value Code Reference: three sub-tables
> in one tile via tabs (or three separate `lib/table.js` instances on
> one view).
>
> 89 MS-DRG Lookup: bundled ~760-row table. Columns: DRG, Title, MDC,
> Relative Weight, GMLOS, AMLOS.
>
> 90 APC Lookup: bundled OPPS Addendum subset. Columns: APC, Group
> Title, Status Indicator, Relative Weight, Payment Rate.
>
> 91 ICD-10-PCS Lookup: large dataset; reuse the sharded code-search
> pattern from ICD-10-CM. Section / Body System / Operation breakdown
> in the result card.
>
> 92 RxNorm Lookup: paste an RxCUI or a drug name; return ingredient,
> strength, dose form, brand vs generic, related codes. Web Worker
> for the search to keep the main thread responsive.
>
> 93 NDC ↔ RxNorm Crosswalk: paste an NDC; return the RxCUI(s) and
> the same metadata as 92.
>
> Add Playwright smoke for one tile (89 MS-DRG Lookup) and unit
> tests for any computation logic. Update `app.js UTILITIES` and
> `index.html` Group A `.home-section` block to include the new
> tiles. Update `scripts/build-ld.mjs` and `scripts/build-sitemap.mjs`
> tile counts. Commit on `feature/v4.2-group-a`.

---

### Step v4.3: Group B pricing extensions (utilities 94-104)

> Implement Group B extensions per section 5. Each fee-schedule tile
> mirrors the existing MPFS calculator pattern (numeric input + state
> + locality → fee). Each "table" tile uses `lib/table.js`.
>
> 94 DMEPOS: HCPCS + state → CB vs non-CB rate.
> 95 CLFS: HCPCS lab code → national limitation amount.
> 96 ASP: HCPCS J-code → ASP per unit (current quarter).
> 97 ASC: HCPCS → ASC payment indicator → rate.
> 98 Wage Index: CBSA → wage index, geographic adjustment factor.
> 99 GPCI: locality → work / PE / MP GPCI.
> 100 Medicare Deductibles & IRMAA: current-year reference table for
>     Part A deductible, Part B deductible, Part B premium baseline,
>     IRMAA brackets by filing status.
> 101 ACA Marketplace: current-year OOP max, AV ranges by metal tier,
>     coverage-gap thresholds.
> 102 HSA / FSA / HDHP: current-year IRS contribution and deductible
>     limits, family vs self-only.
> 103 FPL Calculator: household size → 100% / 138% / 200% / 250% /
>     400% / 600% FPL thresholds. Live-render.
> 104 IRS Medical Mileage: current-year and prior-year rates with the
>     itemized-deduction context. Pure reference card.
>
> Every pricing tile shows the CY year prominently and the citation
> to the specific CMS / IRS / HHS notice. Add Test-with-example for
> 94, 96, 100, 102, 103.
>
> Add at least one unit test per calculator covering a known published
> example (e.g., FPL: 1-person 100% in CY2026 = $X — verify against
> the published table).
>
> Commit on `feature/v4.3-group-b`.

---

### Step v4.4: Group C patient-tools extensions (utilities 105-114)

> Implement Group C extensions per section 5. Several of these are
> decision trees built on `lib/tree.js`.
>
> 105 Insurance Card Decoder: free-form paste OR labeled inputs
> (Member ID, Group, BIN/PCN/Rx Group, copay tiers, plan name).
> Output: plain-English explanation of each label, including what
> each typically means and what billing code-set it ties to. No
> lookup against any external system. The output is a printable
> reference card via `lib/print.js`.
>
> 106 ABN Explainer: a tile that walks through CMS-R-131 box-by-box
> with plain-English text in the project author's own words. Static
> reference. Print button.
>
> 107 MSN Decoder: like the EOB Decoder but for traditional Medicare
> MSNs. Paste-once flow with a Decode button (mirrors the EOB pattern
> per spec-v2 design choice).
>
> 108 IDR Eligibility (extends existing NSA tile): step-wise decision
> tree on `lib/tree.js`. Inputs: provider type, service location, plan
> type, was-the-bill-an-emergency, did-the-patient-consent. Outputs:
> IDR-eligible vs not, with the regulatory citation (CAA NSA / 45 CFR
> 149).
>
> 109 Appeal Letter Generator: deterministic Mad-Libs over case facts
> (denial code from a fixed bank, date of service, requested service,
> diagnosis, plan name, patient name). Produces a print-ready letter
> via `lib/print.js`. **Strong notice: not legal advice; for
> educational use; users must adapt to their plan's appeal procedure.**
>
> 110 HIPAA Right of Access Request Generator: produces a written
> 45 CFR 164.524 request with the 30-day / 60-day extension language
> and the fee-cap reminder. Print-ready.
>
> 111 Birthday Rule Resolver: two-parent dependent decision tree —
> who's primary by month/day of birth, custody-modified rules, court
> order overrides. Use `lib/tree.js`.
>
> 112 COBRA Timeline: decision tree on qualifying event → 60-day
> election window → 45-day first-payment window → 18 / 29 / 36-month
> max. Output is a personalized timeline rendered as an ordered list
> with absolute dates computed from the user's qualifying event date.
> Live-render.
>
> 113 Medicare Enrollment Period Checker: DOB + first-eligibility
> scenario (turning 65, ESRD, disability) → Initial Enrollment Period
> dates, General Enrollment Period dates, Special Enrollment Periods
> available, Part D Late Enrollment Penalty framing.
>
> 114 ACA SEP Eligibility Checker: qualifying-life-event picklist →
> SEP window length and required documentation list.
>
> Add unit tests for 111 (birthday-rule date math), 112 (COBRA date
> math), 113 (Medicare enrollment date math), 114 (SEP window math).
> Each should cover at least 5 known scenarios.
>
> Commit on `feature/v4.4-group-c`.

---

### Step v4.5: Group D provider-lookup extensions (utilities 115-116)

> Implement Group D extensions.
>
> 115 DEA Registration Number Validator: input a 9-character DEA
> number, validate the first letter (A/B/F/M/G/P/X) and the checksum
> (sum of 1st+3rd+5th digits, plus 2× sum of 2nd+4th+6th digits;
> last digit of that total must equal the 9th character). Output:
> valid vs not, with the digit-by-digit checksum trace shown so the
> user can see why. **Validator only — explicitly does not look up
> the registrant.** Add the inline notice that DEA validation does
> not equal license verification.
>
> 116 NUCC Provider Taxonomy Lookup: 10-character taxonomy code →
> Type / Classification / Specialization. Bundled NUCC CSV.
>
> Unit tests for the DEA Luhn formula covering at least 8 known-valid
> and 4 known-invalid cases. Tests for the taxonomy lookup are
> coverage-by-spot-check (5 known codes).
>
> Commit on `feature/v4.5-group-d`.

---

### Step v4.6: Group E clinical-math extensions (utilities 117-128)

> Implement Group E extensions per section 5. All are pure formulas;
> no datasets needed except where stamped.
>
> 117 Anion Gap & Delta-Delta: inputs Na, Cl, HCO3 (and optionally
> albumin for albumin correction). Outputs AG, AG-corrected,
> delta-AG, delta-HCO3, delta-delta ratio. Live-render. Citation to
> standard chemistry references.
>
> 118 Corrected Calcium / Corrected Sodium: corrected Ca for albumin
> ([Ca]+0.8×(4.0-albumin)); corrected Na for hyperglycemia (Katz
> 1.6 mEq/L per 100 mg/dL above 100). Live-render. Citations.
>
> 119 Osmolal Gap: measured osm − calculated osm where calculated =
> 2×Na + glucose/18 + BUN/2.8 (+ ETOH/4.6 if present). Live-render.
>
> 120 A-a Gradient & P/F Ratio: inputs FiO2, PaO2, PaCO2, atm
> pressure (default 760), age. Outputs A-a gradient, expected A-a by
> age (age/4 + 4), P/F ratio with ARDS severity band per Berlin
> criteria. Live-render.
>
> 121 Winter's Formula: input HCO3. Output expected PaCO2 (1.5×HCO3
> + 8 ± 2). Compare to a user-supplied measured PaCO2 if present and
> indicate concomitant respiratory acid-base disorder.
>
> 122 MAP / Pulse Pressure / Shock Index: inputs SBP, DBP, HR. Output
> MAP (DBP + 1/3 PP), PP, SI (HR/SBP), modified SI.
>
> 123 Body Weight & BSA Suite: inputs height, sex, weight. Output IBW
> (Devine), AdjBW (IBW + 0.4×(actual−IBW)), BSA Mosteller
> (sqrt(ht_cm × wt_kg / 3600)), BSA DuBois
> (0.007184 × ht_cm^0.725 × wt_kg^0.425). All four side-by-side.
>
> 124 eGFR Suite: inputs serum creatinine, age, sex, weight. Output
> Cockcroft-Gault, MDRD, CKD-EPI 2021 (race-free) — all three side
> by side with the 2021 race-free shift explained inline.
>
> 125 FENa / FEUrea: inputs urine Na, plasma Na, urine Cr, plasma
> Cr (FENa); urine urea, plasma urea, urine Cr, plasma Cr (FEUrea).
>
> 126 Maintenance Fluids (4-2-1 rule): input weight kg. Output mL/hr
> for 0-10 kg (4 mL/kg/hr), 10-20 kg (+2 mL/kg/hr), >20 kg (+1
> mL/kg/hr).
>
> 127 QTc Suite: input QT, RR (or HR). Output Bazett, Fridericia,
> Framingham, Hodges, all four. Live-render.
>
> 128 Pregnancy Dating: inputs LMP date OR ultrasound CRL mm date.
> Output EDD (Naegele: LMP + 280 days), current GA, ultrasound-derived
> GA (from CRL), with the discordance flag if both are entered and
> they disagree by >7 days in the first trimester / >14 days in the
> second.
>
> Each calculator: live-render, Copy-all, Test-with-example, citation
> block, the inline clinical notice. Unit tests with at least 4
> published examples per calculator (8+ for QTc and eGFR which have
> multiple sub-formulas).
>
> Commit on `feature/v4.6-group-e`.

---

### Step v4.7: Group F medication / infusion extensions (utilities 129-135)

> Implement Group F extensions.
>
> 129 Opioid MME Calculator: multi-row entry — each row is a drug
> picker (morphine, oxycodone, hydrocodone, hydromorphone, oxymorphone,
> fentanyl patch, methadone, codeine, tramadol, tapentadol,
> buprenorphine), strength, doses-per-day. Sum total daily MME using
> the bundled CDC 2022 conversion factors. Show breakpoints (50 MME,
> 90 MME) per CDC framing — but **do not** prescribe action. Citation
> to CDC.
>
> 130 Steroid Equivalence Converter: input drug + dose. Output
> equivalent doses for prednisone, methylpred, dex, hydrocortisone,
> with mineralocorticoid-activity flag. Source: standard pharmacology
> references in the project author's own words.
>
> 131 Benzodiazepine Equivalence Converter: input drug + dose. Output
> equivalent doses across the Ashton table. Citation to Ashton.
>
> 132 Antibiotic Renal Dose Adjustment: input antibiotic + CrCl band.
> Output dose / interval per the bundled FDA-label subset. Citation to
> the package insert (DailyMed link).
>
> 133 Vasopressor Dose ↔ Rate: bidirectional. Inputs: drug, patient
> weight, bag concentration (e.g., 4 mg in 250 mL = 16 µg/mL), desired
> dose (µg/kg/min) → output mL/hr; OR pump rate mL/hr → output
> µg/kg/min. Drugs: norepi, epi, dopamine, vasopressin, phenylephrine,
> dobutamine.
>
> 134 TPN Macronutrient Calculator: input final volume, dextrose%,
> amino acid%, lipid%. Output total kcal, protein g, carb g, fat g,
> kcal-from-each-source breakdown.
>
> 135 IV-to-PO Conversion: bundled small table — antibiotic →
> bioavailability → IV/PO ratio. Citation to FDA labels.
>
> Each gets live-render, Copy-all, Test-with-example, citation, the
> clinical inline notice. Unit tests with published examples.
>
> Commit on `feature/v4.7-group-f`.

---

### Step v4.8: Group G scoring extensions (utilities 136-160)

> Implement Group G extensions per section 5. Most use
> `lib/screener.js`; the cardiac risk scores (TIMI, GRACE, HEART,
> PERC, Wells PE, Geneva) and severity scores (CURB-65, PSI, qSOFA,
> SOFA, MELD, Child-Pugh, Ranson, BISAP) use the existing Group G
> calculator pattern; the psych screeners (PHQ-9 152, GAD-7 152,
> AUDIT-C 153, CAGE 154, EPDS 155) use `lib/screener.js`.
>
> Build them in this order to keep PRs small:
>
> Wave 1 (cardiac risk): 136 TIMI, 137 GRACE, 138 HEART, 139 PERC,
> 140 Wells PE / Geneva.
> Wave 2 (sepsis / pneumonia / pancreatitis / hepatic): 141 CURB-65,
> 142 PSI/PORT, 143 qSOFA / SOFA, 144 MELD-3.0 / Child-Pugh,
> 145 Ranson / BISAP.
> Wave 3 (ENT / clotting / appendicitis / OB / stroke):
> 146 Centor / McIsaac, 147 Wells DVT / Caprini,
> 148 Bishop, 149 Alvarado / Pediatric Appendicitis, 150 mRS reference.
> Wave 4 (psych screeners): 151 PHQ-9, 152 GAD-7, 153 AUDIT-C,
> 154 CAGE, 155 EPDS, 156 Mini-Cog.
> Wave 5 (substance withdrawal): 157 CIWA-Ar, 158 COWS.
> Wave 6 (CV risk): 159 ASCVD PCE, 160 PREVENT 2023.
>
> Every screener gets the inline "Screening, not diagnosis" notice.
> Every score: severity bands, citations, Test-with-example, Copy-all.
> ASCVD PCE and PREVENT use the published equations as-is — verify
> the implementation against at least 3 worked examples from the
> source publications.
>
> Unit tests: at least 5 cases per score covering each severity band.
> ASCVD PCE: at least 8 cases across both sex and both race-stratified
> equations (note: PCE retains race-stratified equations; PREVENT does
> not — call this difference out in both tiles' citation blocks).
>
> Commit one PR per wave. `feature/v4.8a` through `feature/v4.8f`.

---

### Step v4.9: Group H workflow extensions (utilities 161-165)

> Implement Group H extensions. All use `lib/print.js`.
>
> 161 HIPAA Authorization Form Generator: every 45 CFR 164.508 element
> rendered as a labeled input. Output a print-ready authorization
> form. Strong "not legal advice" notice.
>
> 162 ROI Request Generator: produces a written records-release
> request (separate from the right-of-access tile 110, which is the
> patient-to-provider request; this one is the patient-authorizing-
> third-party request).
>
> 163 Discharge Instruction Template: by run-type (post-op, post-MI,
> post-stroke, post-pneumonia, etc.). Inputs: diagnosis, follow-up
> date, return-precaution list (multi-select), medication list.
> Output is print-ready. Strong notice that institutional discharge
> protocols govern.
>
> 164 Specialty-Visit Question Generator: like the existing
> appointment-prep tile but specialty-specific (cardiology, oncology,
> ortho, GI, derm, neuro, OB/GYN, peds). Bundled hand-curated bank.
> Output is a print-ready question list.
>
> 165 Medication Wallet Card Generator: free-form med list input
> (drug, dose, frequency, indication, prescriber). Output is a
> tri-fold wallet-sized card via `lib/print.js`. Strong notice that
> the card is not a substitute for a pharmacist-reviewed list.
>
> Unit tests: at least one per tile validating that the generator
> produces all required fields.
>
> Commit on `feature/v4.9-group-h`.

---

### Step v4.10: Group I field-medicine extensions (utilities 166-171)

> Implement Group I extensions per section 5.
>
> 166 NEXUS + Canadian C-Spine: side-by-side decision aids.
> NEXUS: 5 binary criteria → cleared-clinically vs imaging-required.
> Canadian C-Spine: high-risk factors, low-risk factors, range-of-motion
> step. Use `lib/tree.js` for Canadian C-Spine; use `lib/screener.js`
> with binary items for NEXUS.
>
> 167 DOT ERG Lookup: input UN/NA number → ERG guide page summary
> (initial isolation, protective action distances, immediate response
> actions). Source: PHMSA ERG. Citation to ERG edition.
>
> 168 NIOSH Pocket Guide Lookup: input chemical name or CAS number →
> exposure limits (TWA, STEL, IDLH), PPE class, target organs.
> Source: NIOSH NPG. Bundled subset of common prehospital agents.
>
> 169 CPR Numeric Reference: bundled AHA-attributed numeric values —
> compression rate (100-120/min), depth (≥2 in adult, 1/3 AP diameter
> peds), ratio (30:2 single-rescuer adult, 15:2 two-rescuer peds),
> ventilation rate (10/min advanced airway adult, 20-30/min peds).
> AHA citation. **Numeric only.** Extend the existing AHA
> non-flowchart test.
>
> 170 TCCC Tourniquet & Wound-Packing Reference: numeric facts only
> (time-to-application, conversion-vs-leave criteria), citation to
> TCCC public guidelines.
>
> 171 CO / Cyanide / Smoke-Inhalation Antidote Reference: hydroxocobalamin
> dosing, sodium thiosulfate dosing, hyperbaric oxygen indication
> threshold. Source: FDA labels via DailyMed.
>
> Every Group I tile carries the spec-v3 6.5 expanded local-protocol
> notice ("This is a math aid for verification. Local protocols,
> medical direction, and clinician judgment govern any clinical
> decision.").
>
> Unit tests for the formulas / decision logic.
>
> Commit on `feature/v4.10-group-i`.

---

### Step v4.11: Group J public-health & travel (utilities 172-180)

> Implement Group J — six new tiles plus the three immunization-schedule
> tiles. Open the new `views/group-j.js` renderer file.
>
> 172 Routine Adult Immunization Schedule (ACIP): bundled current-year
> CDC ACIP table. Render via `lib/table.js` filtered by age band and
> condition (pregnancy, immunocompromise, etc.).
>
> 173 Routine Child Immunization Schedule (ACIP): same pattern.
>
> 174 Catch-Up Immunization Schedule: input age + last-dose dates per
> antigen → next-dose dates per ACIP catch-up rules.
>
> 175 Yellow Book Country Lookup: input country → recommended /
> required vaccines, malaria prophylaxis recommendation, food/water
> precautions, altitude considerations. Bundled CDC Yellow Book
> by-country table.
>
> 176 Tetanus Prophylaxis Decision Tree: clean vs dirty wound × Td/Tdap
> status × time-since-last-dose → Td/Tdap and TIG decision per CDC.
> `lib/tree.js`.
>
> 177 Rabies PEP Decision Tree: animal type, exposure type
> (bite/non-bite/no-contact), animal availability for observation →
> PEP indicated vs not, with HRIG + vaccine schedule. `lib/tree.js`.
>
> 178 BBP Exposure Decision Tree: source patient HIV/HBV/HCV status
> (known positive / unknown / known negative), exposure type
> (percutaneous, mucous membrane, intact skin), exposed worker HBV
> vaccination status → PEP recommendation per CDC.
>
> 179 TB Testing Interpretation: input TST induration mm + risk
> category → positive vs negative per CDC cutoffs (5 / 10 / 15 mm
> bands). For IGRA, input the assay result → interpretation.
>
> 180 STI Screening Interval Reference: input demographic / risk
> category → recommended screening tests and intervals per CDC.
> `lib/table.js`.
>
> Each tile gets citations, copy-all, the appropriate inline notice
> (clinical for 176-179; reference for the rest). Unit tests for the
> decision logic. Commit on `feature/v4.11-group-j`.

---

### Step v4.12: Group K lab reference (utilities 181-184)

> Implement Group K — four reference tables.
>
> 181 Adult Lab Reference Ranges: bundled NIH MedlinePlus values for
> common chem, CBC, coags, lipids, LFTs, TFTs, iron studies, B12/folate,
> HbA1c. Conventional units AND SI units side-by-side.
>
> 182 Pediatric Lab Reference Ranges by Age Band: same with age
> bands (neonate, infant, child, adolescent).
>
> 183 Therapeutic Drug Levels: vanc, dig, lithium, phenytoin, valproate,
> tacro, cyclosporine, sirolimus, gentamicin/tobramycin, theophylline.
> Source: FDA labels via DailyMed.
>
> 184 Toxicology Level Reference: acetaminophen, salicylate, lithium,
> lead, CO, methanol, ethylene glycol, iron. Treatment thresholds are
> stated as "level associated with clinical toxicity per published
> references" — never as treatment recommendations.
>
> All four use `lib/table.js`. Citations. Inline notice that lab
> ranges vary by lab and reference materials. Commit on
> `feature/v4.12-group-k`.

---

### Step v4.13: Group L forms-literacy (utilities 185-187)

> Implement Group L — three pure-reference tiles.
>
> 185 CMS-1500 Field-by-Field Decoder: 33 fields decoded into plain
> English. Bundled. Print-ready.
>
> 186 UB-04 Field-by-Field Decoder: 81 form locators decoded into
> plain English. Bundled. Print-ready.
>
> 187 EOB Jargon Glossary: bundled glossary (allowed amount, write-off,
> copay, coinsurance, deductible, OOP max, COB, balance billing,
> in-network vs out-of-network, prompt pay, timely filing, etc.).
> Searchable via `lib/table.js`.
>
> Citations: project-original prose; cite original CMS / NUBC docs as
> "see original at <link>" without quoting copyrighted prose.
>
> Commit on `feature/v4.13-group-l`.

---

### Step v4.14: Group M eligibility (utilities 188-191)

> Implement Group M.
>
> 188 Medicaid by State Quick-Card: input state → adult FPL threshold,
> pregnant FPL threshold, CHIP threshold, expansion status,
> application URL. Source: state Medicaid agency files (numeric
> thresholds only — no agency prose). `lib/table.js` filtered.
>
> 189 VA Eligibility 1-2-3: decision tree → service-connected vs
> non-service-connected eligibility category, copay tier, CHAMPVA vs
> direct VA differentiation. `lib/tree.js`.
>
> 190 TRICARE Plan Picker: decision tree → Prime / Select / For Life
> based on duty status, age, geographic enrollment area.
>
> 191 IHS Eligibility Quick-Reference: bundled rules card. Strong
> notice that tribal-specific rules vary; the card is generic IHS.
>
> Commit on `feature/v4.14-group-m`.

---

### Step v4.15: Group N literacy helpers (utilities 192-194)

> Implement Group N.
>
> 192 Universal Unit Converter: live-render. Categories: lab values
> (glucose mg/dL ↔ mmol/L; cholesterol; creatinine; BUN; calcium;
> uric acid; HbA1c % ↔ mmol/mol IFCC), vitals (mmHg ↔ kPa, °F ↔ °C,
> ft/in ↔ cm, lb/oz ↔ kg). Single tile with a category dropdown.
>
> 193 Time-to-Dose Helper: input "took at" time + frequency
> (q4h/q6h/q8h/q12h/qd/bid/tid/qid). Output the next 4 dose times.
> Live-render. No storage.
>
> 194 Pediatric Weight Converter: lb / oz / lb-and-oz ↔ kg, with the
> common neonatal/infant weight-band reference card alongside.
>
> Unit tests: at least 6 known conversions per category. Commit on
> `feature/v4.15-group-n`.

---

### Step v4.16: Group O patient safety (utilities 195-197)

> Implement Group O.
>
> 195 High-Alert Med Wallet Card: bundled ISMP-attributed list of
> high-alert meds with the patient-friendly safety notes the user can
> annotate with their own meds. Print via `lib/print.js`. Citation to
> ISMP.
>
> 196 Drug Recall Lookup: bundled weekly snapshot of FDA Recalls API
> filtered to drug recalls. Searchable via `lib/table.js`. Each row:
> drug name, NDC, recall class (I/II/III), reason, recall date,
> firm. The data is refreshed weekly by `data-refresh.yml`.
>
> 197 Vaccine Lot Recall Lookup: bundled weekly snapshot of FDA / CDC
> vaccine lot lists. Same pattern as 196.
>
> Strong inline notice that recall data lags upstream by up to one
> week, and that the canonical authority is the FDA Recalls page (link
> visible).
>
> Commit on `feature/v4.16-group-o`.

---

### Step v4.17: Site-wide updates

> 1. **README.md**: update the utility count from 79 to 195. Update the
>    group description list to include J / K / L / M / N / O.
> 2. **index.html**: add the six new `.home-section` blocks for J-O.
>    Add the audience-tag attributes on every new tile (the existing
>    five audiences). No new audience filter button (per section 2).
> 3. **app.js UTILITIES**: add all 116 new tile entries with id,
>    label, group, audiences, clinical flag, leader-key bindings.
> 4. **scripts/build-ld.mjs**: ensure the JSON-LD `featureList` is
>    regenerated to 195 entries.
> 5. **scripts/build-sitemap.mjs**: regenerate sitemap.xml to 196
>    URLs (root + 195).
> 6. **CHANGELOG.md**: add a `[Unreleased]` section block for v4
>    summarizing every group's added tiles.
> 7. **docs/architecture.md**: add the v4 sections (shared renderers
>    list, expanded group list).
> 8. **docs/data-sources.md**: enumerate every new dataset with its
>    source URL, agency, status, cadence.
> 9. **docs/legal.md**: add explicit posture lines for every new
>    bundled dataset (per section 3 of `docs/spec-v4.md`).
> 10. **docs/clinical-citations.md**: add citations for every new
>     calculator and screener.
> 11. **docs/accessibility.md**: confirm every new tile passes the
>     existing `scripts/a11y-check.mjs`. Run it.
> 12. **docs/operations.md**: document the 50 new datasets and any
>     cadence-specific refresh notes.
> 13. **docs/threat-model.md**: confirm no new threat surface (no new
>     network calls, no new storage). Add a paragraph noting the v4
>     review.
>
> Commit on `feature/v4.17-site-updates`.

---

### Step v4.18: Verification & final pass

> Walk through this checklist and produce `docs/spec-v4-checklist.md`
> in the same format as `dist/docs/spec-v3-checklist.md`. Each item is
> PASS or PENDING (with the reason).
>
> | Item | Verification |
> |------|--------------|
> | All 116 new tiles render | Playwright smoke; visual spot-check |
> | Every new calculator has Test-with-example | grep `lib/meta.js` |
> | Every new lookup has a data-source stamp | unit test |
> | Every new dataset has a valid manifest | `verify-integrity.mjs` |
> | No new outbound fetches at runtime | Playwright network assertion |
> | No localStorage / sessionStorage / cookies / IndexedDB | existing storage assertion |
> | CSP unchanged | _headers diff is empty for CSP line |
> | No new licensed content bundled | extend grep tests for AMA / AHA / SNOMED / MoCA |
> | a11y check clean across every new view | `scripts/a11y-check.mjs` |
> | grep-check clean (no emojis, em-dashes, banned APIs) | `scripts/grep-check.mjs` |
> | Lint clean | `npm run lint` |
> | All unit tests pass | `npm run test:unit` |
> | All Playwright tests pass | `npm run test:e2e` |
> | SBOM regenerates without error | `npm run sbom` |
> | Lighthouse floor (0.95) holds for the home view and a representative tile per group | CI lighthouse job (PENDING — needs CI runner) |
> | README, JSON-LD, sitemap counts all match (195) | grep |
> | CHANGELOG entry present | grep |
>
> Run `npm run release:check` and confirm a clean exit. Commit on
> `feature/v4.18-final-pass`.

---

## 8. Closing note

spec.md established what sophiewell.com is. spec-v2.md established how
it must feel to use. spec-v3.md added the field-medicine layer. spec-v4
finishes the public-utility coverage: every common code lookup, every
common pricing lookup, every common patient-facing literacy tool, every
common clinical formula, every common scoring instrument, every common
public-health decision aid, every common forms-literacy reference. The
result is a single static page that serves five overlapping audiences
end-to-end with no servers, no accounts, no telemetry, and no cost.

After v4 ships, the site has 195 deterministic utilities, 72 manifest-
tracked datasets, zero runtime network calls, zero AI, zero tracking,
and every utility usable offline once cached. It runs free forever on
Cloudflare Pages because it is a small handful of static files plus
sharded JSON. That is the entire commitment.

Build v4 in waves. Do not try to land it as one PR. The waves above are
sized so each one is a single reviewer-day's work and ships green
through the existing release gate (`npm run release:check`).
