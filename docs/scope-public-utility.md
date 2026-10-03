# Scope — public utility: the patient, the plan sponsor and the published rules

**Status:** Specified September 29, 2026. Being built: what is done and what is open is in [spec-v1626](spec-v1626.md#build-status).
**Specs:** [spec-v1600](spec-v1600.md) (charter) through [spec-v1605](spec-v1605.md).
**When built:** 14 additions and 1 backfill (the count is in the table below).

This ledger records how the gap was found, what the research established, and what the
program deliberately won't build. The charter holds the rules; this page holds the evidence.

## The question it started from

Healthcare is close to a fifth of US GDP, and a large share of what isn't care is the
cost of not being able to read the rules: coverage, prior authorization, prices, denials.
Much of the industry around that cost sells translation. The question was which of those
translations a free, static, deterministic catalog can do outright, for the reader with
the least information, without becoming an intermediary itself.

## The gap finder

**Method.** Every live tool id on September 29, 2026 was searched for the program's
domain words (preventive, USPSTF, FHIR, CARIN, EOB, Blue Button, Transparency in
Coverage, in-network, percent of Medicare, HSA, HDHP, direct primary care, gag clause,
PBM, Medicare Advantage criteria, NCD, LCD, prior-authorization metrics, WISeR), and each
proposed id was checked against live ids and the planned ids of
[spec-v1500](spec-v1500.md) through [spec-v1517](spec-v1517.md).

**What the catalog already had, or has planned.** The medication-access program covers
the provider's side thoroughly: appeal clocks, request builders, the X12 readers, the
hospital price-file check and compare, the Da Vinci prior-authorization bundle check,
denial routing, `lcd-diagnosis-check`, `ncci-ptp`, `mue-check`, `nsa-cost-share`,
`ppdr-eligibility` and `hipaa-roa`. This program builds on those and duplicates none.

**Near neighbors, and why each new tool is not a duplicate:**

| Proposed | Neighbor | Difference |
|---|---|---|
| `itemized-bill-check` | `hpt-price-compare` | compare shows one code across hospitals; the new tool checks every line of one bill against that hospital's own file |
| `carin-eob-reader` | `x12-835-reader` | the 835 is the provider's remittance file; the CARIN bundle is the patient's own claims record |
| `ma-criteria-check` | `lcd-diagnosis-check`, `which-appeal-path` | those answer "is this covered" and "which appeal"; the new tool checks whether the plan was allowed to use the criteria it used |
| `payer-policy-diff` | `pa-criteria-checklist` | the checklist evaluates one version; the diff compares two, reusing its splitter |
| `pharmacy-spread-check` | `pbm-reimbursement-check`, `nadac-margin` | those price one claim for a pharmacy; the new tool runs a plan's whole claims file, as the batch mode of the same arithmetic |
| `patient-pa-record-reader` | `pa-turnaround` | the clock takes dates typed in; the reader takes them from the patient's own export and calls the clock |

**Result.** Nothing in the catalog served the patient reading their own claims, the plan
sponsor reading its own prices, or anyone checking a payer's process against the rules
that govern it.

## The count

| Spec | Wave | New | Backfills |
|---|---|---|---|
| [v1601](spec-v1601.md) | Preventive care owed at $0 | 3 | |
| [v1602](spec-v1602.md) | Reading your own claims and bills | 3 | |
| [v1603](spec-v1603.md) | Coverage rules and the payer's own numbers | 3 | `medicare-ffs-pa-required` |
| [v1604](spec-v1604.md) | Employer plans that pay their own claims | 5 | |
| | **Total** | **14** | **1** |

[spec-v1600](spec-v1600.md) (charter) and [spec-v1605](spec-v1605.md) (data) add no tools.
One tool is **build-gated** and counted because its spec is complete:
`patient-pa-record-reader` waits for real Patient Access API exports after January 1, 2027.

## Research record

Read September 29, 2026, from primary sources where they were reachable and from named
secondary sources where flagged. Findings that shaped the plan:

| Finding | Effect |
|---|---|
| CMS-0057-F: first prior-authorization metrics posted by March 31, 2026 for CY2025; four FHIR APIs, including prior authorization in the Patient Access API, due January 1, 2027; excludes drugs and Original Medicare | `pa-metrics-compare`; `patient-pa-record-reader` build-gated to 2027 |
| KFF's analysis of the first reports: at least 1 in 8 standard requests denied; Medicare Advantage 12%, insurers from 5% to 17%; 65% of LTCH and 54% of IRF requests denied; "gaps remain" in the reports | the metrics table records gaps as rows; required-element check |
| The CMS health technology ecosystem's networks must give patients FHIR access through an app of their choice (2026) | patient files arrive by export, not by our connection |
| 42 CFR 422.101(b)(6) limits MA internal criteria to cases Medicare doesn't fully establish, and requires them to be public and evidence-based | `ma-criteria-check` |
| WISeR: Original Medicare prior authorization in six states, 2026–2031; two services postponed April 6, 2026; a GAO determination has raised the possibility of repeal | backfill, with a page watch for repeal or change |
| *Kennedy v. Braidwood* (June 27, 2025) upheld USPSTF-based $0 coverage; the Secretary can review and block recommendations | `preventive-owed` shows USPSTF status as posted |
| The USPSTF Prevention TaskForce API needs a request and key, and its terms require verbatim recommendation text | verbatim text; route B fallback |
| 2025 reconciliation act and Notice 2026-5: DPC compatible with HSAs from 2026 ($150 / $300 per month, indexed), telehealth safe harbor permanent, bronze and catastrophic plans HSA-compatible | `dpc-hsa-check`, `hsa-predeductible-check` |
| CAA 2026 (February 3, 2026): PBMs become ERISA covered service providers; 100% rebate pass-through and semiannual reports for plan years from August 3, 2028 | `pharmacy-spread-check` now; reconcile tool deferred to the report format |
| Transparency in Coverage changes proposed December 23, 2025 (findability, text-file pointers); the drug-price file still not enforced | `tic-file-check` pins and gates schema versions |

## Verify at build

Each spec lists its own. The ones that could change a tool's shape:

- The FAQ part numbers behind `preventive-cost-share-check`.
- The paragraph numbers in 42 CFR 422.112 for approval duration and the new-enrollee
  transition, and each program's metrics-reporting section.
- Whether the USPSTF API key can be held by the refresh workflow.
- The CARIN version served in practice, and how 2027 prior-authorization data appears in
  patient exports.
- The largest insurer rate file a browser worker can stream on a mid-range laptop.

## Rejected

| Idea | Why |
|---|---|
| Connecting to payers' Patient Access APIs from the site | network, per-payer app registration, and it would make the site an intermediary |
| A payer "grade" or ranking | a model with hidden weights; the tools show each metric and the market range instead |
| A coverage-policy database scraped from payer sites | live and unstable, and payers' policy text is their copyright; the reader pastes the version they have into `payer-policy-diff` |
| Deciding whether a denial was medically right | judgment over the chart ([spec-v1500](spec-v1500.md)) |
| A prior-authorization "approval chance" | a model dressed as arithmetic |
| A vaccine schedule or vaccine cost-share list | [spec-v5](spec-v5.md) §6, and the schedule has changed repeatedly since 2025 |
| Habit, diet or sobriety coaching | outside what a deterministic catalog does well; prevention is served here by making preventive care free at the point of care |
| Reading a PBM or administrator contract to find gag clauses | judgment over contract text; the ban itself is stated in `claims-pct-medicare`'s page as the reason the plan can get its data |
| Collecting bills or plan data to publish aggregate findings | the site never receives data; researchers can run the same tools on data they hold |
