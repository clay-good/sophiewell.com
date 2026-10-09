# spec-v1614 — Data truth: honest manifests, real refresh, freshness at run time

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1610](spec-v1610.md). **Completes:** [spec-v1517](spec-v1517.md)
"Failure behavior" (specified, not built). **Keeps:** the [spec-v77](spec-v77.md) §2
doctrine: a tool works from reader input; bundled data is a convenience layer, never the
only way a tool works.

## What the audit found (September 29, 2026)

| Finding | Why it matters |
|---|---|
| Every `data/*/manifest.json` carries `fetchDate: 2026-09-27`, the date of the last weekly run, including datasets that were **not fetched**: `mpfs` holds 5 records, `icd10cm` 20, `hcpcs` 10, `ndc` 5, `drg` 8, all hand-written seeds. | The weekly refresh renews the date on unchanged seed data. Its pull requests are mostly date changes, which trains the maintainer to merge without reading. |
| Seed manifests say `offlineSeed: false`. | The flag is set from the build mode, not from whether the content was fetched. |
| The page prints *"Source: …, fetched 2026-09-27"* under table data (`lib/table.js`, `app.js`). | A reader is told data was fetched this week when it was written by hand. This is the one place the site currently overstates its data. |
| No manifest has `expiresOn`, `effectiveFrom` or `sourceEdition`. (Dated constants are fine: each module keeps its own table and reads it through `datedValue`, which fails closed.) | Datasets have no fail-closed path; dated constants do. |
| Most tools ship no table and take the value as input ([spec-v77](spec-v77.md) §2), so the seeds are mostly unused. | The risk today is mislabeling, not wrong answers. It becomes a risk of wrong answers the day a file tool joins a whole claims file against a table ([spec-v1602](spec-v1602.md), [spec-v1604](spec-v1604.md)). |

This spec fixes the labeling now, and sets the rules the file tools need before any of
them reads a bundled table.

## 1. Manifest contract, version 2

Every manifest gains these fields; `scripts/verify-integrity.mjs` fails on any manifest
missing one.

| Field | Meaning |
|---|---|
| `coverage` | `full` (the whole published file), `subset` (a stated, deliberate filter of it, with the filter written in `coverageNote`) or `sample` (hand-written examples) |
| `sourceEdition` | The publisher's own label: `CY2026 Q4`, `FY2027`, `RVU26D`, `2026-09-23 weekly` |
| `effectiveFrom` / `expiresOn` | When the edition takes effect, and when it lapses under the [spec-v1517](spec-v1517.md) rule (twice the cadence) |
| `fetchedAt` | Only set when a builder actually downloaded the source in this run; absent for samples |
| `contentChangedAt` | The last run in which the records' hash changed |
| `sourceSha256` | Hash of the downloaded source file (absent for samples) |
| `recordBounds` | `{ min, max }` expected records for a full edition, used by the bounds check (§3) |

`fetchDate` is removed. The page stamp (§4) reads the new fields.

**Samples stay, and say so.** A `sample` dataset is fine for examples and tests. It can't
be used by a tool to answer about a code the reader typed or a file they dropped: a code
missing from a sample is "not in the bundled sample," never "not a valid code." A test
enforces that no compute path reads a `sample` dataset outside `META.example` rendering.

## 2. The refresh stops lying

Changes to `scripts/build-data.mjs` and `.github/workflows/data-refresh.yml`:

1. **No silent fallback in CI.** When the workflow runs with network and a live builder
   fails to fetch or parse, the run keeps the previous data for that dataset and writes
   the failure at the top of the PR summary ([spec-v1517](spec-v1517.md)). It never
   writes the sample in its place.
2. **No date-only diffs.** A dataset whose records hash is unchanged keeps its manifest
   byte-identical. A week where nothing changed produces no pull request.
3. **Datasets without a live builder are `sample`**, and the summary lists them in one
   line (*"12 sample datasets, not fetched"*) so the backlog is visible every week.

## 3. Real builders, in the order the file tools need them

Each builder follows the same five steps, so adding one is routine:

1. **Discover.** CMS moves download links every release. The builder fetches the
   dataset's landing page and finds the newest link matching a pattern (for example
   `RVU\d{2}[A-D]\.zip` on the physician fee schedule page). The pattern and the page are
   the dataset's configuration; a page with no match is a failed fetch, not a guess.
2. **Fetch and hash.** Download, record `sourceSha256`. A new hash on an unchanged edition
   label is flagged in the summary (a publisher correction).
3. **Parse** to normalized records, dropping licensed columns (CPT descriptors, per
   [spec-v1501](spec-v1501.md) §6).
4. **Check.** Shape test; record count inside `recordBounds`; a change of more than 20%
   in record count from the previous edition goes to review (§5); and **canaries**, a few
   known values per dataset that must match (for example, the conversion factor printed in
   the final rule; a common E/M code's work RVU within a stated range).
5. **Write** shards and the manifest with the §1 fields.

| Order | Dataset | Needed by | Size (estimate, verify) |
|---|---|---|---|
| 1 | Physician fee schedule RVUs and GPCIs | `claims-pct-medicare`, `tic-rate-lookup` | ~10,000 codes, 100+ localities |
| 2 | OPPS Addendum B (APC and status indicators) | same | ~8,000 codes |
| 3 | MS-DRG relative weights (IPPS Table 5) | same | ~770 DRGs |
| 4 | NADAC weekly | `pharmacy-spread-check`, `nadac-margin` | ~30,000 NDC rows per week |
| 5 | MUEs; NCCI procedure-to-procedure edits | `itemized-bill-check` | MUE about 15,000 rows per setting, bundled; PTP about 4.5 million pairs behind an AMA click-through, so read from the reader's own download by default ([spec-v1621](spec-v1621.md) §3.4) |
| 6 | USPSTF A and B list | `preventive-owed` | ~100 rows ([spec-v1605](spec-v1605.md)) |
| 7 | CMS schemas (hospital price v3, Transparency in Coverage), CARIN and PAS profiles | the file checks | small; pinned versions |

The NCCI and MUE files are published by CMS and are public domain; the CPT codes inside
them are shipped as codes only, with no descriptors, as `ncci-ptp` and `mue-check` already
handle codes.

## 4. Freshness at run time

A new `datasetStatus(manifest, now)` in `lib/data.js` returns one of:

| Status | Rule | What a tool does |
|---|---|---|
| `current` | before `expiresOn` | answers; the stamp reads *"CMS physician fee schedule, RVU26D (effective Oct 1, 2026). Checked Sep 27, 2026."* |
| `due` | within 30 days past the publisher's next expected edition, but before `expiresOn` | answers, with an amber line: *"A newer edition is expected. This uses RVU26D."* |
| `expired` | past `expiresOn` | does **not** answer from the bundled data. It asks for the reader's own copy (§6) or the single value, in the [spec-v1501](spec-v1501.md) §2 wording |
| `sample` | `coverage: sample` | never used for a reader's input (§1) |

Every result that used a dataset shows its stamp, and the receipt records it
([spec-v1615](spec-v1615.md)). The old *"fetched …"* stamp is replaced everywhere.

## 5. Automation, and where a person stays in the loop

The goal is that the maintainer's weekly job is zero minutes when nothing unusual
happened.

- **Auto-merge when everything is inside its bounds.** When every builder succeeded, every
  canary matched, every count is inside `recordBounds` and within 20% of the last edition,
  and the full test suite passed inside the refresh job, the workflow merges its own pull
  request. Pull requests opened with the default `GITHUB_TOKEN` don't trigger other
  workflows, which is why the tests already run inside the refresh job; the merge step
  uses the same job's result. (Verify at build: branch protection and the token's
  permission to merge.)
- **Anything outside bounds waits for a person**, labeled `data-review` with the reason at
  the top: a failed canary, a count jump, a new source hash on the same edition, a
  builder failure.
- **A freshness issue that keeps itself current.** One pinned GitHub issue, rewritten by
  each run: every dataset, its coverage, edition, status and the date it expires. Anyone
  can see the state of the data without reading the repository.
- **CI blocks expired data in live tools.** A test lists every tool that reads a dataset
  (from the registry of [spec-v1611](spec-v1611.md) and the imports of `lib/data.js`) and
  fails the build when any of those datasets is `expired`, with the clock pinned to the
  build date. Expiry can't reach production unnoticed.
- **Page watches for dated constants** ([spec-v1517](spec-v1517.md) §2) are built in the
  same change if they aren't already, because they are the route-B half of the same job.

## 6. Bring your own reference file

When a bundled table is expired, or a reader wants a newer edition than the bundle, the
reader can drop the publisher's own file (the CMS RVU zip, the NCCI edit file, the NADAC
CSV) alongside their own file. The recognizer knows these as reference kinds
([spec-v1611](spec-v1611.md) §2, added in the same change), and the tool uses the
reader's copy for that run, stating its edition in the stamp and the receipt. This keeps
the [spec-v77](spec-v77.md) doctrine for the file tools, which can't ask for a value per
line: the reader can always supply the table itself, so no tool is ever blocked by our
refresh.

## Tests

- `verify-integrity` fails on a manifest missing any §1 field, and on a `sample` manifest
  with `fetchedAt`.
- A refresh run with the network blocked leaves every manifest byte-identical.
- A builder whose landing page lacks the link pattern fails that dataset and keeps the
  previous data.
- Canary failure, count out of bounds and a same-edition hash change each produce a
  `data-review` PR and no merge.
- With the clock past `expiresOn`, every tool reading that dataset asks instead of
  answering (the [spec-v1500](spec-v1500.md) negative test, applied to datasets).
- The page stamp shows edition and checked date; no view contains the string "fetched"
  for a `sample` dataset.
- A dropped RVU file of a newer edition is used for the run and named in the receipt.

## Build status

- **§6, first consumer, built October 9, 2026:** `claims-pct-medicare` takes the reader's own CMS OPPS Addendum B
  (`lib/opps-addendum-b.js`; the site does not bundle it, since CMS serves it behind the AMA click-through,
  [spec-v1621](spec-v1621.md) §3.4) and prices facility outpatient lines with status indicators S, T and V at
  the national rate. Read in the Medicare Claims Processing Manual, Pub. 100-04 ch. 4 (rev. 13799, May 28,
  2026): sec. 10.1.1 (T's multiple-procedure reduction), 10.2.3 (comprehensive APCs), 10.4 (N, Q1, Q2, Q3
  packaging) and 10.8 (60% of the rate is wage-adjusted). Every other status indicator is left out with its
  reason; the wage index, the second-T reduction and claim-level packaging are named as not applied. The
  file's title row is its edition, shown on the page and named in the receipt. **Not yet:** the other reference
  kind NADAC has no consumer yet (its bundled weekly data refreshes on its own). An Addendum B dropped on the home page opens this tool with
  the file in its Addendum B input.
- **§6, second consumer, built October 9, 2026:** `itemized-bill-check` takes the reader's own NCCI
  procedure-to-procedure edit files (`lib/ncci-ptp.js`): the text files or the zips CMS posts, streamed in the
  Worker, keeping only pairs whose two codes are both on the bill. Pairs on the same date with an edit active that
  day flag the column 2 line, worded by its modifier indicator (0: no modifier bypasses it; 1: an allowed modifier
  may; 9: skipped). Undated lines are checked only against edits still active, so the answer does not depend on
  today's date. The version comes from the member names and is named in the receipt. Inpatient bills are not
  pair-checked, and practitioner edits on a hospital bill are named as the wrong file.
- **§6, third consumer, built October 9, 2026:** `itemized-bill-check` takes the reader's own MUE table
  (`lib/mue-reference.js`: the CMS CSV or its zip) and uses it for that run instead of the bundled `data/mue`, named
  in the notes and the receipt by the effective date in its file name ("effective 2026-10-01, your copy"). A
  practitioner or DME table is refused for a hospital bill, with the reason.
- **§6, fourth consumer, built October 9, 2026 (this spec's test "a dropped RVU file of a newer edition is used for
  the run and named in the receipt"):** `claims-pct-medicare` takes the reader's own relative value file
  (`lib/rvu-reference.js`: CMS's RVU zip, from which the nonQPP PPRRVU file and the GPCIs are read, or a bare PPRRVU
  CSV, priced with the bundled GPCIs and saying so). Its single conversion factor and RVUs replace the bundle's for
  the run; the member name is the edition, shown in the notes and named in the receipt.

