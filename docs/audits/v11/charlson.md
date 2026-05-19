# v11 audit - charlson

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Charlson ME, Pompei P, Ales KL, MacKenzie CR. *A new method of classifying prognostic comorbidity in longitudinal studies: development and validation.* J Chronic Dis. 1987;40(5):373-383. Table 3 (weights) and Table 4 (10-year mortality). Age adjustment per Charlson ME, et al. *Validation of a combined comorbidity index.* J Clin Epidemiol. 1994;47(11):1245-1251 (1 point per decade >=50, capped at 4 at >=80).

`lib/scoring-v4.js charlson()` implements the 19-comorbidity weighted sum per Charlson 1987 Table 3 plus the Charlson 1994 age adjustment. Severity dominance per Charlson 1987 §Methods: when a more-severe class is checked, the corresponding 1-pt class is suppressed (diabetes-end-organ suppresses uncomplicated diabetes; moderate/severe liver suppresses mild liver; metastatic solid tumor suppresses any tumor). Bands per Charlson 1987 Table 4: 0 (~12% 10-year mortality), 1-2 (~26%), 3-4 (~52%), >=5 (~85%).

## Boundary examples added
- low: age 40, no comorbidities -> 0 (~12% 10-year mortality per Charlson 1987 Table 4).
- mid (tile example): age 55 (age adjustment 1), no comorbidities -> 1 (1-2 band; ~26% per Charlson 1987 Table 4).
- high: age 75 (age adjustment 3) + CHF (1) + COPD (1) + metastatic solid tumor (6) -> 11 (>=5 band; ~85% per Charlson 1987 Table 4).
- severity dominance: diabetes-end-organ + diabetes-uncomplicated both checked -> contributes 2 (the 2-pt class only); mild + moderate/severe liver -> contributes 3; any tumor + metastatic -> contributes 6.

## Cross-implementation differential
- Reference implementation: Charlson ME, et al. J Chronic Dis. 1987;40(5):373-383 Table 3 weights plus Charlson 1994 age adjustment (hand sum).
- Test case: age 65 (age adjustment 2), MI, CHF, mild liver disease.
- Sophie result: 1 + 1 + 1 + 2 = 5 (>=5 band).
- Reference result: same sum 5; Charlson 1987 Table 4 >=5 band ~85%. PASS within one ordinal category.

## Edge-input handling notes
- Age input is a non-negative integer; age adjustment is `Math.min(4, Math.floor((age - 40) / 10))` capped at 4 for age >= 80 per Charlson 1994.
- Comorbidity inputs are 19 boolean checkboxes grouped under 1/2/3/6-point section headers.
- Severity dominance is applied silently inside the scoring function; the renderer surfaces the comorbidity-component and age-adjustment breakdown so the suppression is visible in the output.

## A11y / keyboard notes
- One labeled age input plus 19 labeled checkboxes grouped under four `<h3>` section headers (1/2/3/6-point); all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
