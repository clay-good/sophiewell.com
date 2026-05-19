# v11 audit - rox

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Roca O, Caralt B, Messika J, et al. *An index combining respiratory rate and oxygenation to predict outcome of nasal high-flow therapy.* Am J Respir Crit Care Med. 2019;199(11):1368-1376. Equation ROX = (SpO2/FiO2) / RR; cutoffs at 2 / 6 / 12 h per Figure 2.

`lib/clinical-v4.js rox()` implements the published equation and the three-time-point band logic (success cutoff >=4.88; failure cutoffs <2.85 at 2 h, <3.47 at 6 h, <3.85 at 12 h).

## Boundary examples added
- low (failure-predicting at 12 h): SpO2 90, FiO2 0.6, RR 35 -> ROX = (90/0.6)/35 = 4.29; below the 12-h failure cutoff (<3.85)? Actually 4.29 > 3.85, so indeterminate at 12 h.
- failure-predicting: SpO2 85, FiO2 0.7, RR 40 -> ROX = (85/0.7)/40 = 3.04; failure at 12 h (<3.85).
- mid (tile example): SpO2 94, FiO2 0.5, RR 12 -> ROX = 188/12 = 15.67; success-predicting.
- high: SpO2 99, FiO2 0.3, RR 16 -> ROX = 330/16 = 20.6; deep into success band.

## Cross-implementation differential
- Reference: Roca O, et al. Am J Respir Crit Care Med. 2019;199(11):1368-1376 equation 1.
- Test case: SpO2 94, FiO2 0.5, RR 24.
- Sophie result: 7.83 (success band).
- Reference: (94/0.5)/24 = 188/24 = 7.833. PASS within 0.5%.

## Edge-input handling notes
- All three numeric inputs validated as positive; SpO2 must be <=100; FiO2 must be in (0,1].
- The time-point input picks the failure cutoff per Roca 2019 Figure 2 (<=2h, <=6h, else 12h band).

## A11y / keyboard notes
- Four labeled number inputs; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
