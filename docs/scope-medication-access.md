# Scope — medication access and coverage operations

**Status:** Specified September 25, 2026. Building since September 26, 2026: the shared date
helpers and dated-value accessor ([spec-v1501](spec-v1501.md) §2, §5) and the first four
[spec-v1503](spec-v1503.md) clocks are live; see that spec's build-status section.
**Specs:** [spec-v1500](spec-v1500.md) (charter) through [spec-v1517](spec-v1517.md).
**When built:** 101 additions and 3 backfills (the count is in the table below).

This ledger records how the gap was found, what the research established, what the
program will build, and what it deliberately won't. The charter holds the rules; this
page holds the evidence.

## The gap finder

**Method.** Every live catalog entry (1,847 in `data/search-corpus/corpus.json` on
September 25, 2026) was sorted by group and searched by name for the program's domain
words (prior authorization, appeal, formulary, Part D, 340B, poverty, copay,
deductible, adherence, refill, days supply, REMS, hospice, SNF, notice, COBRA,
enrollment, 835, eligibility). Then each proposed tool id was checked two ways:
against every live id and legacy alias (**no collisions** other than the two
intentional backfills), and against every live name for two or more shared content
words.

**What the catalog already had in this domain** (fewer than 70 entries across groups A,
B, C, H and P): Medicare physician, hospital and anesthesia payment math; coding edits;
`appeal-deadline` (Original Medicare only); `pa-turnaround`; `timely-filing`;
`cob-calc`; `medicare-cost-share`; `nsa-cost-share`; `era-balance`; `drug-wastage`;
`ndc-hcpcs-units`; `prior-auth` (a generic checklist); `appeal-letter` (a generic
patient letter); and `pa-lint` (a packet linter).

**Near neighbors, and why each new tool is not a duplicate:**

| Proposed | Live neighbor | Difference |
|---|---|---|
| `pa-criteria-checklist` | `prior-auth` | `prior-auth` lists what a packet usually needs; the new tool turns a specific payer policy's text into a checked criteria tree |
| `ndc-to-hcpcs-units` (dropped) | `ndc-hcpcs-units` | Same question; became a **backfill** (an NDC input) instead of a new tool |
| `x12-835-reader` | `era-balance` | `era-balance` checks numbers a person types; the reader parses the file and reuses the same arithmetic |
| the [spec-v1504](spec-v1504.md) builders | `appeal-letter` | payer-specific rules, deadlines and review standards, instead of one general letter |
| `snf-qualifying-stay` | `medicare-cost-share` | cost-share prices SNF days; the new tool decides whether the stay qualifies and counts the days left |
| `vial-rounding` | `drug-wastage` | wastage bills the leftover; rounding reduces it, then hands off to wastage |

**Result.** The domain was almost empty. No tool covered Part C, Part D, employer-plan,
Marketplace or Medicaid coverage clocks; Part D costs; poverty-line screening; subsidies;
enrollment windows or penalties; 340B; drug reimbursement; dispensing rules; adherence;
post-acute notices; benefit periods; or reading claim files.

## The count

| Spec | Wave | New | Backfills |
|---|---|---|---|
| [v1502](spec-v1502.md) | Prior authorization and step therapy | 6 | |
| [v1503](spec-v1503.md) | Coverage decisions and appeal clocks | 8 | `pa-turnaround`, `appeal-deadline` |
| [v1504](spec-v1504.md) | Appeal and request builders | 7 | |
| [v1505](spec-v1505.md) | Benefits investigation | 5 | `ndc-hcpcs-units` |
| [v1506](spec-v1506.md) | What the patient will pay | 9 | |
| [v1507](spec-v1507.md) | Enrollment windows, penalties, eligibility | 9 | |
| [v1508](spec-v1508.md) | Hospital financial assistance, self-pay | 5 | |
| [v1509](spec-v1509.md) | 340B | 7 | |
| [v1510](spec-v1510.md) | Drug pricing and reimbursement | 7 | |
| [v1511](spec-v1511.md) | Dispensing | 8 | |
| [v1512](spec-v1512.md) | Specialty and infusion | 5 | |
| [v1513](spec-v1513.md) | Adherence and quality | 4 | |
| [v1514](spec-v1514.md) | Post-acute notices and benefit clocks | 10 | |
| [v1515](spec-v1515.md) | File workbenches | 7 | |
| [v1516](spec-v1516.md) | Denial management | 4 | |
| | **Total** | **101** | **3** |

[spec-v1501](spec-v1501.md) (machinery) and [spec-v1517](spec-v1517.md) (refresh
builders) add no tools. One tool is **build-gated** and is counted in the total because
its spec is complete: `340b-rebate-model-clock` waits for the model to take effect on
January 1, 2027. The thalidomide and pomalidomide extension of `imid-rems-fill-window`
is gated inside that spec and not counted separately.

## Research record

Seven research passes on September 25, 2026 read the primary sources directly: the eCFR
versioner API (current text as of September 1–24, 2026), CMS fact sheets, Rate
Announcements and manuals, the Federal Register, the IRS revenue procedures, SSA POMS,
HRSA and FDA pages, the ASPE and data.medicaid.gov APIs, and the licensing pages of
X12, NCPDP, HL7, CAQH CORE and the AMA. Each spec cites the sections it relies on.
Findings that changed the plan:

| Finding | Effect |
|---|---|
| The enhanced premium tax credits expired after 2025; the 400% cliff and the uncapped repayment are back | `premium-tax-credit` prints both, every time |
| The 150% FPL Marketplace special enrollment period is gone | removed from `aca-sep-window` |
| Medicaid work requirements are in the CFR (42 CFR 435.550–563), required for coverage from January 1, 2027 | added `medicaid-work-requirement-check` |
| eCFR's text of 45 CFR 156.130(h) (copay accumulators) is the version a court vacated in 2023 | `copay-card-runout` takes "does assistance count" as an input |
| The Medicare Advantage 7-day prior-auth window took effect January 1, 2026, but 422.570(d) still says 14 days | disclosed in `ma-org-determination-clock` |
| CMS-0057-F decision windows exclude drugs and don't bind Marketplace plans | backfill to `pa-turnaround` |
| The 2027 amounts in controversy were published September 16, 2026 ($200 / $2,000) | backfill to `appeal-deadline` |
| The first 340B rebate pilot was vacated (February 2026); a revised one starts January 1, 2027 | `340b-rebate-model-clock` build-gated |
| 42 CFR 10.21 no longer addresses orphan drugs; the use-based exclusion was vacated in 2015 | `340b-orphan-exclusion` excludes regardless of use |
| The iPLEDGE modification (no 19-day lockout) takes effect November 15, 2026 | `ipledge-dispense-window` carries both editions |
| The clozapine REMS was eliminated June 13, 2025 | rejected |
| CMS stopped the reduced-coinsurance fact sheet after Q2 2025; the ASP file's coinsurance column is the source | `part-b-drug-coinsurance` reads the ASP file |
| X12 treats CARC/RARC descriptions as copyrighted; NCPDP's reject list is members-only | codes only, original labels ([spec-v1501](spec-v1501.md) §6) |

## Verify at build

Items the research couldn't close; each spec marks its own.

- Part D late-penalty rounding to $0.10 (CMS guidance, not in 423.286) — `partd-late-penalty`.
- Part A late penalty rule and section — `parta-premium`.
- 2027 Extra Help copays (projections until the fall memo) — `partd-year-cost`.
- Rev. Proc. 2026-26 table for 2027 — `premium-tax-credit`, `employer-coverage-affordability`.
- The family-affordability section cite — `employer-coverage-affordability`.
- The standard default refund amount's definition (IPAY 2027 final guidance) — `mfp-refund-check`.
- The CMS "Part B versus Part D Coverage Issues" document in full — `part-b-or-d`.
- Thalidomide and pomalidomide REMS windows — `imid-rems-fill-window`.
- The DMEPOS required-list source and the break-in-need rules — `dme-rental-clock`.
- The dispute-resolution administrative fee — `ppdr-eligibility`.
- Measurement-year 2026 Star changes, and the terms on the CMS-posted NDC list — `pdc-star`.

## Rejected

| Idea | Why |
|---|---|
| Reading a chart to decide whether criteria are met | judgment over free text ([spec-v1500](spec-v1500.md)) |
| Writing the clinical argument of an appeal | same; the builders leave a marked blank |
| Submitting to portals, fax, ePA or clearinghouses | no network ([spec-v50](spec-v50.md) §3) |
| Foundation fund status, drug shortages, today's formulary | live, licensed or unpublished |
| Any fifty-state table (step-therapy laws, contract-pharmacy laws, state Medicaid windows) | the matrix rule; state values are reader input |
| An NCPDP reject-code explainer | the list is licensed; codes are handled as reader input where a tool needs them |
| A drops-per-mL product table | no primary source |
| Clozapine REMS ANC clock | the REMS no longer exists |
| An appeal "chance of success" score | a model dressed as arithmetic |
| An XLSX parser | CSV covers the need; revisit on demand |
| Automated 340B OPAIS pulls | no stable URL or API; hrsa.gov blocks non-browser clients |

## Found in passing

`data/crosswalks/carc.json` ships eight CARC descriptions verbatim under a
"public domain" label, which X12's code-list FAQ contradicts. It's outside this
program and was raised as a separate task.
