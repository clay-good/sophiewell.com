# spec-v1622 — Build: honest labels and freshness at run time

**Status:** Build spec, September 29, 2026. Implements [spec-v1614](spec-v1614.md) §1 and
§4. **Plan:** [spec-v1620](spec-v1620.md), milestone M1 (the first thing built).

This milestone changes no answers. It makes every data label true and gives the site the
machinery to refuse expired data, before any builder or file tool depends on it.

## Step 1 — Manifest v2 on the existing datasets

**Change** `scripts/build-data.mjs` `writeManifest()` to write the
[spec-v1614](spec-v1614.md) §1 fields and drop `fetchDate` and `offlineSeed`. Every
existing dataset is hand-written today, so every one is written as:

- `coverage: 'sample'` for the federal-file seeds (`icd10cm`, `hcpcs`, `mpfs`, `ndc`,
  `drg`, `apc`, `icd10-pcs`, `rxnorm`, `hcpcs-modifiers`, `pos-codes`, `crosswalks`,
  `no-surprises`) and `coverage: 'subset'` with a `coverageNote` for the curated
  reference tables that are deliberately partial by design (`clinical`, `tox-levels`,
  `aha-reference`, and the other v4 tables). The builder author decides per dataset; the
  list is in the PR description.
- `sourceEdition`: the edition the curator transcribed from, or `'unversioned'` where the
  seed never recorded one.
- `curatedAt` replaces `fetchedAt` for hand-written data: the date the values were last
  checked by a person, taken from git history of the seed (the last commit that changed the
  records), not from the run date.
- `contentChangedAt`: the same, computed by the builder from the records hash.
- `expiresOn`: for curated data, `curatedAt` plus the cadence rule; a curated table on an
  annual source expires two years after `curatedAt`.

**Change** `scripts/verify-integrity.mjs` to require the v2 fields, to reject
`fetchedAt` on a `sample` or `subset`, and to reject a `fetchDate` field anywhere.

**Fix the stale seeds found in passing.** `icd10cm`'s seed contains `M54.5` and `R51`,
which stopped being valid codes in FY2022 and FY2021 (they became `M54.50`/`M54.51`/`M54.59`
and `R51.9`). Replace them in the seed; a unit test asserts every sample code has no
children in the sample, as a cheap guard against non-billable parents.

Done when: `npm run data:verify` passes on v2 manifests; `git grep fetchDate` finds only
this spec and history.

## Step 2 — The refresh stops writing unchanged data

**Change** `writeShard` and `writeManifest` to compare the new bytes with the file on disk
and skip the write when equal. `contentChangedAt` only moves when records change.
`.github/workflows/data-refresh.yml` then opens no pull request on a week with no change
(the existing `create-pull-request` step already does nothing on an empty diff).

**Change** the summary (`scripts/analyze-data-changes.mjs`) to lead with one line per
coverage class: *"12 sample datasets (not fetched) · 22 curated subsets · 0 fetched."*

Done when: two consecutive offline runs leave `git status` clean.

## Step 3 — `datasetStatus` and the stamp

**Add** to `lib/data.js`:

- `datasetStatus(manifest, now)` returning `{ status, edition, checkedOn, expiresOn,
  coverage, note }`, with `status` one of `current`, `due`, `expired`, `sample`, per
  [spec-v1614](spec-v1614.md) §4. `due` needs `nextExpected` in the manifest (the
  builder computes it from cadence); curated datasets have none and are never `due`.
  `now` comes from the existing `SOPHIEWELL_NOW` pin in tests.
- `stampText(manifest, status)` producing the one sentence every view uses, for example
  *"CMS physician fee schedule, RVU26D, effective October 1, 2026. Checked September 27,
  2026."*, *"Curated from CDC guidance (2024 edition). Checked by a person March 3,
  2026."*, or *"Sample data for examples only."*

**Replace** the two "fetched" stamps (`lib/table.js` line ~74, `app.js` line ~4792) with
`stampText`. An `expired` status renders the stamp in the existing flag style with
*"This data has passed its review date."*

Done when: no rendered view contains the word "fetched"; a unit test covers every status
and the date wording ([spec-v1501](spec-v1501.md) §7 date style).

## Step 4 — Guards

- **Sample guard.** A unit test imports every module that calls `loadShard` /
  `loadAllShards` and records which datasets each reads. Any dataset with `coverage:
  sample` read outside a `META.example` path fails the test with the module and dataset.
- **Expiry guard.** A test pins `SOPHIEWELL_NOW` to the build date and fails when any
  dataset read by a live tool is `expired`. The list of "live tools reading a dataset"
  is generated, not maintained: the same import scan as the sample guard.
- **Not-found wording.** Any lookup against a `subset` or `sample` dataset that misses
  must say *"not in the bundled table"* and never *"invalid"* or *"not found"*; a grep
  check in `scripts/grep-check.mjs` flags those two strings in views that read datasets.

## Step 5 — One view of every dated value

The dated constants already use the fail-closed accessor: each module keeps its own table
(for example `irmaa-2026` in `lib/income-screens-v1506.js`) and calls `datedValue(id, key, now, table)`. The shared `DATED` in `lib/dated-data.js` is empty by design. Nothing moves.

**Add** an export convention (`export const DATED_TABLE`) to each module that has such a
table, and a script, `scripts/report-freshness.mjs`, that imports every module's table
and every dataset manifest and prints one list: id, edition, `validThrough` or `expiresOn`,
status. The expiry guard of Step 4 reads the same list, so a dated constant and a dataset
fail the build the same way. The pinned freshness issue ([spec-v1621](spec-v1621.md) §6)
is this list.

## Offline and the service worker

`sw.js` caches data cache-first per build (`sophiewell-data-${BUILD_HASH}`). A reader who
stays offline keeps the build they last loaded, and with it that build's manifests.
`datasetStatus` runs on the reader's clock, so an offline reader past `expiresOn` gets
the expired behavior with no network. Nothing in the service worker changes.

## Build status

**Built September 29, 2026.** All five steps.

| Step | Built | Differs from the spec |
|---|---|---|
| 1 Manifest v2 | `writeManifest()` in `scripts/build-data.mjs` writes `manifestVersion: 2`, `coverage`, `coverageNote`, `sourceEdition`, `curatedAt`, `contentChangedAt`, `expiresOn` and `recordsSha256` from one `COVERAGE` table. 15 datasets are `sample`, 31 are `subset`. `verify-integrity` rejects a missing field, `fetchedAt` on a sample or subset, and `fetchDate` anywhere under `data/` (three `data/workflow/*.json` files carried it; renamed `curatedAt`). The ICD-10-CM seed lost `M54.5`, `R51` (retired) and the parents `A00`, `E11`; a test asserts no sample code has a child in the sample. | `curatedAt` came from git history on the first run (the last commit that changed the records, ignoring the old date restamps) and is carried forward by `recordsSha256` after that. Editions are `unversioned` unless the seed itself states one: a guessed edition would be a new overstatement. |
| 2 No date-only diffs | `writeIfChanged()` behind every shard, ancillary file and manifest. The refresh summary leads with *"15 sample datasets (not fetched) · 31 curated subsets · 0 fetched."* | CI gained a `Seed data is byte-stable` step (`git diff --exit-code -- data`), and the build-idempotency step no longer needs its manifest exclusion. |
| 3 `datasetStatus` and the stamp | `datasetStatus`, `stampText`, `stampDetail` in `lib/data.js`; both "fetched" stamps replaced; `expired` renders in the `warn` style. | `due` starts 30 days after `nextExpected`. A manifest with no `expiresOn` is `expired` (fails closed). `stampDetail` is the stamp without the source name, for the tool view that already prints the name as a link. |
| 4 Guards | Sample guard and expiry guard in `test/unit/data-freshness.test.js`, from a source scan of the loaders, raw `data/<id>/` fetches and `META.source.dataset`. The not-found wording rule is in `scripts/grep-check.mjs`. | The sample guard found three live tools answering from samples. `rvu-payment` filled RVUs from a typed code and GPCIs from a locality list (5 example codes, 4 example localities): the code field and locality picker are gone, and the conversion factor defaults to the dated constant. `drg-payment` filled the weight from 8 example DRGs: the code field is gone. `icd10-validate` said whether a code was "in the bundled sample set": the note and the fetch are gone. |
| 5 One freshness list | `scripts/report-freshness.mjs` (`npm run data:freshness`) lists every `DATED_*` table row and every dataset. The expiry guard reads it. | No `DATED_TABLE` alias: the modules already export their tables as `DATED_*`, so the script discovers that prefix (`post-acute-clocks-v1514.js` gained a `DATED_SNF_COINSURANCE` export). A dated **family** is expired only when its newest row has lapsed, because year-keyed rows stay right for the year they describe. |

**Found in passing.** The CY2026 Medicare conversion factor was $32.7442, the CY2024 figure; it is $33.4009 (nonqualifying APM) under CMS-1832-F. Fixed in the commit before this one.

**Open.** The CY2027 Part A and B premiums, IRMAA, SNF coinsurance and MSP/LIS resource limits lapse on December 31, 2026; the expiry guard fails the build from January 1, 2027 until the next editions are added (CMS usually publishes them in November).
