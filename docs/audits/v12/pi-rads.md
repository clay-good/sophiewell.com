# v12 audit - pi-rads

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Turkbey B, et al. Eur Urol 2019;76(3):340-351 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/dermuro-v191.js piRads()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- zone-specific score-3 upgrades: peripheral DWI 3 + DCE positive → 4; transition T2W 3 + DWI 5 → 4, T2W 2 + DWI >= 4 → 3.

## Boundary worked examples added
- covered in test/unit/dermuro-v191.test.js: each zone's score-3 upgrade example.

## Edge-input handling notes
- zone and sequence scores validated to 1–5; a category is never assigned by the wrong sequence. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
