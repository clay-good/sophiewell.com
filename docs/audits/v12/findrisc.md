# v12 audit - findrisc

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Lindström J, Tuomilehto J. Diabetes Care 2003;26(3):725-731 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/risk-v192.js findrisc()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- full point table (age/BMI/sex-specific waist/activity/diet/BP-med/glucose/family); bands < 7 / 7–11 / 12–14 / 15–20 / > 20.

## Boundary worked examples added
- covered in test/unit/risk-v192.test.js: a band crossing (low → moderate → very high).

## Edge-input handling notes
- continuous inputs guarded > 0; point bands clamp; family/sex selectors default safely. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
