# v12 audit - vte-bleed

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Klok FA, et al. Eur Respir J 2016;48(5):1369-1376 (weights and >= 2 cut-point cross-verified against the VTE-BLEED validation cohorts; >= 2 sources, spec-v97).

`lib/gaps-v185.js vteBleed()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- cancer 2; male+uncontrolled HTN 1; anemia, prior bleeding, age >= 60, renal dysfunction 1.5 each; >= 2 elevated.

## Boundary worked examples added
- anemia+age >= 60 = 3 (elevated); no factors 0; cancer alone 2; full house 9; single 1.5-point factor below cut.

## Edge-input handling notes
- weighted sum over booleans; the score is clamped to [0, 9]; non-boolean inputs coerced via a truthy helper. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
