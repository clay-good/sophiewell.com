# v12 audit - lvot-stroke-volume

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Lang RM, et al (ASE/EACVI). J Am Soc Echocardiogr 2015;28(1):1-39 (cross-verified against the ASE chamber-quantification guideline; >= 2 sources, spec-v97). ASE does not match the issuer-acronym set (spec-v158 precedent).

`lib/gaps-v185.js lvotStrokeVolume()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- LVOT area = pi*(D/2)^2; SV = area*VTI; CO = SV*HR/1000; SVI = SV/BSA; CI = CO/BSA.

## Boundary worked examples added
- normal SVI (SV 83.6, CO 5.85, CI 3.08); low SVI band; area = pi*(D/2)^2; D 0 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- the LVOT diameter is guarded > 0; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
