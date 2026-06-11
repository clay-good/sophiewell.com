# Data Sources

After the spec-v10 patient-artifact retirement and the spec-v29 nurse-
first prune, sophiewell.com bundles only the data a *calculator*
needs to do its math. The site is no longer a host of code books,
fee schedules, or static reference tables; the catalog that drove
the v1-v8 build-data pipeline was retired in spec-v29 wave 29-2
(see [docs/spec-v29.md §2](spec-v29.md)). This document lists the
data that still ships with the page.

Each surviving dataset folder under `data/` contains a
`manifest.json` with at minimum: `dataset`, `sourceUrl`, `agency`,
`status`, `cadence`, `fetchDate`, `recordCount`, and (where the
dataset is sharded) per-shard SHA-256 hashes. The runtime verifier
(`scripts/verify-integrity.mjs`) reads every manifest on
`npm run test` and `npm run release:check`.

## Clinical reference data

`data/clinical/formulas.json` carries the citation register for the
formulas in `lib/clinical.js`, `lib/scoring-v4.js`,
`lib/medication-v4.js`, and the v17-v29 wave additions. The
computations themselves are code, not data; the JSON exists so the
Source / Reference region of each tile can show the citation inline.

`data/clinical/manifest.json` declares `status:
public-formulas-and-original-notes` and lists `formulas.json` as
the only bundled file. The four single-class reference tables
that used to live in this folder (`pediatric-vitals.json`,
`beers.json`, `asa-status.json`, `mallampati.json`) were retired
with their tiles in spec-v29 wave 29-2 §2.5.

Note (spec-v54 §3 #7 reconciliation): the retired `beers.json`
was the standalone Beers reference *table*. The live `beers-check`
deprescribing tile is a different artifact — it carries the AGS
2023 Beers content **embedded in `lib/medication-v4.js`** (the
`beersCheck` export), not in a JSON shard. Its citation is inline
in `META['beers-check']` with `citationAccessed`, and it has a row
in `docs/citation-staleness.md`. So "the `beers.json` shard was
retired" and "the `beers-check` tile ships current Beers data" are
both true and not in conflict.

## Field Medicine datasets

The Group I (Field Medicine) datasets introduced in spec-v3 survive
where the bundled data drives a calculation rather than a static
card. The static cards (adult / pediatric arrest references, defib
energy lookup, AHA CPR wallet, NIOSH Pocket Guide, DOT ERG, TCCC
wound-packing card, hypothermia / heat-illness staging tables,
toxidromes table) were retired in spec-v29 wave 29-2 §2.3.

### CDC Field Triage Guidelines

- Source URL: https://www.cdc.gov/mmwr/volumes/71/rr/rr7102a1.htm
- Publishing agency: Centers for Disease Control and Prevention
- Status: Public domain
- Cadence: As published
- Shard layout: `data/field-triage/guidelines.json` plus
  `data/field-triage/manifest.json`. The 4-step decision tree is
  encoded as plain JSON; original prose summaries by the project
  author.

### START / JumpSTART MCI Triage Algorithms

- Source URL: https://www.start-triage.com/ ; CHOC Children's Hospital
  JumpSTART materials.
- Publishing agency: Newport Beach Fire Department / Hoag Hospital
  (START); CHOC Children's Hospital (JumpSTART).
- Status: Public-domain MCI triage algorithms.
- Shard layout: `data/mci-triage/algorithms.json` plus
  `data/mci-triage/manifest.json`.

### FDA Prehospital Drug Labeling subset

- Source URL: https://dailymed.nlm.nih.gov/
- Publishing agency: FDA (DailyMed)
- Status: Public domain
- Cadence: As needed (manual review)
- Shard layout: `data/prehospital-meds/meds.json` plus
  `data/prehospital-meds/manifest.json`. Twenty-two standard
  prehospital medications with adult dose, pediatric dose, route,
  and notes.

### EMS PCR run-type checklists

- Source: project-author original templated checklists.
- Publishing agency: sophiewell.com (Clay Good).
- Status: MIT-licensed original content.
- Shard layout: `data/workflow/ems-runtypes.json` (no manifest;
  loaded directly by the EMS Documentation Helper view per
  spec-v3 §5.1).

## Public-health decision trees

These datasets back the surviving Group J public-health calculators
(tetanus prophylaxis, rabies PEP, bloodborne pathogen exposure, TB
test interpretation, STI screening intervals).

| Dataset | Source | Agency | Status |
|---|---|---|---|
| `data/tetanus/` | ACIP & CDC tetanus guidance | CDC | Public domain |
| `data/rabies-pep/` | ACIP rabies PEP guidance | CDC | Public domain |
| `data/bbp-exposure/` | CDC bloodborne-pathogen exposure guidance | CDC | Public domain |
| `data/tb-tst-igra/` | CDC TB testing interpretation | CDC | Public domain |
| `data/sti-screening/` | CDC STI screening intervals | CDC | Public domain |

Each folder ships a single JSON shard plus its `manifest.json`.

## Medication & infusion datasets

The Group F medication calculators that consume a bundled table do
so through small per-tile shards. None of these are static lookups;
each one is read by a calculator that computes a dose, rate, or
ratio from user input.

| Dataset | Drives | Source / status |
|---|---|---|
| `data/abx-renal/abx.json` | Antibiotic Renal Dose Adjustment | FDA labels (DailyMed) summarized into renal bands |
| `data/benzo-equiv/benzo.json` | Benzodiazepine Equivalence (Ashton) | Ashton manual; numeric facts with attribution |
| `data/steroid-equiv/steroid.json` | Steroid Equivalence Converter | Standard pharmacology references (MIT-licensed original numeric tables) |
| `data/mme-factors/mme.json` | Opioid MME (CDC 2022) | CDC public-domain conversion factors |
| `data/tpn-rules/tpn.json` | TPN Macronutrient Calculator | Standard nutrition references; project-author original numeric tables |
| `data/vasopressor-doses/vasopressors.json` | Vasopressor Dose-to-Rate + VIS | Standard ICU references; numeric facts with attribution |

## Workflow templates

`data/workflow/` carries the templated-question banks for the
workflow generators (appointment prep, prior-auth, specialty-visit
questions, EMS run-type checklists). Files are project-author
original content, MIT-licensed.

## Pre-rendered per-tile copy

`data/tool-copy/` carries the hand-authored lede + intro markdown
<!-- catalog-truth:historical -->
for the 122 tiles that have bespoke pre-rendered copy on their
`/tools/<id>/` page (see `scripts/build-tool-pages.mjs`, which
reports this as "N with hand-authored copy"). Each file is
project-author original content. The "122" here is the count of
tiles whose id matches a `data/tool-copy/<id>.json` and therefore
renders that copy — not the catalog total. It grows independently
as more per-tile prose is written. Every file maps 1:1 to a
current tile: `check-catalog-truth.mjs` fails CI if copy lingers
for a tile removed in the v29 prune (`REMOVED_V29_IDS`), so the
directory cannot re-accumulate the 57 orphaned files that the v29
deletions had left behind.

## MPFS (vestigial; not consumed at runtime)

`data/mpfs/` is a vestige of the v1-v8 pricing-tile era. The MPFS
shards and GPCI / conversion-factor files still ship from disk so
the build-data pipeline does not need a special-case for empty
input, but no tile consumes them at runtime. They will be removed
in a future cleanup pass.

## Synonyms

`data/synonyms.json` carries the hand-curated phrase → tile map
that drives the hero search (spec-v7 §3.2). It is consumed by
`lib/synonyms.js` at boot. Project-author original, MIT-licensed.

## Retired datasets

The following data folders were bundled in v1-v8 and have been
retired:

- **Code lookups (spec-v29 wave 29-2 §2.1):** `icd10cm/`, `hcpcs/`,
  `cpt-summaries/`, `ndc/`, `crosswalks/` (POS, modifier, revenue,
  CARC, RARC), `tob-codes/`, `nubc-special-codes/`, `drg/`, `apc/`,
  `icd10-pcs/`, `rxnorm/`, `npi/`.
- **Patient-administrative infographics (spec-v29 wave 29-2 §2.2):**
  `cms-1500-fields/`, `ub04-fields/`, `eob-glossary/`, plus the
  `lib/decoder.js` regex pipeline.
- **Field-medicine reference cards (spec-v29 wave 29-2 §2.3):**
  `aha-reference/`, `cpr-aha-numeric/`, `tccc/`, `toxidromes/`,
  `dot-erg/`, `niosh-pg/`, `environmental/` (hypothermia / heat-
  illness staging tables).
- **Lab and pharmacy reference tables (spec-v29 wave 29-2 §2.4):**
  `lab-ranges-adult/`, `lab-ranges-peds/`,
  `therapeutic-drug-levels/`, `tox-levels/`, `iv-to-po/`,
  plus the `data/clinical/lab-ranges.json` and
  `data/clinical/ismp-high-alert.json` files inside the clinical
  folder.
- **Pricing / coverage / enforcement (spec-v10 + spec-v29):**
  `mpfs/`-driven Medicare Fee Lookup, `nadac/`, `ncci/`, `mue/`,
  `coverage/` (LCD / NCD), `enforcement/` (OIG exclusions,
  Medicare opt-out), `hospital-prices/`, `no-surprises/`,
  `state-rights/`. Some folders linger on disk but no tile
  reads them.
- **Eligibility & benefits (spec-v29 wave 29-2 §2.2):**
  `medicaid-state/`, `va-eligibility/`, `tricare-plans/`,
  `ihs-eligibility/`.
- **Other (spec-v29 wave 29-2):** Beers Criteria
  (`data/clinical/beers.json`), pediatric vitals
  (`data/clinical/pediatric-vitals.json`), ASA status
  (`data/clinical/asa-status.json`), Mallampati class
  (`data/clinical/mallampati.json`).

Every retirement is recorded in `CHANGELOG.md` under the
appropriate spec-v29 wave 29-2 entry.

## Manifests

Each bundled dataset folder contains a `manifest.json` with the
fields listed in the header above. The runtime verifier
(`scripts/verify-integrity.mjs`) walks `data/` and re-hashes every
shard against its manifest entry on every `npm run test`.
