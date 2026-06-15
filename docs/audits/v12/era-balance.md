# v12 audit - era-balance

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: ASC X12 835 (Health Care Claim Payment/Advice) balancing and the CAS claim-adjustment group codes CO/PR/OA/PI: billed = paid + the sum of the adjustments; patient responsibility = the sum of PR.

`lib/billing-v83.js eraBalance()` works in integer cents. It sums the CAS group amounts (CO contractual, PR patient responsibility, OA other, PI payer-initiated) and computes the residual = billed - paid - sum(adjustments). A zero residual balances; a nonzero residual is reported to the cent with the direction (a missing posting line vs an over-stated adjustment). The patient responsibility to post and bill is the sum of PR. No float drift.

## Boundary examples added
- Billed $200, paid $120, CO $50, PR $30: balances; residual $0; patient owes $30.
- Same claim, PR understated to $20: out of balance by exactly $10 (positive residual).
- Same claim, PR over-stated to $40: residual -$10 (adjustment over-stated).

## Cross-implementation differential
- Reference: billed - paid - sum(adjustments) by hand.
- Test case: 200 - 120 - 50 - 30 = 0 -> balanced; Sophie identical. PASS.

## Edge-input handling notes
- Missing billed/paid -> TypeError; adjustments default to 0; amounts are integer cents (rounded at the edge). The residual is signed and the displayed out-of-balance amount is its absolute value. No NaN/Infinity path.

## A11y / keyboard notes
- Six money inputs (billed, paid, CO, PR, OA, PI), each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
