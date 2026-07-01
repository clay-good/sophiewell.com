# v12 audit - pisa-eroa

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Zoghbi WA, et al (ASE). J Am Soc Echocardiogr 2017;30(4):303-371 (PISA formula and severity strata cross-verified against the ASE regurgitation guideline; >= 2 sources, spec-v97). ASE does not match the issuer-acronym set.

`lib/specialtymath-v186.js pisaEroa()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- flow = 2*pi*r^2*Va; EROA = flow/peak Vreg; RVol = EROA*VTIreg. Mitral EROA severe >= 0.40.

## Boundary worked examples added
- severe MR (EROA 0.41, RVol 48.9); mild < 0.20; moderate/severe crossing; peak Vreg 0 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- the peak-regurgitant-velocity divisor is guarded > 0; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
