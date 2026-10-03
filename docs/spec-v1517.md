# spec-v1517 — Automated refresh for the program's data

**Status:** Proposed, September 25, 2026. No new tools; this keeps the other 101 correct. In progress: see [build status](#build-status).
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

## Build status

Route-A builders live in `scripts/data/builders/` and run in the weekly refresh (`node scripts/data/run.mjs`);
each has a fixture test and a row in `docs/data-sources.md`.

| Dataset | Status |
|---|---|
| `mpfs`, `drg`, `mue`, `nadac` | Built September 29, 2026 ([spec-v1621](spec-v1621.md#build-status)) |
| `asp`, `asp-ndc` | Built October 1, 2026 |
| `mcd-articles` | Built October 1, 2026 |
| `orange-book`, `purple-book` | Built October 3, 2026 for `substitution-check`. The Orange Book edition is the `products.txt` date inside the ZIP (the landing page's "content current as of" lagged it by weeks), so `zip.mjs` now reads each member's date; the Purple Book's newest month is found on the downloads page and its full listing is the table after the last header row. Both expire two months after their edition. |
| `pas-profiles` | Built October 3, 2026 for `pas-bundle-check`: the Da Vinci PAS package pinned at 2.2.1 from packages.fhir.org, expiring two years after the package date so the pin is reviewed. |
| Route B watcher 1, the eCFR amendment watcher | Built October 3, 2026: `scripts/data/watch-ecfr.mjs`, run in the weekly refresh and appended to its pull request. **Differed from the spec:** there is no per-module citation table, so it reads every tool's META citation text and eCFR link (79 tools, 63 sections) and compares each section's latest amendment date with the tool's `citationAccessed`; tools with no date are listed apart. Its first run named 42 CFR 412.622 and 418.309, both amended October 1, 2026, after `irf-compliance-clock` and `hospice-aggregate-cap` were verified. |
| Route B watcher 2, the page watcher | Built October 3, 2026: `scripts/data/watch-pages.mjs` finds the source pages of every route-B dated value in `lib/` (12 pages), fingerprints each (an HTML page's `<main>` text without scripts and markup; a PDF by its bytes; both were stable across fetches) and compares it with `scripts/data/page-hashes.json`, appended to the weekly refresh pull request. The baseline was recorded October 3, 2026 as the watcher's own reading, not as a re-verification of the values; after re-reading a changed page the maintainer runs `--record` with its URL. |
| `poverty-guidelines` | Built October 3, 2026. The trap was confirmed live: a request for 2027 answered `{"year":"2026","state":"US","household_size":"1"}`. Every answer's echoed year, state and size is checked, and the newest year is the first of next year and this year that echoes back. Each year and region is read at sizes 1, 2, 8 and 9 and must be a base plus a fixed step. **Differed from the spec:** the income calculators read their figures synchronously, so besides the shard the run writes `data/poverty-guidelines/guidelines.js`. `lib/income-screens-v1506.js` imports it (route A now), and the refresh pull request, which carries `data/**`, delivers a new year to all four calculators. The first run matched the hand-entered 2025 and 2026 figures exactly. |
| `mfp-negotiated-prices` | Built October 3, 2026. The ZIP is found on the CMS page by its link name, and the edition is the date in the CSV's file name. Every row is kept, including NDCs dropped before their price took effect (end date before effective date); those add no period. As for the poverty guidelines, the run also writes `data/mfp-negotiated-prices/drugs.js`, the per-drug periods merged where the price is the same, good through December 31 of the newest priced year. `lib/mfp-prices-v1506.js` imports it, title-casing the file's names, with one override (NovoLog). The first run reproduced the hand-entered table of all 40 drugs exactly. Lookup by NDC and the per-unit prices are in the shard and not yet on screen. |
| The rest of the route-A list (`fda-ndc`, `hpt-schema`) | Open |
