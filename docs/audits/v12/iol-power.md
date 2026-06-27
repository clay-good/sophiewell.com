# v12 audit - iol-power

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Sanders DR, Retzlaff J, Kraff MC. J Cataract Refract Surg. 1988;14(2):136-141 (base formula coefficients 0.9/2.5 and the axial-length A-constant band table cross-verified against StatPearls NBK589643, AAO, and Wikipedia; ≥ 2 sources, spec-v97).

`lib/ophtho-v164.js iolPower()` computes the IOL Power (SRK II). Group E, Class A.

## Source-governance notes
- P = A1 − 0.9·K − 2.5·AL; A1 = A-constant + axial-length adjustment (AL<20 +3, 20–<21 +2, 21–<22 +1, 22–<24.5 0, ≥24.5 −0.5).
- Refraction correction ships the documented single SRK refractive factor 1.25 with an explicit caveat — the per-power breakpoint of the factor is NOT uniformly published and was not implemented as a cited fact.
- Renderer states SRK II is a regression formula superseded by optical formulas and does not replace device biometry.

## Boundary worked examples added
- A 118.4, AL 23.5, K 44 → emmetropic 20.05 D; AL-band boundaries 20/21/22/24.5 mm resolve to +2/+1/0/−0.5; target −2 D → 22.55 D.

## Edge-input handling notes
- AL/K/A-constant guarded > 0; target refraction range-checked to [−10,10]; −0 logMAR-style artifacts not applicable here. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Four labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
