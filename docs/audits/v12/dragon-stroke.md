# v12 audit - dragon-stroke

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Strbian D, Meretoja A, Ahlhelm FJ, et al. Predicting outcome of IV thrombolysis-treated ischemic stroke patients: the DRAGON score. Neurology. 2012;78(6):427-432 (re-fetched; point table cross-verified against MDCalc calc/1892 and the Medscape/QxMD calculator; the original CT-DRAGON, NOT the MRI-DRAGON variant).

`lib/neuro-v117.js dragonStroke()` sums the six DRAGON items to 0-10: dense
artery / early infarct on CT (0/+1/+2), prestroke mRS > 1 (+1), age
(<65=0/65-79=+1/>=80=+2), glucose > 8 mmol/L (+1), onset-to-treatment > 90 min
(+1), and NIHSS (0-4=0/5-9=+1/10-15=+2/>=16=+3). Class A.

## Boundary worked examples added
- both CT signs, mRS>1, age 82, high glucose, late tx, NIHSS 18 -> 10/10 miserable.
- no CT sign, age 50, normal glucose, early tx, NIHSS 3 -> 0/10 favorable.
- a mid case lands intermediate WITHOUT a fabricated percentage.
- age 65 and NIHSS 16 cross their band boundaries up.
- partial inputs render a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the point table is identical across MDCalc, Medscape/QxMD, and the
  Strbian 2012 derivation. NO-FABRICATION: the derivation publishes good outcome
  (mRS 0-2) and miserable outcome (mRS 5-6) only for the grouped extremes (0-1,
  8, 9-10); per-score percentages for the middle range (4-7) are NOT published,
  so the tile bands 0-3 favorable / 4-7 intermediate / 8-10 miserable and quotes
  only the robust published anchors -- it invents no middle-band rate. Match.
  PASS.

## Edge-input handling notes
- age, onset, NIHSS are required, non-negative; CT, mRS, glucose are
  select/booleans. A scalar fuzz arg yields a valid:false fallback; the total is
  a bounded integer sum (no logistic at render time), so no overflow path exists.

## A11y / keyboard notes
- One select, two checkboxes, three labeled number inputs; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
