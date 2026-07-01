# v12 audit - bed-eqd2

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Fowler JF. Br J Radiol 1989;62(740):679-694 (linear-quadratic BED/EQD2 cross-verified against the LQ-model radiotherapy references; >= 2 sources, spec-v97).

`lib/specialtymath-v186.js bedEqd2()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- BED = n*d*(1+d/(a/b)); EQD2 = BED/(1+2/(a/b)).

## Boundary worked examples added
- 30*2 Gy a/b 10 -> BED 72, EQD2 60; 2 Gy/fraction EQD2 == physical dose; late a/b 3 > tumor a/b 10 for hypofractionation; missing/zero -> valid:false.

## Edge-input handling notes
- n, d, and a/b are guarded > 0 before the divisions; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
