# v12 audit - qp-qs

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Wilkinson JL. Heart 2001;85(1):113-120 (Qp/Qs shunt ratio cross-verified against catheter-lab and echo references; >= 2 sources, spec-v97).

`lib/gaps-v185.js qpQs()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- Qp/Qs = (SaO2-MvO2)/(PvO2-PaO2); PvO2 defaults to 98.

## Boundary worked examples added
- large L-to-R 2.69; no net shunt 1.0; moderate 1.8; equal PvO2/PaO2 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- the (PvO2-PaO2) denominator is guarded against zero; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
