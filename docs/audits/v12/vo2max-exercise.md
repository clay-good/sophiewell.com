# v12 audit - vo2max-exercise

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Bruce RA, et al. Am Heart J 1973;85(4):546-562; Cooper KH. JAMA 1968;203(3):201-204 (Bruce and Cooper regression coefficients cross-verified against independent VO2max references; >= 2 sources, spec-v97).

`lib/specialtymath-v186.js vo2maxExercise()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- Bruce men 14.76-1.379*T+0.451*T^2-0.012*T^3, women 4.38*T-3.9; Cooper (dist_m-504.9)/44.73; METs = VO2max/3.5.

## Boundary worked examples added
- Bruce man 10 min -> 34.1, 9.7 METs; Cooper 2400 m -> 42.4; women formula differs; method/time/sex/distance required.

## Edge-input handling notes
- protocol inputs are range-clamped; a missing method or method-specific input surfaces a fallback; output is finite-guarded. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
