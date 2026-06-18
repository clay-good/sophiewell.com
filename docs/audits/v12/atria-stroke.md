# v12 audit - atria-stroke

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Singer DE, Chang Y, Borowsky LH, et al. J Am Heart Assoc. 2013;2(3):e000250.

`lib/cardio-v101.js atriaStroke()` selects the age-point column from the prior-stroke flag BEFORE summing (the published age x prior-stroke interaction; with a prior stroke the < 65 band = 8 scores above the 65-84 bands = 7), then adds female sex, diabetes, CHF, hypertension, proteinuria, and eGFR < 45/ESRD (1 each). Total 0-15: low 0-5, intermediate 6, high 7-15. Class A.

## Boundary worked examples added
- age 60 no prior stroke -> 0 (low).
- age 60 WITH prior stroke -> 8 (high; column flip).
- non-monotonic check: prior-stroke <65 (8) > 65-74 (7).
- age 80 + 1 factor -> 6 (intermediate).
- all factors at >= 85 with prior stroke -> 15 maximum.
- fuzz: age clamped; column chosen before sum.

## Cross-implementation differential
- Reference: the Singer 2013 dual age-column point table (no-prior-stroke 0/3/5/6, prior-stroke 8/7/7/9) cross-verified against MDCalc and the source PMC table. Match. PASS.

## Edge-input handling notes
- Age clamped to [0,130] then banded; the prior-stroke flag selects the column before summing so a fuzzed age never reads the wrong column; a blank age surfaces valid:false. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
