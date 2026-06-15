# v12 audit - cob-calc

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: 42 CFR Part 411 and CMS Pub. 100-05 (Medicare Secondary Payer Manual): the standard coordination-of-benefits methods (lesser-of, come-out-whole / benefits-less-paid, non-duplication) and the MSP calculation. On a contracted claim the patient share after the primary is the primary allowed minus the primary payment.

`lib/billing-v82.js cobCalc()` requires an explicit `method` (one of four named code paths; the tool never silently picks one). It derives the patient balance after the primary (primaryAllowed - primaryPaid), then computes the secondary payment by method and the patient residual. Money is integer cents.

## Boundary examples added (one shared scenario, so the methods' divergence is visible)
- Charge $1,000; primary allowed $600, paid $480 (balance $120); secondary allowed $500, would-pay $400.
- lesser-of: min($120 balance, $400 would-pay) = $120 -> residual $0.
- come-out-whole: min($120, $500 - $480) = $20 -> residual $100.
- non-duplication: min($120, max(0, $400 - $480)) = $0 -> residual $120 (primary paid more than secondary would have).
- MSP: min($400, higher-allowed $600 - $480, charge $1,000 - $480) = $120 -> residual $0.

## Cross-implementation differential
- Reference: each method's formula computed by hand from the shared scenario.
- Test case: come-out-whole -> secondary $20, residual $100. Sophie result identical. PASS.

## Edge-input handling notes
- All money integer cents; an unknown method throws TypeError; primaryPaid > primaryAllowed and secondaryWouldPay > secondaryAllowed each throw RangeError. The secondary payment is clamped into [0, patientAfterPrimary] and the residual floored at 0, so no method can drive a negative balance. No NaN/Infinity path.

## A11y / keyboard notes
- A method select + five money inputs, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
