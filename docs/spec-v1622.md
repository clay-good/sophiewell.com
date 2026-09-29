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
