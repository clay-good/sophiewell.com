# v12 audit - binet-cll

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Binet JL, et al. Cancer 1981;48(1):198-206 (stage boundaries / weights / cut-points cross-verified against >= 2 independent sources; spec-v97).

`lib/heme-staging-v188.js binetCll()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- A/B/C boundaries; anemia (<10) and thrombocytopenia (<100) both force stage C regardless of area count.

## Boundary worked examples added
- covered in test/unit/heme-staging-v188.test.js: A/B/C boundaries; anemia (<10) and thrombocytopenia (<100) both force stage C regardless of area count.

## Edge-input handling notes
- comparison and boolean/count inputs; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
