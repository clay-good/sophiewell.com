# v12 audit - chads2

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Gage BF, Waterman AD, Shannon W, et al. JAMA. 2001;285(22):2864-2870.

`lib/cardio-v101.js chads2()` sums CHF (1), hypertension (1), age >= 75 (1), diabetes (1), and prior stroke/TIA (2) to a 0-6 total and reports the adjusted annual stroke rate from the original NRAF derivation table (0 = 1.9%/yr ... 6 = 18.2%/yr). Class A.

## Boundary worked examples added
- hypertension alone -> 1, 2.8%/yr.
- prior stroke (counts 2) -> 2, 4.0%/yr (band flip vs score 1).
- all factors -> 6, 18.2%/yr.
- fuzz: bounded integer sum, no non-finite leak.

## Cross-implementation differential
- Reference: the Gage 2001 point weights and the NRAF stroke-rate table. Match. PASS.

## Edge-input handling notes
- Boolean flags only; the rate array is indexed by the clamped 0-6 total, so an out-of-range index is impossible. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
