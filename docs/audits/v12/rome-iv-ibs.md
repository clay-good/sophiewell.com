# v12 audit - rome-iv-ibs

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Lacy BE, et al. Gastroenterology 2016;150(6):1393-1407 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/hepgi-v190.js romeIvIbs()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- pain frequency + onset + >= 2 of three associated features; subtype IBS-C/D/M/U by predominant stool pattern.

## Boundary worked examples added
- covered in test/unit/hepgi-v190.test.js: met-vs-not pair with a subtype.

## Edge-input handling notes
- boolean rule encoded exactly; met requires pain + onset + >= 2 associated; no arithmetic. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
