# v12 audit - hasford-cml

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Hasford J, et al. J Natl Cancer Inst 1998;90(11):850-858 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-staging-v188.js hasfordCml()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- weighted formula x1000; low <=780, intermediate 781-1480, high >1480 crossings.

## Boundary worked examples added
- covered in test/unit/heme-staging-v188.test.js: weighted formula x1000; low <=780, intermediate 781-1480, high >1480 crossings.

## Edge-input handling notes
- finite-/positive-guarded inputs; the multiply-only formula never divides. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
