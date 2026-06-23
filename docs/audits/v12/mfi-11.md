# v12 audit - mfi-11

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Velanovich V, Antoine H, Swartz A, et al. Accumulating deficits to the point of frailty: a national surgical quality improvement program study. J Surg Res. 2013;183(1):104-110. The eleven deficits and the count/11 fraction were cross-verified across 2+ sources.

`lib/frailty-v143.js mfi11()` counts eleven comorbidity/functional deficits
(diabetes, dependent functional status, COPD/pneumonia, CHF, MI history, prior
cardiac intervention/angina, hypertension, peripheral vascular disease/rest pain,
impaired sensorium, TIA/CVA, CVA with deficit) and reports them as a fraction of
11. Class A.

## Source-governance notes
- The divisor is the FIXED constant 11; no division-by-zero path exists
  (spec-v143 §3). The fraction is rounded to one decimal for display (fractionPct)
  while the integer count drives any threshold logic.
- The original accumulated-deficit index; a higher fraction tracks rising
  postoperative morbidity and mortality. The validated 5-item mFI-5 performs
  comparably and is cross-linked (both kept; mFI-11 is the original).

## Boundary worked examples added
- no deficits -> 0/11, 0%.
- three deficits -> 3/11 = 27.3%.
- the divisor is the fixed constant 11 (all eleven -> 100%).
- unrecognized keys are ignored, fraction stays finite.

## Edge-input handling notes
- Each deficit is a checkbox coerced through onFlag(). A bounded count over a
  fixed divisor -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Eleven labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
