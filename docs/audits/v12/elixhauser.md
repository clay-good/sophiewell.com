# v12 audit - elixhauser

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: van Walraven C, et al. Med Care 2009;47(6):626-633 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-risk-v189.js elixhauser()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- signed van Walraven weights (-7 to +12); zero-weight conditions count but do not move the score.

## Boundary worked examples added
- covered in test/unit/heme-risk-v189.test.js: signed van Walraven weights (-7 to +12); zero-weight conditions count but do not move the score.

## Edge-input handling notes
- boolean signed sum; nine zero-weight conditions; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
