# v12 audit - maggic

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Pocock SJ, Ariti CA, McMurray JJV, et al. Eur Heart J. 2013;34(19):1404-1413.

`lib/cardio-v102.js maggic()` is the MAGGIC integer-point model: age and systolic BP are scored from one of three columns by EF tier (< 30 / 30-39 / >= 40, the published age x EF and SBP x EF interactions), plus EF, NYHA, BMI, creatinine (mg/dL converted to umol/L x 88.4 for the published bands), and the binary factors. The integer total maps to the published 1-/3-year mortality lookup. Coefficients re-fetched + cross-verified (mdapp / Omnicalculator band tables; two independent open-source implementations of the 0-50 mortality lookup). Class A.

## Boundary worked examples added
- a worked case scores 28 points -> 20.9% one-year, 45.8% three-year.
- the age-point column differs by EF tier (EF 45 -> 9 vs EF 25 -> 6 at the same age) confirming the interaction.
- a best-case patient scores 3 -> 2.0% one-year.
- a maximal-risk sum exceeds 50 -> clamps to the score-50 row (84.2% / 98.5%), never undefined.
- fuzz: all continuous inputs clamped, lookup keyed by [0,50].

## Cross-implementation differential
- Reference: the Pocock 2013 EF/age/SBP/BMI/creatinine point tables and the 0-50 score->mortality lookup. Match. PASS.

## Edge-input handling notes
- Continuous inputs clamped to their band domain before indexing; the score->mortality table is keyed by the total clamped to [0,50] so an out-of-table index cannot read undefined; a blank required variable surfaces valid:false. Known minor source disagreement at score 20 (3-yr 0.247 per the per-integer table used vs 0.256 in the paper text) documented. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
