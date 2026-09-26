# spec-v1507 — Enrollment windows, penalties and eligibility

**Status:** Proposed, September 25, 2026. 9 new tools, group C.
**Charter:** [spec-v1500](spec-v1500.md). The [spec-v29](spec-v29.md) §3 amendment in the
charter readmits these as clocks and deciders, not infographics.

People lose coverage, or pay a penalty for life, because a window closed that nobody
counted for them. Each tool here takes the person's own dates and facts and returns the
window, the start date or the penalty.

## Tools

### 1. `medicare-enrollment-window` — Medicare Enrollment Window and Start Date

**Input.** Date of birth (or the month Medicare eligibility begins, for disability),
the month the person signs up, and whether they have current employer coverage and
when it ends.
**Compute.**
- Initial enrollment period: 7 months, the 3 before the month of eligibility through
  the 3 after (42 CFR 407.14).
- Coverage start: since January 1, 2023, enrolling during or after the month of
  eligibility starts coverage on the first of the following month.
- General enrollment period: January 1 to March 31, with coverage starting the first of
  the month after enrollment (407.15, 407.25).
- Part B special enrollment period: through the end of the 8th month after employment
  or its group coverage ends, whichever is first (406.24, 407.20).
**Output.** Which window is open on the date entered, when it closes, the coverage
start date, and whether a penalty would start to accrue.

### 2. `partb-late-penalty` — Part B Late Enrollment Penalty

**Input.** The months the person was eligible for Part B and not enrolled, excluding
months covered by a special enrollment period, and the premium year.
**Compute.** 10% for each full 12-month period (42 CFR 408.22), times the standard
premium ($202.90 in 2026).
**Output.** The penalty percentage, the monthly amount, and that it lasts as long as the
person has Part B.

### 3. `partd-late-penalty` — Part D Late Enrollment Penalty

**Input.** The periods without Part D or creditable drug coverage after the initial
enrollment period ended.
**Compute.** Only gaps of 63 days or longer count (42 CFR 423.46). Penalty = 1% of the
national base beneficiary premium × uncounted months (423.286(d)(3)). Base premium:
$38.99 in 2026, $41.33 in 2027.
**Rounding.** CMS guidance rounds to the nearest $0.10; the regulation doesn't say. The
tool applies CMS's rounding and cites the guidance, **verified at build** against the
Medicare.gov and CMS pages.
**Output.** Uncounted months, the monthly penalty for the year entered, and a note that
it's recomputed each year from that year's base premium.

### 4. `parta-premium` — Part A Premium and Late Penalty

**Input.** Quarters of Medicare-covered work (the person's or a spouse's), and for
premium Part A, months eligible but not enrolled.
**Compute.** 2026 premium: $0 with 40 or more quarters, $311 with 30–39, and $565 with
fewer than 30. Late penalty: 10% for twice the number of years the person could have
had it and didn't. **Verify the penalty rule and its CFR section at build.**
**Output.** The monthly premium, any penalty, and how long the penalty lasts.

### 5. `extra-help-msp-screen` — Extra Help and Medicare Savings Program Screen

**Input.** Monthly income, countable resources, marital status, and state-specific
higher limits if the reader's state has them (input).
**Compute.** Against the 2026 federal minimums:

| Program | Income (individual / couple, monthly) | Resources (individual / couple) |
|---|---|---|
| QMB | $1,350 / $1,824 | $9,950 / $14,910 |
| SLMB | $1,616 / $2,184 | same |
| QI | $1,816 / $2,455 | same |
| Extra Help (full, up to 150% FPL) | income test via `fpl-percent` | $16,590 / $33,100 ($18,090 / $36,100 with burial funds) |

**Output.** The programs the person likely qualifies for, the limit each was tested
against, and that someone who qualifies for an MSP also gets Extra Help automatically.
It's a screen, not a determination, and the tool says so.
**Sources.** SSA POMS HI 00815.023 (TN 64, February 26, 2026); CMS CY2026 LIS resource
memo (October 31, 2025).

### 6. `aca-sep-window` — Marketplace Special Enrollment Window and Start Date

**Input.** The qualifying event and its date, when the person learned of it, the plan
selection date, and whether they had coverage in the 60 days before the event (where
that's required).
**Compute.** From 45 CFR 155.420:
- 60 days from the event; loss of coverage allows 60 days before and 60 days after;
  loss of Medicaid or CHIP allows 90 days after (longer if the state's
  reconsideration period is).
- Coverage start: the first of the month after plan selection by default; birth,
  adoption or foster placement retroactive to the event (or the first of the month, if
  chosen); loss of coverage selected in advance starts the first of the month after
  the event.
- The low-income (150% FPL) special enrollment period no longer exists.
**Output.** Open or closed, the deadline, and the start date.

### 7. `cobra-clock` — COBRA Notice, Election, Payment and End Dates

**Input.** The qualifying event and its date, the date coverage was lost, whether the
employer is also the plan administrator, the notice dates when known, and disability or
Medicare entitlement where relevant.
**Compute.**

| Step | Deadline | Rule |
|---|---|---|
| Employer tells the administrator | 30 days | 29 CFR 2590.606-2 |
| Administrator sends the election notice | 14 days (44 if the employer administers) | 2590.606-4 |
| Qualified beneficiary elects | at least 60 days from the later of loss of coverage or the notice | 26 CFR 54.4980B-6 |
| First premium | not due before 45 days after election | 54.4980B-8 |
| Later premiums | 30-day grace period | 54.4980B-8 |
| Coverage ends | 18 months (job loss, fewer hours), 29 (disability extension), 36 (other events) | 54.4980B-7 |

**Output.** Every deadline, the latest coverage end date, and the maximum premium
(102%, or 150% during months 19–29 of a disability extension).

### 8. `magi-household` — Medicaid MAGI Household and Income

**Input.** The people in the home, their relationships and ages, who files taxes, who
claims whom, and each person's income.
**Compute.** The household for **each person** under 42 CFR 435.603(f): the tax-filer
rules, the three exceptions that send a dependent to the non-filer rules, and the
non-filer rules. Income counts per 435.603(d)–(e), excluding children and dependents not
required to file. The 5% FPL disregard applies only at the threshold of the highest
group the person could qualify for (435.603(d)(4)).
**Output.** Each person's household size, counted income and percent of the poverty
guidelines, with the rule that put each member in or out. Different people in one home
often have different household sizes; that's the part counselors get wrong.
**Scope.** State thresholds are reader input; the tool doesn't determine eligibility.

### 9. `medicaid-work-requirement-check` — Medicaid Work Requirement Check

**Input.** Age, Medicare status, eligibility group, the exemption facts in 42 CFR
435.553 and 435.554 (for example, parent or caretaker of a child 13 or under, former
foster youth, American Indian or Alaska Native, recent incarceration), and each month's
hours of work, community service, work program or half-time school, or monthly income.
**Compute.** Exempt, and why; otherwise, whether each month meets 80 hours, or income
of at least the federal minimum wage × 80 hours ($580 at $7.25), or a 6-month average
for seasonal workers (435.552).
**Dates.** Required for coverage on or after **January 1, 2027**, unless the state
started earlier or has a good-faith exemption (no later than December 31, 2028).
State start dates and the state's look-back months are reader input.
**Output.** Exempt, meets or doesn't meet the requirement, month by month, with the
rule for each.
**Why now.** The interim final rule took effect July 31, 2026. Millions of enrollees and
the people helping them will need to answer this monthly from January.

## Sources

eCFR (current September 24, 2026): 42 CFR 406.24, 407.14, 407.15, 407.20, 407.25,
408.22, 423.46, 423.286, 435.552–435.563, 435.603; 45 CFR 155.420; 29 CFR 2590.606-2 to
-4; 26 CFR 54.4980B-6 to -8. CMS 2026 Parts A & B fact sheet; CMS 2026 and 2027 Part D
base-premium fact sheets; SSA POMS HI 00815.023; CMS CY2026 LIS resource memo;
CMS-2454-IFC (91 FR, June 3, 2026).

## Tests

- `medicare-enrollment-window`: a birthday on the first of the month (eligibility the
  month before); enrolling in the 3rd month after eligibility starts coverage the next
  month.
- `partd-late-penalty`: a 62-day gap doesn't count, 63 does.
- `magi-household`: a child claimed by a non-custodial parent falls to the non-filer
  rules; a married couple is always in each other's household.
- `medicaid-work-requirement-check`: 79 hours in a month fails; $580 of income passes.

## Build status

- **Built 2026-09-26:** `partb-late-penalty`, `partd-late-penalty`, `cobra-clock`.
  - The premiums go through the dated-value accessor ([spec-v1501](spec-v1501.md) §2) and are chosen by
    the year asked about: a year with no published figure asks for it, so the tools fail closed on
    January 1. Verified: $202.90 (CMS 2026 Parts A and B fact sheet), $38.99 and the nearest-$0.10
    rounding (Medicare.gov), $41.33 (CMS, July 28, 2026). Ledger: `billing-medicare-cost-share` (Part B)
    and the new `medicare-partd-base-premium`.
  - Uncovered months are the full calendar months inside each gap of 63 days or more.
  - COBRA also states the disability-extension end rule the table above leaves out: the later of 29
    months or the first of the month more than 30 days after a final finding of no disability
    (26 CFR 54.4980B-7).
- **Not yet built:** `medicare-enrollment-window` (the eCFR shows the Part B special period ends the
  last day of the 8th consecutive month with no employer coverage at any time, 42 CFR 406.24(b)(2)),
  `parta-premium`, `extra-help-msp-screen`, `aca-sep-window`, `magi-household`,
  `medicaid-work-requirement-check`.
