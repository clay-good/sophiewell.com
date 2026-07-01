# v12 audit - gorlin

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Gorlin R, Gorlin SG. Am Heart J 1951;41(1):1-29 (aortic K 44.3 / mitral K 37.7 cross-verified against the Gorlin catheter-lab references; >= 2 sources, spec-v97).

`lib/gaps-v185.js gorlin()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- area = flow/(K*sqrt(grad)); flow = CO(mL/min)/(period*HR). Aortic K 44.3 (SEP), mitral 37.7 (DFP).

## Boundary worked examples added
- aortic severe 0.77 cm2; mitral moderate 1.05 cm2; mild > 1.5; grad/period 0 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- the mean-gradient sqrt and the period*HR divisor are guarded > 0; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
