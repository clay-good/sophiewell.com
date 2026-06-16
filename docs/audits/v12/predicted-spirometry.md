# v12 audit - predicted-spirometry

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Quanjer PH, Stanojevic S, Cole TJ, et al (Global Lung Function Initiative). Multi-ethnic reference values for spirometry for the 3-95-yr age range: the global lung function 2012 equations. Eur Respir J. 2012;40(6):1324-1343.

`lib/pulm-v91.js predictedSpirometry()` computes predicted FEV1, FVC and FEV1/FVC plus the lower limit of normal (LLN, 5th percentile) from the GLI-2012 LMS reference equations for the selected sex and ethnicity group. When a measured value is entered it reports the % predicted and the above/below-LLN flag. The GLI-2012 coefficient and spline sets are compiled module constants in `lib/gli-2012-data.js` (spec-v85 §5 - a compiled-constant set, NOT a `data/` dataset), transcribed from the GLI lookup table as embedded in the rspiro R package (Lytras T), which transcribes the ERS supplementary appendix.

## Boundary worked examples added
- Caucasian male age 40, height 175 cm -> predicted FEV1 4.08 L (LLN 3.23), FVC 5.05 L (LLN 4.02), FEV1/FVC 0.81 (LLN 0.70).
- measured FEV1 3.0 L -> 73.6% predicted, below LLN (3.23).
- Caucasian female age 30, height 165 cm -> predicted FEV1 3.32 L.
- ages 2 and 100 -> surfaced out-of-range fallback (no extrapolation).
- unknown ethnicity -> other/mixed coefficient set, surfaced.

## Cross-implementation differential
- Reference: GLI-2012 reference values as embedded in rspiro (RLookupTable.csv) and the published reference ranges. The 40-yr/175-cm Caucasian-male predicted FEV1 (4.08 L), FVC (5.05 L) and FEV1/FVC (0.81) and their LLNs reproduce the published values. PASS.

## Edge-input handling notes
- The LMS arithmetic guards every domain: age must be in the GLI 3-95 yr range and height > 0; the spline lookup clamps to the table ends; the L = 0 limb of the LLN formula uses the lognormal limit (M*exp(S*-1.645)). An ethnicity group outside the GLI sets falls back to the source's other/mixed set. Returns a surfaced valid:false fallback rather than a NaN. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two labeled <select> (sex, ethnicity) + four labeled numeric inputs (age, height, optional measured FEV1/FVC); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
