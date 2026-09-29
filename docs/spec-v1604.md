# spec-v1604 — Employer plans that pay their own claims

**Status:** Proposed, September 29, 2026. In progress: `dpc-hsa-check` built ([build status](#build-status)).
**Charter:** [spec-v1600](spec-v1600.md). **Group:** P, except `dpc-hsa-check`, which joins
group C.
**Machinery:** the [spec-v1501](spec-v1501.md) §3 upload workbench and the streaming
JSON parser built for `hpt-file-check` ([spec-v1515](spec-v1515.md)).

## Why employers, and why now

Most workers with job-based coverage are in plans where the employer pays the claims
itself and hires an administrator and a PBM to run them. The employer carries the cost,
and under ERISA its benefits committee is a fiduciary that must pay only reasonable
amounts. Since 2021 the law has also given it the tools to check:

- **The data.** The Consolidated Appropriations Act, 2021 bans contract clauses that keep
  a plan from its own claims data (the gag-clause ban), and plans attest to it each year.
- **The prices.** The Transparency in Coverage rule has required insurers and
  administrators to publish every in-network rate since July 2022. The files are huge
  (often hundreds of gigabytes per insurer), so almost nobody outside a vendor reads them.
  Changes to make them easier to find were proposed on December 23, 2025.
- **The pharmacy money.** The Consolidated Appropriations Act, 2026 (signed February 3,
  2026) makes PBMs covered service providers under ERISA 408(b)(2), requires 100% of
  rebates to pass through to the plan, and requires semiannual drug-pricing reports, for
  contracts from plan years beginning on or after August 3, 2028.
- **Primary care.** From January 1, 2026, a direct primary care arrangement no longer
  disqualifies an HSA if its fee is at most $150 a month for one person or $300 for a
  family (indexed) and it covers only primary care (Notice 2026-5).

A small employer checks none of this today without paying a consultant, often one paid by
the same vendors. Every dollar a plan overpays comes out of wages. These tools let a
committee member, a union trustee or a benefits manager do the analysis in a browser with
files they are entitled to.

## Tools

### 1. `tic-file-check` — Insurer Price File (Transparency in Coverage) Check

**Input.** An in-network rates, allowed amounts, or table-of-contents file (JSON).
**Compute.** Streams the file and validates it against the CMS Transparency in Coverage
schemas at the pinned version: required fields, types, and references between the
table of contents and the files it names.
**Output.** Pass, or each error with its JSON path. Pointers the reader can give the
insurer when a file doesn't open or doesn't conform.

### 2. `tic-rate-lookup` — Find Negotiated Rates in an Insurer Price File

**Input.** An in-network rates file (JSON, streamed; the page states the size it can
handle), the billing codes the reader cares about, and optionally the providers (NPI or
TIN).
**Compute.** Streams the file once, keeping only matching rates: code, provider group,
negotiated rate, rate type, billing class, place of service, expiration date. Each rate is
set beside the Medicare amount for the same service from the bundled physician fee
schedule, APC or DRG data where one applies.
**Output.** A table and a CSV, with each rate as a percent of Medicare. Rates with no
Medicare equivalent say so.
**Rule.** A percent of Medicare is shown only where the Medicare amount's locality and
year are stated beside it.

### 3. `claims-pct-medicare` — What Is Our Plan Paying as a Percent of Medicare?

**Input.** The plan's claims extract as CSV (from the administrator; the gag-clause ban
means the plan can ask for it): date, provider, place of service, codes, allowed amount.
**Compute.** Reprices each line at Medicare using the bundled fee schedules (professional
under the physician fee schedule; outpatient under APC; inpatient under MS-DRG), then
sums allowed and Medicare amounts by provider, facility and service category.
**Output.** Percent of Medicare by facility and by category, the facilities where the
plan pays most above Medicare, and the claims that couldn't be repriced with the reason.
This is the method RAND's hospital price studies use, run by the plan on its own data.
**Rule.** Lines that can't be repriced are excluded from the ratio and counted, never
priced at zero. The page states which Medicare adjustments are applied and which aren't
(for example, outlier payments), so the ratio is reproducible.

### 4. `pharmacy-spread-check` — Plan Pharmacy Claims Against Acquisition Cost

**Input.** The plan's pharmacy claims as CSV (NDC, quantity, fill date, plan paid,
member paid, pharmacy paid if the PBM discloses it).
**Compute.** For each claim: NADAC per unit on the fill date times quantity (the NADAC
data `nadac-margin` uses, [spec-v1510](spec-v1510.md)); the gap between what the plan paid
and NADAC; where the pharmacy's payment is disclosed, the spread between what the plan
paid and what the pharmacy received. Totals by drug and by month.
**Output.** The plan's spend against a public acquisition benchmark, the drugs with the
largest gaps, and a CSV. Built as the plan-sponsor batch mode of the same arithmetic
`pbm-reimbursement-check` does per claim, not a second implementation.
**Rule.** A drug with no NADAC on the date says "no benchmark." NADAC is a pharmacy
acquisition survey, and the page says so; it is a benchmark, not a price the plan was
owed.

### 5. `dpc-hsa-check` — Does This Direct Primary Care Arrangement Keep HSA Eligibility?

**Input.** The monthly fee (individual or family), the services it covers (choices: the
excluded kinds are procedures needing general anesthesia, prescription drugs other than
vaccines, and lab services not typical of ambulatory primary care), who provides them, and
any other direct primary care arrangements the person has.
**Compute.** IRC 223(c)(1)(B) and 223(g) as amended by the 2025 reconciliation act, with
Notice 2026-5: the combined fee against the year's limit, the covered services against the
exclusions.
**Output.** Compatible or not, the reason, and, if the fee is over the limit, the fact that
the fee can still be paid from the HSA while contributions stop for those months.
**Data.** The fee limits are a route B dated constant, indexed each year.
**Why it's in this program.** It's the one structural change in years that makes paying a
primary care doctor directly compatible with the most common employer plan design.

## Sources

- ERISA 404(a); Consolidated Appropriations Act, 2021, div. BB, title II §201 (gag
  clauses); Consolidated Appropriations Act, 2026, PBM provisions (February 3, 2026).
- Transparency in Coverage: 45 CFR 147.212, 29 CFR 2590.715-2715A3; the CMS
  `price-transparency-guide` schemas (GitHub, public domain); proposed rule 2025-23693
  (December 23, 2025).
- 42 CFR 414 (physician fee schedule), 419 (OPPS), 412 (IPPS); the bundled `mpfs`, `apc`
  and `drg` data.
- CMS NADAC (data.medicaid.gov).
- IRC 223; IRS Notice 2026-5.
- RAND, "Prices Paid to Hospitals by Private Health Plans" (method reference only).

## Verify at build

- The 2027 indexed direct primary care limits, once IRS publishes them.
- Whether the TiC schema changes proposed December 2025 were finalized, and their
  effective date; `tic-file-check` pins the version in force and gates the next.
- The largest in-network file the streaming parser handles in a Web Worker on a
  mid-range laptop; the page states the tested size.
- The CAA 2026 PBM report format, if the Department of Labor issues one before August
  2028. A `pbm-report-reconcile` tool (rebates received against rebates passed through)
  is planned for then and not counted here.

## Tests

- `tic-file-check`: the CMS sample files pass; a table-of-contents entry pointing at a
  missing file fails with its path.
- `tic-rate-lookup`: a fixture with 3 codes across 2 providers returns exactly those
  rates; a code with no Medicare equivalent is labeled.
- `claims-pct-medicare`: a professional line and a DRG line reprice to their fixture
  Medicare amounts; an unrepriceable line is excluded and counted.
- `pharmacy-spread-check`: a fill on a date without NADAC says "no benchmark"; totals by
  drug match the row sums to the cent.
- `dpc-hsa-check`: $149 individual with primary care only is compatible; two
  arrangements at $100 each are not; covering a non-vaccine prescription drug is not.

## Build status

| Tool | Status | What was read, and what differed |
|---|---|---|
| `dpc-hsa-check` | **Built September 29, 2026** (catalog 1,951) | Read in the source that day: IRS Notice 2026-5 (questions A-11 through A-20). **The spec cited the wrong subsection:** the safe harbor is IRC 223(c)(1)(E), added by section 71308 of Pub. L. 119-21, not 223(c)(1)(B) and 223(g). The 2026 limits ($150 a month for one person, $300 for more than one) are a route B dated constant; a later year asks for its indexed limit until a row is added. The fee is entered as the total for all of a person's arrangements, billed monthly, quarterly, every six months or yearly (A-13 annualizes). Two rules the spec did not name are applied: an arrangement that bills members on top of its fee is not one (A-11), and fees an employer pays cannot be reimbursed from the HSA (A-18). An unanswered term is never read as yes: under the limit it is "not assessed", over the limit it is named. |
| The other tools on this page | Open | See [spec-v1626](spec-v1626.md#build-status). |
