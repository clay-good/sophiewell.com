# v12 audit - bilateral-pay

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS Pub. 100-04 Claims Processing Manual, Ch. 12 40.7; the MPFS BILAT SURG indicator: 0 = modifier 50 not payable; 1 = 150% of the fee for the pair; 2 = already priced as bilateral (pay 100%); 3 = pay each side at full (200%); 9 = the bilateral concept does not apply.

`lib/billing-v78.js bilateralPay()` returns the payable amount for the bilateral service by indicator, with an explicit not-payable gate (payable: false, allowedCents: null) for indicators 0 and 9, in integer cents.

## Boundary examples added
- tile example: $500 line, indicator 1 -> 150% = $750.00.
- indicator 2 -> 100% = $500.00 (already priced bilateral; no 50% added on top).
- indicator 3 -> 200% = $1000.00 (pay each side full).
- indicator 0 -> not payable (hard gate, flagged); indicator 9 -> does not apply (hard gate).

## Cross-implementation differential
- Reference: MPFS BILAT SURG indicator table (Pub. 100-04 Ch. 12 40.7).
- Test case: $500 fee across indicators 1/2/3/0.
- Sophie result: $750 / $500 / $1000 / not-payable.
- Reference result: identical. PASS. The gate stops the two common errors (billing 50 on an indicator-0 code; expecting 200% where the code is already priced bilaterally).

## Edge-input handling notes
- Indicator validates as an integer in [0, 9]; out-of-range throws RangeError caught by safe(); a non-positive fee prompts rather than computing.

## A11y / keyboard notes
- One labeled money input and one labeled `<select>` enumerating every indicator with its meaning; output `aria-live="polite"`; the not-payable line uses the `flag` class. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
