# v12 audit - cha2ds2-va

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-3414.

`lib/cardio-v101.js cha2ds2Va()` scores age by band (>= 75 = 2, 65-74 = 1) plus CHF/LV dysfunction, hypertension, diabetes, prior stroke/TIA/TE (2), and vascular disease, with NO sex point (the 2024 ESC change). Total 0-8; >= 2 favors oral anticoagulation. Class B (ESC AF guideline; docs/citation-staleness.md row).

## Boundary worked examples added
- age 70 alone -> 1, below the OAC threshold.
- age 70 + hypertension -> 2, at/above the OAC threshold (flip).
- age 80 -> 2 (age band scores 2).
- all factors at >= 75 -> 8 maximum.
- fuzz: age clamped to [0,130]; bounded sum.

## Cross-implementation differential
- Reference: the 2024 ESC CHA2DS2-VA component weights and the score >= 2 anticoagulation framing. Match. PASS.

## Edge-input handling notes
- Age clamped to [0,130] before banding; a blank age surfaces valid:false rather than a NaN band. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
