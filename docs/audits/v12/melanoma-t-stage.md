# v12 audit - melanoma-t-stage

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Gershenwald JE, et al. CA Cancer J Clin 2017;67(6):472-492 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/dermuro-v191.js melanomaTStage()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- T1 0.8 mm split and ulceration a/b suffix; exactly 1.0 mm is T1; T element only.

## Boundary worked examples added
- covered in test/unit/dermuro-v191.test.js: T1a-vs-T1b (the 0.8 mm and ulceration logic) and T2b.

## Edge-input handling notes
- Breslow thickness guarded > 0 before the band lookup; complete-the-fields fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
