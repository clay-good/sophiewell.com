# spec-v1517 — Automated refresh for the program's data

**Status:** Proposed, September 25, 2026. No new tools; this keeps the other 101 correct.
**Charter:** [spec-v1500](spec-v1500.md). **Contract:** [spec-v1501](spec-v1501.md) §2.

The goal is a program one person can maintain for decades. Two things make that
possible: every fetchable federal file is fetched by a machine, and every number that
can't be fetched is **watched** by a machine, so a human is told when to look. This
spec lists both. Each builder fits the existing weekly `data-refresh` workflow
(`scripts/build-data.mjs`, hash confirmation in `scripts/expected-hashes.json`, and a
pull request with a change summary).

## Route A: fetched files

Every row was fetched during research on September 25, 2026. The "trap" column is what
would silently break a naive builder, and each builder has a test for it.

| Dataset | Source and format | Cadence | Trap the builder must handle |
|---|---|---|---|
| `asp-payment-limits` | CMS ASP pricing files page; quarterly ZIP with a "section 508" CSV (latin-1, 8 preamble rows before the header) | quarterly, with mid-quarter revisions | File names vary between quarters, so scrape the page for links; never build the URL. Re-fetch on revision |
| `asp-ndc-hcpcs-crosswalk` | same page; quarterly ZIP | quarterly | Drop any CPT descriptor column |
| `nadac` | data.medicaid.gov DKAN API (JSON) | weekly | **A new dataset ID every year.** Resolve it by searching for "NADAC" each run. Ship only the latest rate per NDC, sharded like `data/ndc` |
| `mfp-negotiated-prices` | CMS negotiated-prices ZIP (CSV + XLSX, NDC-11 rows with effective and end dates, "Type of Update") | as updated (last September 21, 2026) | Rows are added, inflation-updated or deselected; keep effective-dated history, not just the latest |
| `poverty-guidelines` | ASPE poverty-guidelines JSON API, per year, region and household size | annual (January) | **Invalid requests silently return 2026, contiguous US, size 1.** Validate the echoed year, state and size. `income` is a string for sizes 1–8 and a number for 9 |
| `orange-book` | FDA Orange Book data ZIP (`products.txt`, tilde-delimited) | monthly | Tilde delimiter; keep TE_Code, RLD and RS |
| `purple-book` | FDA Purple Book monthly CSV | monthly | Month capitalization in the file name is inconsistent, so scrape the downloads page. A changes section precedes the full list; parse past it |
| `fda-ndc` | FDA NDC directory ZIP (already listed in `scripts/sources.md`) | weekly is enough | Existing dataset; extend only |
| `mcd-export` | CMS Medicare Coverage Database downloads (CSV with embedded HTML; about 185 MB for all data) | weekly (Thursday) | Ship only the article code tables and self-administered drug lists, sharded by jurisdiction; strip CPT descriptions; expand ICD-10 ranges at build, not in the browser |
| `hpt-schema` | GitHub `CMSgov/hospital-price-transparency` releases | as released | Pin to a tag; a new major version is a PR for a human, not an auto-merge |
| `davinci-pas` | HL7 package registry, Da Vinci PAS | pinned (2.2.1) | Bumped by hand; the builder only verifies the pinned package's hash |

**Size.** NADAC (over 1 million rows a year), the MCD tables, and the Orange and Purple
Books are loaded only by the tools that need them, after the first use, and cached by
the service worker. No tool's first paint waits on them. The existing corpus-tiering
and shard patterns apply.

## Route B: watched pages

A route-B number is hand-verified, but a machine tells the maintainer when it may have
changed. Two watchers:

### 1. The eCFR amendment watcher

Every CFR section a program tool cites is listed in its library module's citation
table. Each week, the refresh job asks the eCFR versions API for each section's latest
amendment date. A section amended after its ledger row's `lastVerified` date is listed
in the refresh PR:

> 42 CFR 423.137 was amended on 2027-02-03, after it was last verified (2026-09-25). Tools
> affected: `m3p-monthly-bill`.

This covers every section the program cites, with one API and no scraping. It works because eCFR
publishes amendment dates per section. The API needs gzip and rate-limit backoff.

### 2. The page watcher

For numbers that live only in prose or PDF (the Part D Rate Announcement, the Parts A
and B premium fact sheet, the IRS revenue procedures, SSA POMS, the hospice rule fact
sheets, the iPLEDGE and lenalidomide REMS pages), the refresh job fetches each page,
extracts its text (`pdftotext -layout` for PDFs), normalizes whitespace, hashes it, and
compares the result with the hash stored at the last verification. A change is listed
in the PR with the ledger rows that depend on that page.

**Expected yearly cycle** (so the maintainer knows when to look):

| Month | What publishes | Tools |
|---|---|---|
| January | poverty guidelines (route A) | `fpl-percent`, `fap-discount`, `extra-help-msp-screen` |
| Spring | Part D Rate Announcement for next year (April) | `partd-year-cost`, `m3p-monthly-bill` |
| Spring | HSA limits (May); ACA payment notice | `premium-tax-credit` |
| Summer | Part D base premium (late July); hospice rule (August); IRS applicable percentage (July–August) | `partd-late-penalty`, `hospice-aggregate-cap`, `premium-tax-credit`, `employer-coverage-affordability` |
| Fall | Extra Help copays (fall memo); amounts in controversy (September–December) | `partd-year-cost`, `partd-appeal-ladder`, `appeal-deadline` |
| November | Parts A and B premiums, deductibles, IRMAA | `irmaa`, `partb-late-penalty`, `parta-premium`, `medicare-cost-share` |
| Quarterly | ASP files, crosswalk | `asp-payment`, `part-b-drug-coinsurance`, `ndc-hcpcs-units` |

## Route C: things that are deliberately not automated

| Source | Why not |
|---|---|
| HRSA 340B OPAIS reports | No stable URL or API, and hrsa.gov refuses non-browser clients. The entity supplies its own registration details |
| Payer formularies, medical policies, contract rates, AWP and WAC | Licensed, proprietary or unpublished; always reader input |
| NCPDP reject codes, X12 code descriptions | Licensed ([spec-v1501](spec-v1501.md) §6) |
| State-specific thresholds (Medicaid windows, state MSP limits, state 340B identifiers) | A fifty-state table breaks the matrix rule; reader input |

## Failure behavior

- A builder that can't fetch, or whose file fails its shape check, **keeps the previous
  data** and writes the failure at the top of the PR summary. It never ships a partial
  file.
- Every route-A dataset's manifest carries `fetchedAt`, `sha256`, `effectiveFrom` and
  `expiresOn`. `expiresOn` defaults to twice the cadence: a weekly file expires after
  14 days without a successful refresh, and a quarterly file after 2 quarters. Past
  that, the tools ask for the value ([spec-v1501](spec-v1501.md) §2).
- A test runs every tool with the clock set past every dataset's expiry and asserts
  that none answers from expired data.

## Acceptance

- Each builder has a fixture test for its trap.
- The watcher lists are generated from the tools' citation tables, not maintained by
  hand. A tool that cites a CFR section the watcher doesn't know fails lint.
- `scripts/sources.md` and `docs/data-sources.md` gain a row per new dataset in the same
  change.
