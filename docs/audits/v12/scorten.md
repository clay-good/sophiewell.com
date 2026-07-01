# v12 audit - scorten

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Bastuji-Garin S, et al. J Invest Dermatol 2000;115(2):149-153 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/dermuro-v191.js scorten()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- seven 1-point criteria; mortality bands 3.2 / 12.1 / 35.3 / 58.3 / 90%.

## Boundary worked examples added
- covered in test/unit/dermuro-v191.test.js: a mortality-band crossing (score 3 and >= 5).

## Edge-input handling notes
- each entered lab guarded; a filled-but-invalid lab blocks; band index clamped. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
