# v12 audit - fick-cardiac-output

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Fick A (1870); LaFarge CG, Miettinen OS. Cardiovasc Res 1970;4(1):23-30 (cross-verified against the LaFarge assumed-VO2 references and the standard Fick derivation; >= 2 sources, spec-v97).

`lib/gaps-v185.js fickCardiacOutput()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- CO = VO2/[1.36*Hb*(SaO2-SvO2)*10]; CI = CO/BSA. LaFarge indexed VO2 male 138.1-11.49*ln(age)+0.378*HR, female 138.1-17.04*ln(age)+0.378*HR, times BSA.

## Boundary worked examples added
- measured VO2 (CO 4.9, CI 2.58 normal); estimated LaFarge path; low/high CI bands; SaO2 <= SvO2 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- the (SaO2-SvO2) denominator is guarded (SaO2 > SvO2 required); estimated VO2 guarded > 0; blank/non-finite surface a complete-the-fields fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
