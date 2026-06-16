# v12 audit - mehran-cin

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Mehran R, Aymong ED, Nikolsky E, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention. J Am Coll Cardiol. 2004;44(7):1393-1399.

`lib/nephro-v92.js mehranCin()` sums the eight weighted Mehran factors (hypotension 5, intra-aortic balloon pump 5, congestive heart failure 5, age > 75 = 4, anemia 3, diabetes 3, contrast volume 1 per 100 mL, eGFR 40-60 = 2 / 20-40 = 4 / < 20 = 6) and maps the total to the published bands (<= 5 low, 6-10 moderate, 11-15 high, >= 16 very high) with the cohort CIN and dialysis risk estimates.

## Boundary worked examples added
- CHF + diabetes + 300 mL contrast + eGFR 30 -> 15 (high, ~26.1%).
- Band edge 5/6: anemia + eGFR 50 = 5 low; CHF + 100 mL = 6 moderate.
- Band edge 10/11 and 15/16 (hypotension + IABP + CHF = 15 high; + diabetes = 18 very high).
- Contrast 200 mL -> 2 points; eGFR 15 -> 6, eGFR 80 -> 0; a blank optional factor contributes 0.

## Cross-implementation differential
- Reference: Mehran 2004 Table 4 point weights + the four risk strata (7.5 / 14.0 / 26.1 / 57.3% CIN, 0.04 / 0.12 / 1.09 / 12.6% dialysis). The weights and bands match. PASS.

## Edge-input handling notes
- Integer point arithmetic with no division; the contrast term (1 per 100 mL) is non-negative and the eGFR band term clamps to its published range. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Six labeled yes/no <select>s + two labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
