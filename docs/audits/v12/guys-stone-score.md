# v12 audit - guys-stone-score

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Thomas K, et al. Urology 2011;78(2):277-281 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/dermuro-v191.js guysStoneScore()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- Grade I–IV definitions with the published stone-free-rate expectations (81 / 72 / 35 / 29%).

## Boundary worked examples added
- covered in test/unit/dermuro-v191.test.js: Grade I-vs-IV pair.

## Edge-input handling notes
- grade selector validated to 1–4; complete-the-fields fallback outside. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
