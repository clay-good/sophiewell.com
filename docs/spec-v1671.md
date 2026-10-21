# spec-v1671 — Independent review of the medication-access tools (v1500 to v1517)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1670](spec-v1670.md).

Two reviewers ran the 54 libs in `lib/*-v1500.js` to `lib/*-v1517.js` on edge inputs. Twenty-two defects are fixed.

## Numbers at a program line

| Tool | Input | Was | Now |
|---|---|---|---|
| `income-screens` (and `hospital-fap` tiers) | $22,030 for one, 138% limit | "138%, within 138%" (138.03%) | 138.03%, above; FAP tiers on the unrounded percent |
| `marketplace-credit` | 400.003% and 99.997% of poverty | a credit of $280.42 and $772.61 a month | no credit: decided on the unrounded percent |
| `partd-appeals`, `ma-appeals` | $199.9996 at stake | "$200 is below the $200 threshold" | $199.9996 |
| `quantity-limit-check` | 30.003 units against 30 | "Fits the limit: 30 of 30" | exceeds by 0.003 |
| `adherence` (MPR and gaps) | 1,599 of 2,000 days | "PDC 80% ... at or above" | 79.95%, below |

## Dates and inputs that could not be right

| Tool | Input | Was | Now |
|---|---|---|---|
| `request-letters` | receipt before the notice; request before the notice; an ERISA denial received after the letter date | the 60-day window moved or a letter built | refused |
| `erisa-claim-clock`, `medicaid-appeal-clock`, `aca-external-review`, `cobra-clock`, `qio-discharge-appeal`, `auth-runout` | a notice, appeal, request, resolution, election or next dose dated before the event it follows | confident deadlines (one before the denial itself) | refused |
| `qio-discharge-appeal` | notice after services ended | "came after before services end" | "came 2 days after services were to end" |
| `medicare-penalties` (Part D) | the same gap twice; a future gap | 12 months counted; a 2027 gap in a 2026 penalty | refused |
| `benefits` site of care | "abc" or −500 remaining | "$NaN a year"; $0 | refused |
| `cs-dispensing` | 5 refills dispensed of 2 authorized | answered | refused |
| `days-supply` | 28.5-day discard limit; a 0.5-day supply | used as given | whole days asked for |
| `dose-calendar` (loading) | dose 3 dated before dose 1; dose 1 given late | accepted; dose 1 still listed on its scheduled date | refused; the actual dose 1 date is used |

## Rules

| Tool | Input | Was | Now |
|---|---|---|---|
| `pdc-star` outreach | a first fill on December 1 | on the call list, though a 31-day treatment period can never enter the measure (91 days needed) | left off |
| `rate-escalation` | a schedule needing more than 500 steps | cut at 500 steps, reported as the whole infusion (20.91 of 1,000,000 mg) | refused |
| `rate-escalation` | 59.7 minutes | "0 h 60 min" | 1 h 00 min |
| `denial-next-step` | Medicare timely filing from June 1, 2027 | May 31, 2028 (365 days across a leap day) | June 1, 2028, one calendar year (42 CFR 424.44) |
| `post-acute-clocks` (IRF-PAI) | discharge October 20 | completed October 25, encoded October 31, transmitted November 6 | October 24, October 30, November 5: 412.610(c)(2) counts the discharge date as day 1 of the 5, and 412.614(c) runs 7 days from the encoding date, read October 20, 2026 |
| `compounding-bud` | nonsterile, nonpreserved aqueous | "14 days" with no storage condition | says USP <795> Table 4 gives 14 days refrigerated (2 to 8 °C) |
| `partd-appeals`, `ma-appeals` | a notice late in a year whose deadline falls in an unpublished year | "No amount in controversy is published yet" | the notice year's amount, for a request filed that year |

## Proof

`test/unit/review-fixes-v1500-v1517.test.js` holds the reviewer inputs; one older test that expected the +17-day IRF
transmission date is updated.
