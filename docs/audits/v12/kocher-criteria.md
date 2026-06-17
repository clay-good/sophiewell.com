# v12 audit - kocher-criteria

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Kocher MS, Zurakowski D, Kasser JR. Differentiating between septic arthritis and transient synovitis of the hip in children: an evidence-based clinical prediction algorithm. J Bone Joint Surg Am. 1999;81(12):1662-1670.

`lib/peds-v98.js kocherCriteria()` counts the four predictors (non-weight-bearing, temperature > 38.5 C, ESR > 40 mm/hr, serum WBC > 12,000 cells/uL) and maps the count to the development-cohort predicted probability of septic arthritis. Class A.

## Boundary worked examples added
- 0 predictors -> < 0.2%.
- 2 predictors -> 40.0%.
- 4 predictors -> 99.6%. The 0-4 gradient is monotonic.

## Cross-implementation differential
- Reference: the Kocher 1999 probability table. Match. PASS.

## Edge-input handling notes
- Pure boolean count; no arithmetic input can produce NaN. Out-of-range count is impossible (0-4). Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
