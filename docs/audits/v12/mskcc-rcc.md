# v12 audit - mskcc-rcc

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Motzer RJ, et al. J Clin Oncol 1999;17(8):2530-2540 (five factors and group cut-points cross-verified against the MSKCC risk model; >= 2 sources, spec-v97).

`lib/onc-staging-v187.js mskccRcc()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- five factors 1 point each; favorable 0, intermediate 1-2, poor >= 3.

## Boundary worked examples added
- two factors -> intermediate; group crossings; all five -> 5 (poor); no factors -> favorable.

## Edge-input handling notes
- boolean factors coerced via a truthy helper; the score is a bounded count; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
