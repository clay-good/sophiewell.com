# v12 audit - flipi-2

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Federico M, et al. J Clin Oncol 2009;27(27):4555-4562 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-staging-v188.js flipi2()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- five 1-point factors; low 0, intermediate 1-2, high 3-5; distinct from FLIPI-1.

## Boundary worked examples added
- covered in test/unit/heme-staging-v188.test.js: five 1-point factors; low 0, intermediate 1-2, high 3-5; distinct from FLIPI-1.

## Edge-input handling notes
- boolean count; bounded 0-5; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
