# v12 audit - meld-na

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Kim WR, et al. N Engl J Med 2008;359(10):1018-1026 (OPTN/UNOS operational coefficients) (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/hepgi-v190.js meldNa()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- MELD(i) flooring/capping; sodium applied only when MELD > 11; Na bounded 125–137; score bounded 6–40.

## Boundary worked examples added
- covered in test/unit/hepgi-v190.test.js: a hyponatremia adjustment, all-labs-floored floor, and a dialysis case.

## Edge-input handling notes
- labs floored at 1.0, creatinine capped at 4.0, sodium bounded; score bounded 6–40 so no out-of-range leak. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
