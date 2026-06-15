# v12 audit - medicare-cost-share

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: SSA Title XVIII and the CMS CY2026 Medicare cost-sharing amounts (CMS fact sheet, announced 2025-11-14): Part A inpatient deductible $1,736/benefit period, days 61-90 coinsurance $434/day, lifetime-reserve $868/day, SNF days 21-100 $217/day; Part B annual deductible $283 then 20% of the Medicare-approved amount.

`lib/billing-v82.js medicareCostShare()` branches on the `part` discriminator (B / A / SNF) and computes integer cents. Part B applies the remaining deductible first then 20% of the remainder (deductibleThenCoinsurance, shared helper). Part A sums the per-benefit-period deductible (days 1-60), $434/day for days 61-90, and the lifetime-reserve daily amount for elected LRD past day 90; days past 90 with no LRD are flagged uncovered. SNF charges the day-21-100 daily amount over eligible days; days past 100 are flagged uncovered. The result is the patient share BEFORE any Medigap / secondary coverage (cob-calc coordinates it).

## Boundary examples added
- Part B, $500 approved, full $283 deductible remaining: $283 deductible + 20% of $217 = $326.40; Medicare pays $173.60.
- Part B, deductible already met: flat 20% of $500 = $100.
- Part B, allowed below the remaining deductible ($100 < $283): patient owes the whole $100, no coinsurance, never a negative coinsurance base.
- Part A, 95-day stay, 5 LRD elected: $1,736 + 30x$434 + 5x$868 = $19,096.
- Part A, 95-day stay, 0 LRD: 5 uncovered days flagged.
- SNF, 30 days: 10 coinsurance days x $217 = $2,170; 15 days -> $0.

## Cross-implementation differential
- Reference: the day-band sums computed by hand against the CMS fact-sheet figures.
- Test case: 95-day Part A stay with 5 LRD -> $1,736 + $13,020 + $4,340 = $19,096. Sophie result identical. PASS.

## Edge-input handling notes
- All money is integer cents; every dated constant is overridable per call for a prior-year reconciliation. allowedCents/lengthOfStay/snfDays finite >= 0 (num()); an unknown part throws TypeError. The coinsurance base is clamped so a charge below the deductible never goes negative; patient total is capped at the allowed. No NaN/Infinity path.

## A11y / keyboard notes
- A coverage select + numeric money/day inputs + a checkbox, each with a real `<label for>`; output aria-live="polite". The fields read top-to-bottom; 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
