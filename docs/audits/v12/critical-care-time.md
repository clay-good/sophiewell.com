# v12 audit - critical-care-time

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: AMA CPT 99291 (critical care, first 30-74 minutes) and 99292 (each additional 30 minutes); CMS Pub. 100-04 Claims Processing Manual, Ch. 12 30.6.12 (aggregate the day's bedside + unit critical-care time; subtract time spent on separately reported procedures; below 30 minutes is not critical care).

`lib/billing-v80.js criticalCareTime()` subtracts separately reported procedure minutes from total minutes, gates net < 30 to "not critical care," reports 99291 alone for 30-74, and computes 99292 units = floor((net - 75)/30) + 1 for net >= 75.

## Boundary examples added
- 29 -> not critical care (below the 30-minute floor).
- 30 / 74 -> 99291 alone (0 units of 99292).
- 75 -> 99291 + 99292 x1; 104 -> x1; 134 -> x2; 135 -> x3.
- 100 total minus 40 procedure = 60 net -> 99291 alone; 50 minus 25 = 25 net -> not critical care.

## Cross-implementation differential
- Reference: the CMS 99291/99292 time-to-units table (75-104 = +1, 105-134 = +2, ...) computed by hand.
- Test case: 134 net minutes. Sophie: 99291 + 99292 x2. Reference: identical. PASS.

## Edge-input handling notes
- totalMinutes / procedureMinutes validate as finite in [0, 100000] (num()); over-subtraction yields a negative net handled by a safe note (isCriticalCare false, 0 units), never a negative or NaN unit.
- The 99292 codes array is bounded by the 100000-minute input cap; the fuzz 1e9 value throws RangeError before the loop.

## A11y / keyboard notes
- Two numeric inputs (inputmode numeric); output aria-live="polite". 320px sweep passes.

## Defects opened
- none

## Status
- PASS
