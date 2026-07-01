# v12 audit - marburg-heart-score

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Bösner S, et al. CMAJ 2010;182(12):1295-1300 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/risk-v192.js marburgHeartScore()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- five 1-point criteria; 0–2 CAD unlikely (~3%), >= 3 higher (~23%).

## Boundary worked examples added
- covered in test/unit/risk-v192.test.js: a >= 3 threshold crossing.

## Edge-input handling notes
- boolean count; bounded 0–5; no arithmetic beyond the sum. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
