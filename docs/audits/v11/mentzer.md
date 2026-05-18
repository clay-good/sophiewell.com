# v11 audit - Mentzer Index (Microcytic Anemia Screen) (`mentzer`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Mentzer WC. Differentiation of iron deficiency from thalassaemia trait. Lancet. 1973;1(7808):882. Index = MCV (fL) / RBC (10^6/uL). Threshold: <13 favors beta-thalassemia trait; >13 favors iron-deficiency anemia. Sophie's `mentzerIndex` (lib/clinical-v5.js:238) computes the ratio exactly.

## Boundary examples added
- Low (beta-thal favored): MCV 65 / RBC 6.0 -> 65/6.0 = 10.83 -> "favors beta-thalassemia trait". PASS (matches META example).
- High (iron-deficiency favored): MCV 75 / RBC 4.0 -> 18.75 -> "favors iron-deficiency anemia". PASS.
- Mid (indeterminate boundary): MCV 78 / RBC 6.0 -> 13.0 -> right at the threshold; Sophie reports the numeric index plus the directional band per the source (clinician judgment at boundary). PASS.

## Cross-implementation differential
- Hand computation: ratios above verified by direct division; Sophie matches to 2 decimals.
- MDCalc Mentzer Index: META example returns 10.8 / "thalassemia trait suggested." Sophie matches. PASS.
- Cross-checked threshold direction (<13 = thal, >13 = IDA) against Mentzer 1973 and standard hematology references.

## Edge-input handling notes
- RBC field expects 10^6/uL units (e.g., 4.5, not 4,500,000); unit label is prominent in the input.
- Division-by-zero guarded: RBC = 0 rejected by `num()` with min > 0.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled numeric inputs; compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
