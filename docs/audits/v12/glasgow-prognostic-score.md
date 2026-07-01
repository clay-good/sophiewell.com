# v12 audit - glasgow-prognostic-score

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: McMillan DC. Cancer Treat Rev 2013;39(5):534-540 (mGPS CRP 10 mg/L and albumin 3.5 g/dL cut-points cross-verified against the modified-GPS literature; >= 2 sources, spec-v97).

`lib/onc-staging-v187.js glasgowPrognosticScore()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- CRP <= 10 -> 0; CRP > 10 with albumin >= 3.5 -> 1; CRP > 10 and albumin < 3.5 -> 2.

## Boundary worked examples added
- elevated CRP + hypoalbuminemia -> 2; CRP <= 10 -> 0; CRP > 10 preserved albumin -> 1; the 3.5 albumin boundary splits 1 vs 2; missing -> valid:false.

## Edge-input handling notes
- CRP (>= 0) and albumin (> 0) are range-guarded; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
