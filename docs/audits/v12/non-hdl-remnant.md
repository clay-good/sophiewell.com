# v12 audit - non-hdl-remnant

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Varbo A, Benn M, Tybjaerg-Hansen A, et al. J Am Coll Cardiol. 2013;61(4):427-436.

`lib/cvrisk-v103.js nonHdlRemnant()` is the non-HDL and remnant-cholesterol arithmetic identity: non-HDL = total cholesterol - HDL; remnant = total - HDL - LDL. The entered unit (mg/dL or mmol/L) is preserved and the matching guideline non-HDL target is shown. Class A (arithmetic identity, no coefficients).

## Boundary worked examples added
- TC 200, HDL 50, LDL 120 mg/dL gives non-HDL 150 (at or above the 130 mg/dL target) and remnant 30.
- non-HDL crossing the 130 mg/dL target is detected (160/50 -> 110 below; 200/50 -> 150 at/above).
- without an LDL, remnant is not computed and the tile prompts for LDL.
- an implausible negative remnant (LDL + HDL > TC) is flagged as a data-entry error rather than printing a negative concentration.
- the mmol/L unit is preserved with a 3.4 mmol/L target.

## Cross-implementation differential
- Reference: the Varbo 2013 non-HDL / remnant definitions. Match. PASS.

## Edge-input handling notes
- Arithmetic identity with no overflow surface; a blank total or HDL surfaces valid:false; a negative remnant is flagged, not printed. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs and a unit select; output aria-live="polite". 320px sweep passes with no horizontal scroll. Cross-links ldl-calc.

## Defects opened
- none

## Status
- PASS
