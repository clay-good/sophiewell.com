# v12 audit - imdc-rcc

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Heng DYC, et al. J Clin Oncol 2009;27(34):5794-5799 (six factors and group cut-points cross-verified against the IMDC validation cohorts; >= 2 sources, spec-v97).

`lib/onc-staging-v187.js imdcRcc()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- six factors 1 point each; favorable 0, intermediate 1-2, poor >= 3.

## Boundary worked examples added
- three factors -> poor; 0/1-2/>= 3 group crossings; all six -> 6 (poor); no factors -> favorable.

## Edge-input handling notes
- boolean factors coerced via a truthy helper; the score is a bounded count; no division. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
