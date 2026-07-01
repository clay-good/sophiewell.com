# v12 audit - palbi

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Liu PH, et al. J Gastroenterol Hepatol 2017;32(4):879-886 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/hepgi-v190.js palbi()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- PALBI linear predictor + grade cut-points −2.53 / −2.09; inputs in mg/dL, g/dL, 10^9/L (bilirubin ×17.1, albumin ×10 internally).

## Boundary worked examples added
- covered in test/unit/hepgi-v190.test.js: the two grade cut-points (grade 1 / 2 / 3 crossings).

## Edge-input handling notes
- labs guarded > 0; log domains finite; complete-the-fields fallback outside the domain. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
