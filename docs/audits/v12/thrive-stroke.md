# v12 audit - thrive-stroke

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Flint AC, Cullen SP, Faigeles BS, Rao VA. Predicting long-term outcome after endovascular stroke treatment: the totaled health risks in vascular events (THRIVE) score. AJNR Am J Neuroradiol. 2010;31(7):1192-1196 (point table cross-verified against MDCalc, the Fonarow/Yu 2019 review PMC6437031, and the Chen 2019 reproduction PMC6790301).

`lib/neuro-v117.js thriveStroke()` sums the THRIVE items to 0-9: NIHSS
(<=10=0/11-20=+2/>=21=+4), age (<=59=0/60-79=+1/>=80=+2), and +1 each for
hypertension, diabetes, and atrial fibrillation. Class A.

## Boundary worked examples added
- NIHSS 22, age 82, HTN+DM+AFib -> 9/9, THRIVE III high risk (mortality ~56.4%).
- NIHSS 8, age 55, no comorbidity -> 0/9, THRIVE I low risk (good ~64.7%).
- a mid band (3-5) lands intermediate WITHOUT a fabricated percentage.
- NIHSS / age band boundaries: NIHSS 11 + age 60 -> 3; NIHSS 21 + age 80 -> 6.
- partial inputs render a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the point table (NIHSS 0/+2/+4, age 0/+1/+2, +1 per chronic disease)
  is identical across MDCalc and the two PMC reproductions; one WebFetch result
  mis-OCR'd "NIHSS >= 80" -- rejected as a typo for NIHSS >= 21 = +4.
  NO-FABRICATION: the derivation publishes good outcome and mortality for the
  extreme bands only (0-2: 64.7% / 5.9%; 6-9: 10.6% / 56.4%); the middle band
  (3-5) original-derivation rates are not confidently published, so the tile
  bands it intermediate with no fabricated percentage. Match. PASS.

## Edge-input handling notes
- NIHSS and age are required, non-negative; HTN/DM/AFib are booleans. The total
  is a bounded integer sum. A scalar fuzz arg yields a valid:false fallback.

## A11y / keyboard notes
- Two labeled number inputs, three checkboxes; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
