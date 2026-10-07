# spec-v1605 — Data, refresh and open exports for the public-utility program

**Status:** Proposed, September 29, 2026. Specs only. Adds no tools.
**Charter:** [spec-v1600](spec-v1600.md). **Extends:** [spec-v1517](spec-v1517.md) (refresh
builders) and the [spec-v1501](spec-v1501.md) §2 data contract.

## The datasets

| Dataset | Used by | Route | Refresh and its trap |
|---|---|---|---|
| USPSTF A and B recommendations (population, grade, issue date, verbatim text, status) | `preventive-owed`, `preventive-cost-share-check`, `carin-eob-reader` | A (Prevention TaskForce API) or B (list page), per [spec-v1601](spec-v1601.md) | Weekly. Trap: a recommendation that changed grade keeps its topic name, so the key is the topic plus its issue date, and a grade change is its own row with its own one-year clock. |
| Preventive code map (the HCPCS and ICD-10 codes that identify each USPSTF service on a claim) | `carin-eob-reader` | B | Yearly, with the code-set updates. Codes only. Trap: many services share codes with diagnostic use, so a match is a flag to check, never a finding. |
| IRS HSA safe-harbor lists (Notices 2004-23, 2019-45) and the direct primary care fee limits | `hsa-predeductible-check`, `dpc-hsa-check` | B | Page watch on irs.gov. Trap: the fee limit indexes yearly and lapses on January 1. |
| CMS-0057-F prior-authorization metrics, by payer and market | `pa-metrics-compare` | B, curated yearly | Payers post the reports on their own sites, in their own formats, by March 31. One curation pass a year (April–May): each row cites the payer's URL and the date read, and carries the payer's figures as posted. Trap: a payer that reports a rate without the counts is carried as a rate, never back-computed. |
| WISeR code list, states and postponements | `medicare-ffs-pa-required` | B | Page watch on the CMS model page and the Federal Register. |
| Transparency in Coverage schemas | `tic-file-check`, `tic-rate-lookup` | A (CMSgov GitHub releases) | Watch releases; pin the version; gate the next. |
| CARIN Blue Button profiles | `carin-eob-reader` | A (HL7 package registry) | Pin a published version. |

Each B dataset gets a row in `pa-staleness-ledger.json` in the same change that adds it,
with the source URL and a `validThrough` date, so `check-pa-staleness` guards it.

## The one human task each year

The prior-authorization metrics can't be fetched: there is no central file, and each
payer posts its own page or PDF. The maintainer's yearly job for this program is one
curation pass after March 31: read each included payer's report and enter its figures.
The table starts with the largest payers in each market (the ones KFF's analysis covered)
and grows only by adding rows with sources. A payer that doesn't post is recorded as
"not found on [date]," with the URL checked. That row is itself information.

If CMS ever publishes the metrics centrally, the dataset moves to route A and the curation
pass ends.

## Open exports

A dataset curated for a tool here is useful beyond it. Every dataset this program adds is
also published as a versioned download from the site, under the same terms as its sources
(US government works; CC-BY-4.0 for our own curation, matching the sibling research
datasets), with:

- one row per fact, each with its source URL and the date it was read;
- a changelog between versions;
- no data about any person, ever.

A researcher, journalist, state regulator or another free tool can use the prior-
authorization metrics table without scraping 100 payer sites. That serves the charter
more than any single tool does.

## Agents

Every tool in this program is exposed through the MCP server in the same change
([spec-v627](spec-v627.md)), with the file-reading tools taking the file path on the
reader's own machine. An agent helping a patient with a bill gets the same cited,
deterministic answer the page gives, and the file never leaves the reader's machine.

## Tests

- Each dataset: a shape test, a staleness-ledger row, and the negative test from
  [spec-v1500](spec-v1500.md) (clock past expiry, tool asks instead of answering).
- USPSTF: a grade change produces two rows with separate clocks.
- Metrics: a row without a source URL fails the build.
- Exports: the published download is byte-identical to the bundled dataset of the same
  version.

## Build status

- **Built:** the USPSTF dataset ([spec-v1601](spec-v1601.md), `data/uspstf`, keyed by topic and a hash of
  the description, so a reworded or regraded row is a new key).
- **Built October 3, 2026:** the Transparency in Coverage schema watch. `lib/tic-schemas.js` carries
  `Source tag: CMSgov/price-transparency-guide tag v2.2.1`, and `scripts/data/watch-upstream.mjs` lists any
  newer version tag in the weekly refresh pull request: "gate the next" is a person updating the module,
  its tests and the tag line together. CARIN Blue Button is pinned at package 2.2.0 by a `Source package:` line in
  `lib/carin-eob-reader.js`, compared with the FHIR package registry since October 6, 2026
  ([spec-v1621](spec-v1621.md#build-status) §3.7).
- **Built October 3, 2026:** the WISeR watch. `medicare-ffs-pa-required` was built September 30
  ([spec-v1502](spec-v1502.md#build-status)), and its two source pages (the WISeR model page and the
  prior-authorization initiatives page) are now `WATCHED_SOURCES` in the module. The route-B page watcher
  fingerprints them weekly, with baselines recorded the same day.
- **Built October 7, 2026:** the IRS HSA safe-harbor watch. `lib/hsa-predeductible-check.js` lists Notices
  2004-23, 2013-57, 2018-12 and 2019-45 and Publication 969 as `WATCHED_SOURCES`, with baselines recorded that
  day. The notices are static, so a changed hash means a reissue; Publication 969 is revised each tax year and
  is where a new or withdrawn safe harbor shows first. The indexed DPC fee limit in `dpc-hsa-check` (Notice
  2026-5) was already watched.
- **Built October 7, 2026:** the preventive code map, `lib/preventive-codes.js`, read in `carin-eob-reader`'s flags.
  Read that day from the CMS chart MLN006559 (July 2026, one page per service): 84 HCPCS and CPT codes in 20
  services, each with its 147.130 basis (USPSTF, ACIP or HRSA). **Differed from the spec:** only codes that are
  preventive by their own descriptor are kept. Codes billed as often for diagnosis (lipid panel, glucose and A1c,
  bone density, hepatitis B serologies, the STI tests), the blood-based colorectal tests (not a USPSTF strategy)
  and Medicare-only benefits are left out and named in the module, so a routine A1c is never flagged. The chart
  gives ICD-10 codes only through each NCD's coding file, so none are carried. It is a dated route-B constant
  (`validThrough` September 30, 2027; past it the flag says the list is due for review), with the
  `cms-preventive-services-chart` staleness-ledger row and the chart's `services.js` version line page-watched.
- **Built October 7, 2026:** the open exports, at `/open-data/` (`scripts/build-open-data.mjs`). The USPSTF
  dataset is offered as its bundled manifest, shard and `changelog.json` (the refresh runner appends an entry
  for any refresh that adds, removes or changes a record, keyed by `changelogKey`), so the download is the
  bundled dataset byte for byte; the preventive code map is written from its constant to
  `preventive-codes.json`, one row per code with its source URL and read date. **Differed from the spec:** a
  USPSTF row carries its own recommendation URL, and its read date is the manifest's `fetchedAt` (one read
  for the whole list), not a per-row field. Older versions are not served; the changelog and the git history
  are the record between them.
- **Built October 7, 2026:** the curated PA metrics table, `data/pa-metrics/` from
  `scripts/data/pa-metrics.json`: the 149 calendar-2025 Medicare Advantage contract reports of UnitedHealthcare
  (63, one PDF), Aetna (42, one PDF), Humana (32 PDFs) and Kaiser Permanente (12 rows from 9 regional PDFs; two
  contracts are posted in a Northern and a Southern California part), each with its URL and read date, and on
  `/open-data/`. Counts are carried where posted (all but Aetna), and every stated rate is checked against them
  at build time (all reproduce). **Differed from the spec:**
  - The market figure is the median and the **middle half** (25th to 75th percentile), not the full range: a
    contract with three requests posts 0% or 100%, so the extremes describe no market.
  - Every report counts once, since most payers post no request counts to weight by.
  - Decision times are kept in the rows but not summarized. Humana and Aetna post whole days ("0 day(s)" is under
    a day), Kaiser days and hours, and UnitedHealthcare's mean column (whole days) is smaller than its median,
    which cannot be, so its times are not carried at all.
  - A rate posted over zero requests (Kaiser's "0.00%" for 0 of 0) is stored as no rate.
  - UnitedHealthcare posts its appeal rate without the number of appeals and reports no extended reviews.
  - **Second pass, the same day:** Medicaid managed care, CHIP and Marketplace reports from the same payers,
    228 rows in all: UnitedHealthcare's Medicaid file (45 plans) and Marketplace file (18 states; its last pages
    carry a DRAFT watermark, noted on each row), Kaiser's state-level Medicaid and CHIP sections and its Hawaii
    Marketplace issuer (7), and Humana's 9 state Medicaid reports (two layouts). A plan is filed under the program
    its payer filed it in, except where its name says CHIP (`chip-mco`), a Medicare-Medicaid plan (`mmp`) or New
    York's Essential Plan (`bhp`).
  - The extended-review rate is checked per row but not summarized: Kaiser divides by the requests whose review
    was extended, Humana's Virginia report by every request.
  - A program and year with reports from fewer than **three payers** gets no market summary (two payers describe
    those payers): the Marketplace rows (UnitedHealthcare and Kaiser only) are in the table, and the tool says
    why it does not compare them.
  - **Not in this edition:** Elevance and Centene (Wellcare, Ambetter) reports (per-contract PDFs with no landing
    page, or refusing scripted requests), Aetna's Medicaid plans, Molina, Oscar, HCSC, Florida Blue, BCBS North
    Carolina and L.A. Care. CareSource and AmeriHealth Caritas Medicaid reports were not found on October 7, 2026.
