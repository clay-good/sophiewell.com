# v12 audit - who-growth-zscore

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards based on length/height, weight and age. Acta Paediatr Suppl. 2006;450:76-85. LMS tables transcribed byte-for-byte from the WHO 2006 standard as redistributed in the CDC NCHS "WHO Growth Chart" data files (weight-for-age and length-for-age, boys and girls, 0-24 mo), cross-verified against the WHO Child Growth Standards indicator tables.

`lib/peds-growth-v141.js whoGrowthZscore()` converts a measured weight or
recumbent length to an age- and sex-specific z-score via the WHO LMS transform
`z = ((X/M)^L - 1) / (L*S)` (length-for-age uses L = 1), reading
`lib/growth-lms-data.js WHO_WT_AGE / WHO_LEN_AGE`; the percentile is the
standard-normal CDF of z. Class A (Clinical Math & Conversions, Group E).

## Source-governance notes
- LMS arrays are compiled constants sourced verbatim (spec-v100 §5 / spec-v97).
- WHO bands: z below -2 low (underweight for weight-for-age, stunted for length-
  for-age), below -3 severely low, above +2 high.
- Reports the z/percentile/band only; the management decision stays with the
  clinician.

## Boundary worked examples added
- 6 mo boy, 5.5 kg -> z -3.27, severely low (crosses the -3 boundary).
- 0 mo boy at median weight (3.3464 kg) -> z ~ 0.
- 24 mo boy, 80 cm length -> stunted (length-for-age, L = 1 path).
- 12 mo girl, 9.5 kg -> within the WHO reference range.
- age > 24 mo, missing measure/value/sex -> valid:false.

## Edge-input handling notes
- Age outside 0-24 mo surfaces a complete-the-fields fallback pointing to the CDC
  BMI tool. `interpLMS` returns null outside range; `lmsToZ` guards M>0, S>0, X>0
  and the L->0 limit; no NaN/Infinity leak. Percentile clamped to [0.1, 99.9].

## A11y / keyboard notes
- Sex + measurement selects, two labeled number inputs; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
