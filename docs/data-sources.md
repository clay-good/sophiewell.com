# Data Sources

After the spec-v10 patient-artifact retirement and the spec-v29 nurse-
first prune, sophiewell.com bundles only the data a *calculator*
needs to do its math. The site is no longer a host of code books,
fee schedules, or static reference tables; the catalog that drove
the v1-v8 build-data pipeline was retired in spec-v29 wave 29-2
(see [docs/spec-v29.md §2](spec-v29.md)). This document lists the
data that still ships with the page.

Each surviving dataset folder under `data/` contains a
`manifest.json` (manifest v2, [spec-v1622](spec-v1622.md)) with
`dataset`, `sourceUrl`, `agency`, `status`, `cadence`, `recordCount`,
per-shard SHA-256 hashes, and the fields that say what the data is:

| Field | Meaning |
|---|---|
| `coverage` | `sample` (hand-written example rows), `subset` (a deliberately partial reference table) or `full` (a whole fetched file) |
| `coverageNote` | what the sample or subset holds |
| `sourceEdition` | the publisher's edition label, or `unversioned` |
| `curatedAt` | the date a person last changed the records (hand-written data) |
| `fetchedAt` | the date a builder downloaded the source (fetched data only) |
| `contentChangedAt` | the date the records last changed |
| `expiresOn` | when the data lapses; a curated table lapses two years after `curatedAt` |
| `recordsSha256` | hash of the data files, so an unchanged run writes nothing |

Nothing is fetched yet: every dataset is a `sample` or a `subset`. The
page stamp under bundled data comes from `stampText()` in `lib/data.js`
("Curated from ... Checked by a person May 5, 2026."), and no live tool
reads a `sample` or an expired dataset (`test/unit/data-freshness.test.js`).
`npm run data:freshness` prints every dataset and dated constant with
its status. The verifier (`scripts/verify-integrity.mjs`) checks every
manifest and shard hash on `npm run test` and `npm run release:check`.

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

- Source URL: https://dailymed.nlm.nih.gov/dailymed/
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
for the 135 tiles that have bespoke pre-rendered copy on their
`/tools/<id>/` page (see `scripts/build-tool-pages.mjs`, which
reports this as "N with hand-authored copy"). Each file is
project-author original content. The "135" here is the count of
tiles whose id matches a `data/tool-copy/<id>.json` and therefore
renders that copy — not the catalog total, which is why the line
carries the escape that exempts it from the blunt catalog-count
rule. That escape used to be the whole story, and the sentence
read 122 against a live 124; `check-catalog-truth.mjs` now holds
it to the real number instead. It still grows independently as
more per-tile prose is written. Every file maps 1:1 to a
current tile: `check-catalog-truth.mjs` fails CI if copy lingers
for a tile removed in the v29 prune (`REMOVED_V29_IDS`), so the
directory cannot re-accumulate the 57 orphaned files that the v29
deletions had left behind.

## Fetched federal datasets

Since [spec-v1621](spec-v1621.md) these come from the publisher's own files,
fetched by `node scripts/data/run.mjs` (one builder per dataset under
`scripts/data/builders/`), checked against bounds and per-edition canaries,
and written with `coverage: 'full'`, `fetchedAt`, `sourceEdition` and
`sourceSha256`. No tile reads them yet; the file tools of
[spec-v1626](spec-v1626.md) will.

| Folder | Source | Edition today | Size |
|---|---|---|---|
| `data/mpfs/` | CMS PFS relative value file (PPRRVU nonQPP, GPCIs, both conversion factors); AMA descriptors dropped | RVU26D | 19,453 codes, 109 localities |

## ICD-10-CM and DRG samples (not consumed at runtime)

`data/icd10cm/` and `data/drg/` are hand-written samples (18 codes; 8
DRGs). Until [spec-v1622](spec-v1622.md) the live `icd10-validate` and
`drg-payment` tiles (and `rvu-payment`, from the old `mpfs/` sample)
filled inputs or printed notes from them, as if they were the code set and
IPPS Table 5. A sample cannot answer about a reader's code, so those reads
were removed; the tiles take the values from the reader, and `rvu-payment`
defaults to the dated CY2026 conversion factor in `lib/billing-v78.js`.

## Synonyms

`data/synonyms.json` carries the hand-curated phrase → tile map
that drives the hero search (spec-v7 §3.2). It is consumed by
`lib/synonyms.js` at boot. Project-author original, MIT-licensed.

## Retired tiles, and what happened to their data

The spec-v29 wave 29-2 nurse-first prune and the spec-v10 clinical pivot retired
a large set of tiles. **Retiring a tile did not delete its dataset.** Of the
forty data folders those waves named, twelve are gone, three were never retired
at all, and twenty-five are still on disk — still produced by
`scripts/build-data.mjs`, still hashed into a manifest, still verified by
`npm run data:verify`, still copied into `dist/`, and still re-stamped by the
weekly refresh. This section used to list all forty together as "retired", which
is why nobody noticed. Three more folders in the same state —
`hcpcs-modifiers/`, `pos-codes/` and `revenue-codes/`, the pieces the old
`crosswalks/` dataset was split into — were named in no list at all, and the
coverage check below is what found them.

`test/unit/retired-datasets.test.js` holds the lists to the tree: a folder
listed as deleted must not exist, a folder listed as still-built must exist
**and must be unreachable**, a folder a tile can actually load must not be on
that list, and every folder under `data/` must be accounted for by one list, by
a tile that reads it, or by the build-time set.

**Deleted — the folder is gone (12):**
`coverage/` (LCD / NCD), `enforcement/` (OIG exclusions, Medicare opt-out),
`hospital-prices/`, `ihs-eligibility/`, `medicaid-state/`, `mue/`, `nadac/`,
`ncci/`, `npi/`, `state-rights/`, `tricare-plans/`, `va-eligibility/`.

**Tile retired, data still built and shipped (31):**
`aha-reference/`, `apc/`, `cms-1500-fields/`, `cpr-aha-numeric/`,
`cpt-summaries/`, `crosswalks/`, `dot-erg/`, `drg/`, `environmental/`,
`eob-glossary/`, `hcpcs/`, `hcpcs-modifiers/`, `icd10-pcs/`, `icd10cm/`,
`iv-to-po/`, `lab-ranges-adult/`, `lab-ranges-peds/`, `mpfs/`, `ndc/`,
`niosh-pg/`, `no-surprises/`, `nubc-special-codes/`, `pos-codes/`,
`revenue-codes/`, `rxnorm/`, `tccc/`, `therapeutic-drug-levels/`, `tob-codes/`,
`tox-levels/`, `toxidromes/`, `ub04-fields/`. Together they are 60.6 KB.

**All thirty-one are unreachable, and that is now checked rather than
asserted.** A dataset reaches the browser one of two ways: a `loadFile` /
`loadShard` / `loadAllShards` / `loadManifest` call in `app.js`, `lib/` or
`views/`, or a `META[id].source.dataset` declaration. None of these has either.
Every apparent mention of one of them in `app.js` is its *tile* id inside a
`REMOVED_V29_IDS` tombstone list, which is what made a grep-based answer
misleading the first time this was measured.

`mpfs/`, `icd10cm/` and `drg/` left this list in spec-v998, when the
reachability check found live tiles loading them, and came back in spec-v1622,
when those loads were removed (see above).

**Keeping the thirty-one is a deliberate decision** (2026-09-02), not an
oversight: they are seeds a future tile can be built against, and several are
CMS code sets a billing tile would want. The cost is recorded so the decision
can be revisited with the numbers in hand: 60.6 KB in the bundle and thirty-one
manifests through `npm run data:verify` on every run. (The weekly refresh no
longer re-stamps them: since spec-v1622 an unchanged dataset writes nothing.)

Some individual files inside surviving folders were removed with their tiles:
`data/clinical/lab-ranges.json`, `data/clinical/ismp-high-alert.json`,
`data/clinical/beers.json`, `data/clinical/pediatric-vitals.json`,
`data/clinical/asa-status.json` and `data/clinical/mallampati.json`.

Every retirement is recorded in `CHANGELOG.md` under the appropriate spec-v29
wave 29-2 entry.

## Manifests

Each bundled dataset folder contains a `manifest.json` with the
fields listed in the header above. The runtime verifier
(`scripts/verify-integrity.mjs`) walks `data/` and re-hashes every
shard against its manifest entry on every `npm run test`.
