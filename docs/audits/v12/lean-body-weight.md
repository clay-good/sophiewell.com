# v12 audit - lean-body-weight

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Janmahasatian S, et al. Clin Pharmacokinet 2005;44(10):1051-1065 (male/female constants cross-verified against the Janmahasatian derivation and independent LBW references; >= 2 sources, spec-v97).

`lib/gaps-v185.js leanBodyWeight()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- LBW = 9270*TBW/(6680+216*BMI) men, 9270*TBW/(8780+244*BMI) women; BMI = weight/height^2.

## Boundary worked examples added
- male 69.5 kg (BMI 30.9); female lower at the same body size; percent of TBW; sex required; blank -> valid:false.

## Edge-input handling notes
- the BMI denominator is guarded via positive height/weight; sex required; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
