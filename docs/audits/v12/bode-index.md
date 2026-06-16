# v12 audit - bode-index

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Celli BR, Cote CG, Marin JM, et al. The body-mass index, airflow obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary disease. N Engl J Med. 2004;350(10):1005-1012.

`lib/pulm-v91.js bodeIndex()` sums four point variables (0-10): BMI (<= 21 = 1), airflow obstruction (FEV1% >= 65 = 0, 50-64 = 1, 36-49 = 2, <= 35 = 3), dyspnea (mMRC 0-1 = 0, 2 = 1, 3 = 2, 4 = 3), and exercise capacity (6MWD >= 350 m = 0, 250-349 = 1, 150-249 = 2, <= 149 = 3). The total maps to the cited approximate 4-year survival quartile (0-2 ~80%, 3-4 ~67%, 5-6 ~57%, 7-10 ~18%). All four variables are required before a total/quartile is reported.

## Boundary worked examples added
- BMI 24, FEV1 45%, mMRC 2, 6MWD 300 -> 0+2+1+1 = 4 (quartile 3-4, ~67%).
- Survival-quartile flip: score 2 (band 0-2) vs 3 (band 3-4) via a single BMI point.
- BMI cut-point 21 -> 1, 21.1 -> 0; 6MWD 350 -> 0, 349 -> 1, 149 -> 3.
- Max score 10 (quartile 7-10, ~18%).

## Cross-implementation differential
- Reference: Celli 2004 Table 1 point assignment + Figure 2 survival quartiles. The point cut-points and the four quartile survival figures match. PASS.

## Edge-input handling notes
- The mMRC grade is clamped to its 0-4 domain (a stray value can never index an undefined point). Partial input yields "(complete all fields)", not a half-computed score. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Three labeled numeric inputs + one labeled mMRC <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
