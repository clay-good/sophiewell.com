# v12 audit - matsuda-index

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Matsuda M, DeFronzo RA. Diabetes Care 1999;22(9):1462-1470 (10000 constant and units cross-verified against the Matsuda-DeFronzo derivation and independent OGTT-ISI references; >= 2 sources, spec-v97).

`lib/gaps-v185.js matsudaIndex()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- ISI = 10000/sqrt(G0*I0*Gmean*Imean), glucose mg/dL, insulin uU/mL.

## Boundary worked examples added
- insulin-resistant 1.45; sensitive > 2.5; monotonic with the input product; missing/non-positive -> valid:false.

## Edge-input handling notes
- the radicand (product of four positive inputs) is guarded > 0 before the square root; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
