# v12 audit - ann-arbor

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Carbone PP, et al. Cancer Res 1971; Lugano Cheson BD, et al. J Clin Oncol 2014;32(27):3059-3068 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-staging-v188.js annArbor()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- I/II/III/IV distribution mapping with A/B and E/S suffixes; limited vs advanced.

## Boundary worked examples added
- covered in test/unit/heme-staging-v188.test.js: I/II/III/IV distribution mapping with A/B and E/S suffixes; limited vs advanced.

## Edge-input handling notes
- enumerated-distribution guard; boolean modifiers; no arithmetic. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
