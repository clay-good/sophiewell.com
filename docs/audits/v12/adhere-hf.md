# v12 audit - adhere-hf

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Fonarow GC, et al. JAMA 2005;293(5):572-580 (coefficients / boundaries / criteria cross-verified against >= 2 independent sources; spec-v97).

`lib/risk-v192.js adhereHf()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the treating team (spec-v11 §5.3).

## Source-governance notes
- CART thresholds BUN 43 / SBP 115 / creatinine 2.75; terminal-node mortality 2.1–21.9% (derivation figure values).

## Boundary worked examples added
- covered in test/unit/risk-v192.test.js: each terminal node incl. the high-risk node.

## Edge-input handling notes
- BUN/SBP guarded; creatinine required only for the deepest split; complete-the-fields fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
