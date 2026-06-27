# v12 audit - ocular-perfusion-pressure

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Costa VP, Harris A, Anderson D, et al. Acta Ophthalmol. 2014;92(4):e252-266 (MAP and OPP relations cross-verified against glaucoma-physiology references; ≥ 2 sources, spec-v97).

`lib/ophtho-v164.js ocularPerfusionPressure()` computes the Ocular Perfusion Pressure. Group E, Class A.

## Source-governance notes
- MAP = DBP + ⅓·(SBP − DBP); mean OPP = ⅔·MAP − IOP; systolic OPP = SBP − IOP; diastolic OPP = DBP − IOP.
- Reuses the established MAP formula; the ⅔ factor and three OPP variants checked against a worked BP/IOP example.
- A low mean OPP (≈ below 50 mmHg) is framed as one of several glaucoma-risk associations, not diagnostic.

## Boundary worked examples added
- 120/80, IOP 15 → mean OPP 47.2 (low), systolic 105, diastolic 65; DBP ≥ SBP → valid:false.

## Edge-input handling notes
- SBP/DBP/IOP guarded > 0; DBP < SBP enforced; subtraction range-checked. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Three labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
