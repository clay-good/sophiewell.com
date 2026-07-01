# v12 audit - grobman-vbac

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Grobman WA, et al. Am J Obstet Gynecol 2021;225(6):664.e1-e7 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/risk-v192.js grobmanVbac()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- race-free 2021 logistic; uses weight + height (not BMI); split prior-vaginal-delivery terms; arrest-indication term. Computed in odds space (spec-v140).

## Boundary worked examples added
- covered in test/unit/risk-v192.test.js: a prior-VBAC vs none probability contrast.

## Edge-input handling notes
- logistic exponent clamped; probability in [0, 100]; odds-space compute, no 1 − sigmoid leak. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
