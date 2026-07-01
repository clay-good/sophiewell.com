# v12 audit - same-tt2r2

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Apostolakis S, et al. Chest 2013;144(5):1555-1563 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-risk-v189.js sameTt2r2()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- 0-8 point sum; cut at <=1 good vs >=2 poorer control.

## Boundary worked examples added
- covered in test/unit/heme-risk-v189.test.js: 0-8 point sum; cut at <=1 good vs >=2 poorer control.

## Edge-input handling notes
- boolean weighted sum; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
