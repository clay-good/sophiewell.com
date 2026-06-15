# v12 audit - apc-payment

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: 42 CFR Part 419 (OPPS); APC payment = relative weight x the OPPS conversion factor, wage adjusted, with status-indicator packaging and the multiple-procedure discount.

`lib/billing-v83.js apcPayment()` prices each APC line as weight x conversion factor x wage index (integer cents), $0 when the status indicator is packaged (N or blank). Among the discountable significant procedures (status T), the highest-paying pays 100% and every subsequent one is reduced to the discount percentage (default 50%); status S/V lines are separately payable but never discounted. The relative weights / status indicators come from the bundled `data/apc` or are entered (doctrine clause 2). Estimates the base model only.

## Boundary examples added
- CF $87, wage 1: T weight 10 -> $870 (100%); T weight 4 -> $348 -> 50% -> $174; N weight 2 -> packaged $0. Total $1,044.
- Two status-S lines: both separately payable, no discount (weight 2 + weight 1 at $100/unit -> $300).
- Empty line list -> RangeError; non-array lines -> TypeError.

## Cross-implementation differential
- Reference: 10 x 87 = $870; 4 x 87 = $348 -> 50% = $174; total $1,044 by hand.
- Test case: as above; Sophie identical. PASS.

## Edge-input handling notes
- Missing conversion factor -> TypeError; per-line weight validated via num(); packaging/discount are deterministic by status indicator; the total is the sum of integer-cents line payments. No NaN/Infinity path.

## A11y / keyboard notes
- A multi-line APC textarea (one "weight, status" per line) with a real `<label for>`, plus CF/wage/discount inputs each labeled; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
