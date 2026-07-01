# v12 audit - lv-wall-stress

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Grossman W, et al. J Clin Invest 1975;56(1):56-64 (meridional wall stress cross-verified against Laplace-law derivations; 1 mmHg = 1.36 g/cm2 conversion cross-verified; >= 2 sources, spec-v97).

`lib/specialtymath-v186.js lvWallStress()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- sigma = P*r/(2*h); sigma (g/cm2) = 1.36*P*r/(2*h); sigma (10^3 dyn/cm2) = 1.33322*P*r/(2*h).

## Boundary worked examples added
- worked value 204 g/cm2 (~200 * 10^3 dyn/cm2); thicker wall lowers stress; scales with P and r; h 0 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- the wall-thickness h is guarded > 0 before the division; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
