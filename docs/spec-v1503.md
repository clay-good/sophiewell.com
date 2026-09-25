# spec-v1503 — Coverage decisions and appeal clocks beyond Original Medicare

**Status:** Proposed, September 25, 2026. 8 new tools (group C) and 2 backfills.
**Charter:** [spec-v1500](spec-v1500.md). **Machinery:** [spec-v1501](spec-v1501.md) §5 (clock engine).

`appeal-deadline` covers Original Medicare's five levels (42 CFR 405 subpart I), and
`pa-turnaround` covers the CMS-0057-F decision windows. Most patients aren't in
Original Medicare. Their appeals run on six other rule sets, each with its own start
event, its own extensions and its own consequence for a missed deadline. Each tool
below is one rule set, and every number was read in the current eCFR text on
September 24, 2026.

## Shared behavior

- **Receipt presumption.** Where the rule counts from *receipt* of a notice and
  presumes receipt 5 days after the notice date (Part C, Part D), the tool asks for the
  notice date, adds the 5 days, and says so. A reader with proof of later receipt can
  enter the receipt date instead.
- **Hours stay hours.** A 72-hour or 24-hour clock is computed from a date and time
  and answered as a date and time, never rounded to calendar days.
- **Missed deadlines have consequences, and the tool states them.** In Part D and at
  Part C reconsideration, a plan that misses its deadline must forward the case to the
  independent review entity. In Medicaid managed care, the enrollee is deemed to have
  exhausted the plan's appeal. The tool prints the consequence beside the deadline.

## Tools

### 1. `partd-coverage-clock` — Part D Coverage Determination and Exception Clock

| Request | Decision due | Rule |
|---|---|---|
| Standard | 72 hours from receipt | 42 CFR 423.568(b) |
| Standard **exception** (formulary or tiering) | 72 hours from receipt of the prescriber's supporting statement; if none arrives within 14 calendar days, 72 hours after day 14 | 423.568(b) |
| Expedited | 24 hours from receipt (same supporting-statement rule) | 423.572(a) |
| Payment (reimbursement) request | 14 calendar days from receipt | 423.568(c) |
| Expedite refused | standard 72 hours, counted from when the expedited request arrived; written notice within 3 calendar days | 423.570 |

**Missed deadline:** an adverse determination, forwarded by the plan to the
independent review entity within 24 hours (423.568(h), 423.572(d)).
**Output also includes** the two statements a supporting statement must make (tiering:
preferred drugs less effective, cause adverse effects, or both; formulary: all covered
drugs on any tier are), and that an approved exception holds for refills for the rest
of the plan year (423.578).

### 2. `partd-appeal-ladder` — Part D Appeal Levels and Deadlines

| Level | Filing window | Decision |
|---|---|---|
| Redetermination (plan) | 60 days from receipt of the coverage-determination notice (423.582) | 7 days standard, 14 days payment, 72 hours expedited (423.590) |
| Reconsideration (independent review entity) | 60 days from receipt of the redetermination (423.600) | same as the plan's |
| ALJ hearing | 60 days from receipt of the reconsideration (423.2002), if the amount in controversy is met | 90 days, or 10 days expedited (423.2016) |
| Medicare Appeals Council, federal court | as `appeal-deadline` | |

**Amount in controversy:** $200 for an ALJ hearing and $1,960 for federal court in
2026; **$200 and $2,000 in 2027** (published September 16, 2026). Route B dated
constants.
**Input:** the level reached, the notice date, and the amount at stake. **Output:** the
next level, its filing deadline, whether the amount qualifies, and the decision clock
once filed.

### 3. `ma-org-determination-clock` — Medicare Advantage Coverage Decision Clock

| Request | Decision due | Extension |
|---|---|---|
| Standard, item or service **not** needing prior authorization | 14 calendar days | up to 14 days (enrollee asks, needed non-contract information, or extraordinary circumstances), with written notice |
| Standard, item or service **needing prior authorization** (from January 1, 2026) | 7 calendar days | same |
| Standard, Part B drug | 72 hours | none |
| Expedited, item or service | 72 hours | up to 14 days |
| Expedited, Part B drug | 24 hours | none |

Rules: 42 CFR 422.568, 422.570, 422.572. **Missed deadline:** an adverse determination
the enrollee may appeal. There's no automatic forwarding at this level, unlike
Part D, and the tool says so.
**A discrepancy the tool discloses.** 422.570(d) still describes the downgrade from
expedited to standard in terms of "the 14-day timeframe", although prior-authorization
requests now carry 7 days. The tool applies 7 days to prior-authorization requests and
prints the discrepancy.

### 4. `ma-appeal-ladder` — Medicare Advantage Appeal Levels and Deadlines

| Level | Filing window | Decision |
|---|---|---|
| Reconsideration (plan) | **60** days from receipt of the notice (422.582) | 30 days service, 60 days payment, 7 days Part B drug; 72 hours expedited (Part B drug not extendable) (422.590) |
| Independent review entity | **automatic** when the plan upholds any part of a denial: within the plan's own deadline, or 24 hours for expedited | set by CMS contract (422.592); the tool says no regulatory number exists |
| ALJ hearing | 60 days from receipt of the reconsidered determination (422.602) | |

A missed plan deadline counts as an adverse reconsideration and goes to the
independent review entity.

### 5. `erisa-claim-clock` — Employer Plan Claim and Appeal Clock (ERISA)

From 29 CFR 2560.503-1:

| Claim | Initial decision | Appeal decision (one level / each of two) |
|---|---|---|
| Urgent care | 72 hours; incomplete-claim notice within 24 hours; claimant gets at least 48 hours; decision 48 hours after the earlier of receipt or the end of that period | 72 hours |
| Pre-service | 15 days, plus one 15-day extension noticed within the first 15 | 30 days / 15 days |
| Post-service | 30 days, plus one 15-day extension | 60 days / 30 days |
| Concurrent care (extending urgent treatment) | 24 hours, if requested at least 24 hours before the course ends | |

Filing an appeal: at least 180 days after the adverse determination. When an extension
is for missing information, the claimant gets at least 45 days, and the clock is paused
while they respond. **Input:** claim type, dates, whether and when an extension was
noticed. **Output:** each deadline, and whether the plan's extension notice itself came
in time.

### 6. `aca-external-review-clock` — Marketplace and Employer Plan External Review Clock

From 45 CFR 147.136:

| Step | Deadline |
|---|---|
| Request external review | 4 months from receipt of the final internal denial; with no matching date, the first day of the fifth month |
| Plan's preliminary review | 5 business days, then written notice within 1 business day |
| Plan sends records to the reviewer | 5 business days after assignment |
| Claimant adds information | at least 5 business days |
| Reviewer's decision | 45 days from receipt of the request; 72 hours expedited (written confirmation within 48 hours of an oral decision) |

**Also computed:** deemed exhaustion. When a plan hasn't followed the internal-appeal
rules, the claimant may go straight to external review; the tool lists the
circumstances and doesn't decide them. Business days use the federal calendar.

### 7. `medicaid-appeal-clock` — Medicaid Managed Care and Fee-for-Service Appeal Clock

| Step | Deadline | Rule |
|---|---|---|
| Plan appeal | 60 days from the notice date | 42 CFR 438.402(c) |
| Plan decision | 30 days standard, 72 hours expedited (state may set shorter), plus up to 14 days extension with notice within 2 calendar days | 438.408 |
| Keep benefits during the appeal | request within 10 calendar days of the notice (or by the intended effective date, if later) | 438.420 |
| State fair hearing after the plan appeal | the state sets a window of **90 to 120 days** from the plan's decision: **reader input**, bounded to that range | 438.408(f)(2) |
| Fee-for-service fair hearing | up to 90 days from the notice mailing date (state input); decision ordinarily within 90 days | 431.221(d), 431.244(f) |
| Plan prior-authorization decision | 7 days standard for contract periods from January 1, 2026 (14 before), 72 hours expedited, each plus up to 14 days | 438.210(d) |

A plan that misses its appeal deadline leaves the enrollee deemed to have exhausted the
plan level, able to go to the state hearing (438.408(c)(3)). A state-specific window is
reader input; the tool never ships a fifty-state table.

### 8. `qio-discharge-appeal-clock` — Medicare Fast Appeal Clock (Hospital Discharge and Ending Services)

| Case | Patient must ask the QIO | Provider must | QIO decides |
|---|---|---|---|
| Hospital discharge | by the day of discharge (405.1206) | deliver the detailed notice and records by noon of the day after the QIO calls | within 1 calendar day of receiving the information |
| Hospital discharge, late request, still admitted | | | within 2 days |
| Skilled nursing, home health, hospice, CORF ending | by noon of the day after receiving the notice (405.1202) | give notice at least 2 days before services end (405.1200) | within 72 hours of the request |

**Also computed:** the liability protection. A patient who asks in time doesn't pay
(beyond ordinary cost sharing) until noon of the day after the QIO's decision. If the
ending-services notice was invalid, coverage continues until 2 days after a valid one.
Notice-delivery timing itself is [spec-v1514](spec-v1514.md).

## Backfills to live tools

| Tool | Change |
|---|---|
| `pa-turnaround` | State that the CMS-0057-F windows **exclude drugs** and **don't apply to Marketplace plans**. Compute the 72-hour window in hours from a date and time instead of 3 calendar days. Add the Medicare Advantage 14-day extension and the Part B drug 72-hour/24-hour windows, or point to `ma-org-determination-clock`. |
| `appeal-deadline` | Carry the 2027 amounts in controversy ($200 ALJ, $2,000 federal court) as a dated edition beside 2026's, switching on January 1, 2027. Apply the 5-day receipt presumption where 42 CFR 405 uses it. |

## Sources

eCFR, current as of September 24, 2026: 42 CFR 405.1200–405.1206, 422.136, 422.568–
422.602, 423.568–423.600, 423.2002, 423.2016, 431.221, 431.244, 438.210, 438.402–
438.420, 440.230; 45 CFR 147.136; 29 CFR 2560.503-1. Federal Register 2025-21879 and
2026-19016 (amounts in controversy). CMS-0057-F fact sheet and FAQ.

## Tests

- Each tool: one case per row of its table, and one boundary case per clock (the
  exact hour or day the deadline falls).
- `partd-coverage-clock`: no supporting statement by day 14 moves the clock.
- `aca-external-review-clock`: a notice received October 31 gives a deadline of the
  first day of the fifth month, because February 31 doesn't exist.
- `medicaid-appeal-clock`: a state window of 80 days is refused as outside 90–120.
