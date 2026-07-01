# v12 audit - msmart

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Mikhael JR, et al. Mayo Clin Proc 2013;88(4):360-376 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-risk-v189.js msmart()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- standard vs high risk; double hit (2) and triple hit (>=3) naming.

## Boundary worked examples added
- covered in test/unit/heme-risk-v189.test.js: standard vs high risk; double hit (2) and triple hit (>=3) naming.

## Edge-input handling notes
- boolean count; no arithmetic beyond a bounded sum. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
