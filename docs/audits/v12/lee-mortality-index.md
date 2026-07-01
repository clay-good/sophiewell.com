# v12 audit - lee-mortality-index

- Auditor: CG
- Date: 2026-07-01
- Citation re-verified against: Lee SJ, Lindquist K, Segal MR, Covinsky KE. JAMA. 2006;295(7):801-808.

`lib/ltcga-v180.js leeMortalityIndex()` sums a required age-band point (60–64=1
up to ≥85=7) with the checked comorbidity and functional-difficulty points to a
total of 0–26, then maps the total to the validation-cohort 4-year all-cause
mortality band by table lookup. Class A (fixed 2006 point index). A point-table
lookup — no exponentiation, no `1 − sigmoid(−bx)` complement — so the spec-v140
saturation hazard does not arise.

## Boundary worked examples added
- lowest band: age 60–64 alone -> 1 point, ~4% band.
- band flip 5 -> 6: cancer + heart failure at age 60–64 = 5 (4%) vs age 70–74 +
  heart failure + BMI<25 = 6 (15%), crossing the 0–5 / 6–9 boundary.
- band flips at 10 (42%) and 14 (64%); the two higher bands set `abnormal`.
- maximum 26 with every factor at the top age band -> 64% band.
- age required; a blank age surfaces a complete-the-fields fallback.

## Cross-implementation differential
- Reference: item points re-fetched and cross-verified across the original JAMA
  2006 paper (Table 3), the PubMed abstract / MDCalc reproduction, and the SoFOG
  "Score de Lee" PDF. Age 60–64=1 / 65–69=2 / 70–74=3 / 75–79=4 / 80–84=5 /
  ≥85=7; male +2; diabetes +1; cancer +2; lung disease +2; heart failure +2;
  current smoker +2; BMI<25 +1; difficulty bathing +2; walking several blocks +2;
  managing money +2; pushing/pulling heavy objects +1. Band cutpoints 0–5 / 6–9 /
  10–13 / ≥14 identical across sources; validation-cohort mortality 4% / 15% /
  42% / 64% (JAMA Table 4, abstract, MDCalc). The development cohort reports 3% /
  15% / 41% / 65% and is not blended. Match. PASS.

## Edge-input handling notes
- comorbidity/function items are checkboxes: an unchecked item simply does not
  score (mirrors "factor absent"); string '1' and boolean true both count.
- age is the only required field; the score is an integer sum, always finite.

## A11y / keyboard notes
- Labeled select + checkboxes; output aria-live="polite". 320px sweep passes with
  no horizontal scroll. Prognostic estimate framed as decision support; no
  end-of-life order in Sophie's voice.

## Defects opened
- none

## Status
- PASS
