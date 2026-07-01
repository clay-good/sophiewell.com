# v12 audit - rai-cll

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Rai KR, et al. Blood 1975;46(2):219-234 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-staging-v188.js raiCll()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- the highest feature sets the stage (0/I/II/III/IV); modified low/intermediate/high grouping.

## Boundary worked examples added
- covered in test/unit/heme-staging-v188.test.js: the highest feature sets the stage (0/I/II/III/IV); modified low/intermediate/high grouping.

## Edge-input handling notes
- lymphocytosis-required guard; bounded comparisons; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
