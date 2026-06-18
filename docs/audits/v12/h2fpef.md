# v12 audit - h2fpef

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Reddy YNV, Carter RE, Obokata M, et al. Circulation. 2018;138(9):861-870.

`lib/cardio-v102.js h2fpef()` sums BMI > 30 (2), >= 2 antihypertensives (1), atrial fibrillation (3), PASP > 35 (1), age > 60 (1), and E/e′ > 9 (1) to a 0-9 total, mapped to low (0-1) / intermediate (2-5) / high (6-9) HFpEF probability. Class A. Item weights cross-verified unanimous across sources.

## Boundary worked examples added
- AF + obesity -> 5, intermediate (upper edge).
- + age > 60 -> 6, high (band flip).
- all six factors -> 9 maximum.
- a single factor -> 1, low (rule-out edge).

## Cross-implementation differential
- Reference: the Reddy 2018 six-item weighted point model (BMI 2, AF 3, others 1). Match. PASS.

## Edge-input handling notes
- Boolean flags only; bounded integer sum, no non-finite leak. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
