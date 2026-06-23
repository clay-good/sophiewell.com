# v12 audit - peds-bmi-percentile

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC growth charts for the United States: methods and development. Vital Health Stat 11. 2002;(246):1-190. LMS coefficients transcribed byte-for-byte from the CDC NCHS published "Percentile Data Files with LMS Values" (bmiagerev.csv), cross-verified against the CDC published percentile columns in the same file.

`lib/peds-growth-v141.js pedsBmiPercentile()` converts a measured BMI to an age-
and sex-specific z-score via the CDC LMS transform `z = ((BMI/M)^L - 1) / (L*S)`
(reading `lib/growth-lms-data.js CDC_BMI_AGE`), then the percentile as the
standard-normal CDF of z. Class A (Clinical Math & Conversions, Group E).

## Source-governance notes
- LMS arrays are compiled constants sourced verbatim (spec-v100 §5 / spec-v97);
  not fabricated and not recalled. The data module header records the per-table
  source and accessed date.
- Weight-status bands are the CDC cutoffs: <5th underweight, 5th-<85th healthy,
  85th-<95th overweight, >=95th obese.
- Reports the percentile/z/band only; the management decision stays with the
  clinician (spec-v11 §5.3).

## Boundary worked examples added
- 16 y boy, BMI 30 -> 98th percentile (z 1.97), obese (crosses the 95th boundary).
- 8 y girl, weight 25 kg + height 128 cm -> BMI 15.3, healthy weight (derived path).
- 10 y boy at the median BMI -> z near 0.
- 5 y boy, BMI 12.5 -> underweight (under the 5th percentile).
- age < 2, age > 20, missing sex/BMI -> valid:false.

## Edge-input handling notes
- Age outside 2-20 yr surfaces a complete-the-fields fallback pointing to the WHO
  0-2 yr tool. `interpLMS` returns null outside the tabulated range; `lmsToZ`
  guards M>0, S>0, X>0 and the L->0 branch, so no NaN/Infinity can leak. The
  percentile is clamped to [0.1, 99.9] so a copied value never reads as certainty.

## A11y / keyboard notes
- Sex select + four labeled number inputs; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none
