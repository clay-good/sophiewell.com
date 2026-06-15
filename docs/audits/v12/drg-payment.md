# v12 audit - drg-payment

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: 42 CFR Part 412 (IPPS); DRG payment = relative weight x the hospital base rate (operating + capital, wage-index adjusted), before outlier/IME/DSH add-ons.

`lib/billing-v83.js drgPayment()` wage-adjusts the operating + capital base rates, multiplies by the relative weight to get the base DRG payment (integer cents), and -- for a post-acute transfer -- prices a per diem (base / GMLOS), doubling the first day and adding a single per diem per subsequent day, capped at the full DRG payment. Entered outlier/IME/DSH add-ons are added at the end. The relative weight / GMLOS come from the bundled `data/drg` or are entered (doctrine clause 2). Estimates the operating model only.

## Boundary examples added
- Weight 1.5, operating $6,000 + capital $500, wage 1.0: wage-adjusted base $6,500, base DRG payment $9,750.
- Transfer, GMLOS 5, LOS 2: per diem $1,950, first day doubled -> $5,850 (< full DRG).
- Long transfer (LOS 20, GMLOS 5): capped at the full $9,750, never above.

## Cross-implementation differential
- Reference: 1.5 x (6000 + 500) = $9,750 by hand; transfer per diem 9750/5 = $1,950, x(2+1) = $5,850.
- Test case: as above; Sophie identical. PASS.

## Edge-input handling notes
- Missing weight/operating base -> TypeError; wage index defaults to 1; transfer pricing only engages with a transfer flag, a positive GMLOS, and a positive LOS; the transfer payment is floored at $0 and capped at the full DRG. No NaN/Infinity path.

## A11y / keyboard notes
- A DRG-code lookup field, money/number inputs for weight/base/wage/LOS/GMLOS/add-ons, and a labeled transfer checkbox, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
