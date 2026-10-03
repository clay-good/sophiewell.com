# spec-v1621 — Build: the data pipeline that actually fetches

**Status:** Build spec, September 29, 2026. Implements [spec-v1614](spec-v1614.md) §2, §3,
§5 and §6, and completes [spec-v1517](spec-v1517.md). **Plan:** [spec-v1620](spec-v1620.md),
milestone M2. **Depends on:** M1 ([spec-v1622](spec-v1622.md)), which gives every dataset
its v2 manifest.

Every source fact below was checked against cms.gov on September 29, 2026 by downloading
the files. Anything not verified that way is marked **(verify)**.

## 1. Where it runs

GitHub Actions, weekly, as today. The job writes plain JSON into `data/`, commits it, and
Cloudflare Workers Builds deploys `main` as static assets. Nothing fetches at run time,
and nothing is added to Cloudflare beyond more static files.

**Budget.** Cloudflare Workers static assets allow 20,000 files per version on the free
plan and 25 MiB per file. The site ships 2,566 files today. The pipeline enforces a
**data file budget of 6,000 files** and **20 MiB per file** in `verify-integrity`, and the
summary prints the totals every run.

## 2. Module layout

`scripts/build-data.mjs` keeps its role as the entry point and its curated datasets. Live
builders move to their own files so each can be tested alone.

| File | Holds |
|---|---|
| `scripts/data/http.mjs` | `get(url)` over Node 22 `fetch`, with a fixed user agent naming the project and repository, 3 retries with backoff, a 10-minute timeout for large files, and `If-None-Match`/`If-Modified-Since` from the last run's recorded `etag`/`last-modified` so an unchanged file costs one small request |
| `scripts/data/discover.mjs` | `findLinks(html, pattern)` matching `href` in single or double quotes; `newest(links, compareFn)`; `unwrapLicenseLink(href)` extracting `file=` from `/license/ama?file=` links (used only where §4 allows) |
| `scripts/data/zip.mjs` | a zero-dependency zip reader over `node:zlib` `inflateRawSync`: central directory, member list, extract by name or pattern (member names vary in case and date stamps) |
| `scripts/data/text.mjs` | `decode(bytes, 'utf8' \| 'latin1')`, a CSV parser that handles quoted multi-line cells and CRLF, a TSV splitter, `skipPreamble(rows, predicate)`, money parsing (`$88.91 ` → 8891 cents; `.` → null) |
| `scripts/data/check.mjs` | shape checks, `recordBounds`, the 20% change rule, canary evaluation; returns `{ ok, problems[] }` |
| `scripts/data/builders/<id>.mjs` | one builder per live dataset, exporting `{ id, cadence, discover(), fetch(), parse(), canaries, recordBounds, shardKey }` |
| `scripts/data/run.mjs` | runs builders, writes shards and v2 manifests (write-if-changed from [spec-v1622](spec-v1622.md) Step 2), and writes `data-refresh-summary.json` for the workflow |

Zero runtime dependencies stays true: all of the above is Node built-ins.

## 3. The datasets

### 3.1 Physician fee schedule (`mpfs`, `gpci`)

- **Discover:** landing page
  `https://www.cms.gov/medicare/payment/fee-schedules/physician/pfs-relative-value-files`
  → release pages matching `/rvu(\d{2})([a-d])(r\d?)?(-\d)?` (corrections appear as
  `ar`, `ar1`) → on the release page, the zip matching `/files/zip/rvu\d{2}[a-d][^"']*\.zip`.
  Newest = highest year, then letter, then correction suffix.
- **Current:** RVU26D, "October 2026 release," updated August 26, 2026,
  `rvu26d-updated-08-26-2026.zip` (6.2 MB; 19 members).
- **Parse:** use the CSV members, not the fixed-width TXT. `PPRRVU<year>_<Mon>_nonQPP.csv`
  (all codes, about 19,450 rows) is the default table; `..._QPP.csv` (about 11,980 rows)
  is kept as a second column set for qualifying APM participants, since 2026 has two
  conversion factors. The PPRRVU CSV has 9 preamble lines and a 4-row stacked header, so
  columns are **mapped by position** (32 columns), and the mapping is asserted against the
  last header row. `GPCI<year>.csv`: 2 preamble lines, header `Medicare Administrative
  Contractor (MAC),State,Locality Number,Locality Name,<year> PW GPCI (with 1.0
  Floor)***,<year> PE GPCI,<year> MP GPCI`, footnote rows after the data (stop at the first
  row whose locality number is blank). About 112 localities.
- **Licensing:** the files carry AMA CPT short descriptors. The `DESCRIPTION` column is
  dropped at parse; codes, modifiers, RVUs, indicators and the conversion factor are kept.
  There is no click-through on these files.
- **Canaries (RVU26D):** conversion factor 33.4009 (nonQPP) and 33.5675 (QPP); `99213`
  work RVU 1.30, non-facility total 2.85, facility total 1.72; `99214` work RVU 1.92.
  Canaries are per edition. A new edition with no canaries recorded yet is published to a
  `data-review` pull request, never auto-merged; a person adds its canaries from the
  release PDF (a two-minute read, four times a year) and merges. Stable cross-edition
  checks (the conversion factor is between 30 and 40; `99213` work RVU between 1.0 and 1.6)
  run on every edition.
- **Bounds:** 15,000–25,000 rows (nonQPP); 100–130 localities.
- **Cadence:** quarterly (January, April, July, October), posted about five weeks ahead.
  `nextExpected`: the first day of the next quarter minus 35 days.

### 3.2 IPPS MS-DRG weights (`drg`)

- **Discover:** `fy-(\d{4})-ipps-final-rule-home-page` on the acute inpatient PPS page →
  `/files/zip/fy\d{4}-ipps-fr-table-5\.zip`. Newest fiscal year whose effective date
  (October 1) has passed; the next year's table is stored as `upcoming` once published.
- **Current:** FY2027 (CMS-1849-F, effective October 1, 2026), with correction notice
  CN3 published September 29, 2026: `fy2027-ipps-fr-table-5.zip`.
- **Parse:** prefer the member whose name contains `-CN` (the corrected table) over `-FR`.
  Tab-delimited, Windows-1252, CRLF; a quoted title spanning two lines, then the header.
  Column names carry the year and trailing spaces, so **map by position**: MS-DRG,
  post-acute flag, special-pay flag, MDC, type, title, weight before cap, weight with
  10% cap, geometric mean LOS, arithmetic mean LOS. DRGs 998 and 999 have no weight and
  are kept with `weight: null`.
- **Canaries:** FY2027 CN: DRG 470 = 1.9563, 871 = 1.932, 291 = 1.2685. FY2026: 1.9289,
  1.9425, 1.2838.
- **Bounds:** 740–800 rows. **Cadence:** annual; `nextExpected` August 1.

### 3.3 Medically unlikely edits (`mue`)

- **Discover:** `https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits-mues`
  → direct `/files/zip/medicare-ncci-<year>-q<n>-{practitioner-services|facility-outpatient-hospital-services|dme-supplier-services}-mue-table.zip`
  links (no license wrapper on this page).
- **Parse:** `MCR_MUE_<Service>_Eff_<MM-DD-YYYY>.csv`; row 1 is a quoted multi-line AMA
  notice; the header has an embedded newline (`HCPCS/\nCPT Code`) and a service-specific
  column 2 name, so map by position: code, MUE value, adjudication indicator, rationale.
  Codes only; no descriptors in the file.
- **Canaries (Q4 2026):** `99213` practitioner = 2; `71046` practitioner = 2, outpatient
  hospital = 3.
- **Bounds:** practitioner and hospital 13,000–18,000 each; DME 2,500–4,000.
  **Cadence:** quarterly, effective the first of January, April, July, October.

### 3.4 NCCI procedure-to-procedure edits and OPPS Addendum B: license gate

Both are public CMS files, and both are served behind the AMA "End User Point and Click
Agreement" (`/license/ama?file=`), because they contain CPT codes (and Addendum B also
contains CPT short descriptors). A plain request to the underlying `/files/zip/` URL
succeeds without the agreement, but **the pipeline does not do that by default.**
Automating past a license agreement is the maintainer's decision, not the build's.

| Setting | Behavior |
|---|---|
| `LICENSE_GATED_SOURCES=off` (default) | The builder does not fetch. The dataset is absent, and the tools that need it use the reader's own copy ([spec-v1614](spec-v1614.md) §6): the reader downloads the file from cms.gov, accepting the agreement themselves, and drops it with their bill or claims. |
| `LICENSE_GATED_SOURCES=on` | Set only after the maintainer records in `docs/data-sources.md` that they reviewed and accepted the agreement's terms for this use. The builder then fetches via `unwrapLicenseLink`. |

Facts for either path (so the in-browser reader and the builder parse the same way):

- **PTP:** `https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-procedure-procedure-ptp-edits`;
  links match `ptp-edits-cci(pra|oph)-v(\d+)r(\d+)-f\d\.zip` (the `2026q4`/`2026-q4`
  spelling varies; use the version number). Four zips per setting. Members
  `cci{pra|oph}-v<ver>r<rev>-f<n>.{TXT|txt}`: tab-delimited, CRLF, 6 preamble rows, then
  rows of column 1, column 2, "in existence" flag, effective date (YYYYMMDD), deletion
  date (`*` = active), modifier indicator, rationale. **Deleted edits are included**
  (practitioner f1: 444,174 active, 230,983 deleted); keep only rows active on the date of
  service. The page's link text states each file's record count ("675,157 Records"), a
  built-in canary. Size: practitioner 2,637,645 records, hospital 1,868,882; about 50 MB of
  text per file.
- **Browser path:** `itemized-bill-check` streams the reader's PTP zip members through
  `DecompressionStream`, keeping only rows whose column 1 and column 2 are both on the
  bill. Memory stays at the size of the bill's pairs, not the file.
- **Addendum B:** landing page
  `https://www.cms.gov/medicare/payment/prospective-payment-systems/hospital-outpatient-pps/quarterly-addenda-updates`;
  release pages are found by link text `(January|April|July|October) 20\d\d` with an
  `addendum-b` slug, and the zip name comes from the `file=` parameter (names vary by
  quarter). Use the CSV member (`508 Version .../...csv`), decode as Latin-1, 6 preamble
  rows, header beginning `HCPCS Code,Short Descriptor,SI,APC,Relative Weight,Payment
  Rate`; drop `Short Descriptor`. About 19,150 rows. Canaries (July 2026): `G0463` SI J2,
  APC 5012, weight 1.4879, $136.02; `71046` APC 5521, weight 0.9726, $88.91.

**Decision needed from the maintainer:** whether to turn `LICENSE_GATED_SOURCES` on. Until
then, M6's `claims-pct-medicare` reprices outpatient lines only when the reader supplies
Addendum B, and says so on the page.

### 3.5 NADAC (`nadac`)

- **Discover:** each year is a new dataset on data.medicaid.gov. Query
  `https://data.medicaid.gov/api/1/metastore/schemas/dataset/items` and select the item
  whose title is exactly `NADAC (National Average Drug Acquisition Cost) <year>` (2026:
  `fbb83258-11c7-47f5-8b18-5f8e79f7e704`). In the first weeks of January, when the new
  year's dataset may not exist yet, fall back to the prior year's.
- **Fetch:** only the latest week. First ask for the newest `as_of_date`:
  `/api/1/datastore/query/<id>/0?limit=1&sorts[0][property]=as_of_date&sorts[0][order]=desc`,
  then page that week with `conditions[0][property]=as_of_date&conditions[0][value]=<date>&conditions[0][operator]==`
  at `limit=5000` (8,000 works, 10,000 fails; 5,000 leaves margin) with `count=true` to know
  the total. Never hardcode the weekly CSV URL; it changes every week.
- **Parse:** API keys `ndc` (11-digit string; keep leading zeros), `ndc_description`,
  `nadac_per_unit`, `effective_date`, `pricing_unit`, `pharmacy_type_indicator`, `otc`,
  `explanation_code`, `classification_for_rate_setting`,
  `corresponding_generic_drug_nadac_per_unit`, `corresponding_generic_drug_effective_date`,
  `as_of_date`. The API gives ISO dates. `effective_date` is when that NDC's rate took
  effect and is often earlier than `as_of_date`; tools use `effective_date` for "the rate on
  the fill date" only within the bundled week, and say so.
- **Size and shards:** about 30,000 rows a week; shard by the first 5 digits of the NDC
  (the labeler), which keeps files small and loads only the labelers on a claims file.
- **Canaries:** row count equals the API's `count`; every `ndc` is 11 digits; every
  `nadac_per_unit` is positive.
- **Bounds:** 25,000–40,000. **Cadence:** weekly (Wednesday `as_of_date`, posted about a
  day earlier); `expiresOn` 14 days after `as_of_date`. Public domain.

### 3.6 USPSTF A and B recommendations (`uspstf`)

The Prevention TaskForce API (`https://data.uspreventiveservicestaskforce.org/api/json`)
needs an approved key and returns HTTP 202 with a warning without one. The build doesn't
depend on it:

- **Default source (no key):** the public "USPSTF A and B Recommendations" page,
  `https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations`,
  one HTML table of 54 rows (September 29, 2026): Topic (linked to
  `/uspstf/recommendation/<alias>`, population after the last colon), Description, Grade,
  Release Date of Current Recommendation (for example "June 2023", sometimes with `*`).
  The builder parses the table and stores Description verbatim, as the USPSTF terms
  require ("reproduce the text verbatim, without modification, and cite the source").
- **Structured age, sex and risk.** The table doesn't structure them. They are curated
  once per recommendation into `data/uspstf/populations.json` (alias → `{ sexes,
  ageMin, ageMax, pregnant, risks[] }`), a subset dataset with `curatedAt`. When the
  builder sees an alias or release date it has no population row for, the pull request
  goes to review with the new recommendation named. That is the only human step, and it
  happens only when the USPSTF issues or updates a recommendation.
- **Optional key.** If the maintainer obtains a key (form at `apps/api_request.jsp` or
  uspstfpda@ahrq.gov), it is stored as the repository secret `USPSTF_API_KEY` and the
  builder cross-checks grades and age ranges against `specificRecommendations[]`
  (`grade`, `sex`, `ageRange`, `risk`). The parameter name for the key is not documented
  (verify on approval). `/api/lastupdated` is the cheap change check.
- **Canaries:** the table has between 40 and 80 rows; every grade is A or B; every release
  date parses to a month and year.
- **Terms:** the copyright notice bars reproducing the work for a fee or in a
  profit-making venture without permission. The site is free and noncommercial, and each
  displayed recommendation links to its source page.

### 3.7 Schemas and FHIR profiles (`schemas-hpt`, `schemas-tic`, `fhir-carin-bb`, `fhir-pas`, `fhir-us-core`)

Pinned versions, watched for new ones. A new version never replaces the pinned one
automatically: it opens a review pull request, because a schema change changes which
files pass.

| Dataset | Source | Current | Watch |
|---|---|---|---|
| Hospital price file schema | `CMSgov/hospital-price-transparency`, `documentation/JSON/schemas/V3.0.0_Hospital_price_transparency_schema.json` (draft-07) | V3.0.0 (effective January 1, 2026; enforced from April 1, 2026) | the repository has no releases or tags: watch the `documentation/JSON/schemas/` directory listing for a new `V<semver>_` file |
| Transparency in Coverage schemas | `CMSgov/price-transparency-guide`, `schemas/{in-network-rates,allowed-amounts,table-of-contents}/*.json` | 2.2.1 (`VERSION.md`) | tags (releases stop at v2.0.0), or `VERSION.md` |
| CARIN Blue Button | `https://packages.fhir.org/hl7.fhir.us.carin-bb/<version>` (`.tgz`, GET; HEAD returns 404) | 2.2.0 | `https://packages.fhir.org/hl7.fhir.us.carin-bb` `dist-tags.latest` |
| Da Vinci PAS | `hl7.fhir.us.davinci-pas` | 2.2.1 | same |
| US Core | `hl7.fhir.us.core` | 9.0.0 | same |

All five are public domain or CC0 (read from each package's `package.json`). The build
extracts only the StructureDefinitions and ValueSets the checkers use, and strips X12,
CPT and NUBC value set contents ([spec-v1501](spec-v1501.md) §6). The tarballs are
unpacked with `node:zlib` `gunzipSync` and a minimal tar reader in `scripts/data/zip.mjs`.

### 3.8 Curated yearly and page-watched datasets

`pa-metrics`, `wiser-codes`, `irs-hsa`, `concepts` and `uspstf/populations` are curated
(`coverage: 'subset'`, `curatedAt`), with page watches on their sources
([spec-v1517](spec-v1517.md) §2). Each has a stated review cadence in the freshness issue.

## 4. Change detection and publishing

1. `run.mjs` records each source's `etag`, `last-modified`, `sourceSha256` and edition in
   `scripts/expected-hashes.json` (today an empty object). A 304 response or the same hash
   means no change and no write.
2. A new hash on the **same** edition label is a publisher correction: parse, check, and
   send to review (never auto-merge), noting "CMS re-posted RVU26D."
3. `data-refresh-summary.json` lists per dataset: status (unchanged, updated, failed,
   gated), edition before and after, record counts, canary results, and problems.

## 5. The workflow

`.github/workflows/data-refresh.yml` keeps its two-job shape (refresh builds and tests
with read-only permissions; publish opens the pull request). Changes:

- **Refresh job:** `node scripts/data/run.mjs` instead of `build-data.mjs` for live
  datasets (curated ones still come from `build-data.mjs`), then the existing integrity,
  lint, unit and a11y steps, then `node scripts/report-freshness.mjs`
  ([spec-v1622](spec-v1622.md) Step 5).
- **Publish job, auto-merge.** `main` has no branch protection and the repository has
  auto-merge disabled, so the publish job merges its own pull request with
  `gh pr merge --squash --delete-branch` (the job already has `contents: write` and
  `pull-requests: write`) when, and only when, the summary says every dataset is
  unchanged or updated with all canaries passing, all counts inside bounds and within 20%
  of the previous edition, no same-edition hash change, and no failures. Otherwise it
  labels the pull request `data-review` and puts the problems first in its body.
- **The freshness issue.** A third job, `freshness`, with `issues: write`, rewrites the
  body of one pinned issue titled "Data freshness" from `report-freshness.mjs`: every
  dataset and dated constant with coverage, edition, status and expiry, the gated
  sources, and the last run's result. It opens the issue if it doesn't exist.
- **Failure noise.** If the refresh job itself fails (not a dataset, the job), GitHub's
  standard failed-workflow email reaches the maintainer. No extra alerting service.

## 6. Tests

- Each builder has a fixture test: a trimmed copy of the real file (first 50 rows plus
  the preamble, committed under `test/fixtures/data-sources/`, CPT descriptors removed)
  parsed to the expected records, and the canary check run on it.
- `discover.mjs` is tested against saved copies of each landing page's HTML, including
  single-quoted `href`s and the `rvu25d-0` and `rvu24ar` variants.
- The zip reader is tested against a real CMS zip member layout (stored and deflate).
- The workflow logic is a pure function of the summary (`decidePublish(summary)` in
  `scripts/data/check.mjs`) with a test per outcome: merge; review for canary failure,
  count jump, same-edition hash, builder failure.
- An offline run (`SOPHIEWELL_OFFLINE=1`) touches no live dataset and leaves `git status`
  clean.

## Build status

**September 29, 2026.** Modules, four live datasets and the workflow are built; USPSTF and
the schema/FHIR watches are open.

| Part | Status | Differs from the spec |
|---|---|---|
| §2 modules | Built: `http`, `discover`, `zip` (zip and tar), `text`, `check` (with `decidePublish`), `run`, `summarize`. Verify-integrity enforces 6,000 data files and 20 MiB a file. | An edition can span several files (`found.parts`: three MUE settings; this year's and next year's DRG table; NADAC's pages). All parts are fetched and hashed as one, so a correction to any part is a change; only single-file sources use conditional requests. Canary functions receive `(records, ancillary)`, so a conversion factor in an ancillary file can be a canary. `canaries: null` marks weekly data whose stable canaries are the whole check. |
| §3.1 `mpfs` | Built. RVU26D, 19,453 codes, 109 localities. | The QPP file repeats the nonQPP RVUs exactly (checked at parse), so it is stored as its conversion factor (33.5675) beside the nonQPP one, not as a second column set. |
| §3.2 `drg` | Built. FY2026 current, FY2027 CN as `upcoming.json` until October 1. | With next year's table bundled, `nextExpected` moves to the following August, so the stamp never says "a newer edition is expected" when it is already here. |
| §3.3 `mue` | Built. 2026 Q4, 15,349 codes, one record per code across three settings. | |
| §3.4 PTP and Addendum B | Not fetched (`LICENSE_GATED_SOURCES` off by default); named in the freshness issue. | |
| §3.5 `nadac` | Built. 2026-09-30 week, 30,079 rows, 515 labeler shards. | Pages are sorted by NDC so offsets are stable. |
| §3.6 `uspstf` | **Built October 3, 2026** | The 54 populations are curated in `scripts/data/uspstf-populations.json` (build input with its own `curatedAt`, not a shipped dataset: the shipped `data/uspstf` records carry them joined). Keys are the page alias plus the first 8 hex of the description's SHA-256, since one topic page can carry two rows (chlamydia and gonorrhea; the two colorectal age bands). The page answered the project's own user agent; no API key is used. |
| §3.7 schemas and FHIR packages | **Open.** The tar reader they need is built and tested. | |
| §5 workflow | Built: refresh runs `build-data.mjs` then `data/run.mjs`; the PR body leads with the decision; publish merges with `gh pr merge --squash` only on `merge`, otherwise labels `data-review`; a `freshness` job rewrites the "Data freshness" issue from `report-freshness.mjs`. | New shard files are marked intent-to-add so the packaged patch carries them. |
| §6 tests | Each builder has a fixture test on trimmed real files (descriptors blanked) and saved landing pages; `decidePublish` has a test per outcome. | |
