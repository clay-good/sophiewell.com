# v11 audit - PREVENT 2023 10-year CVD Risk (race-free) (`prevent`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Khan SS, Matsushita K, Sang Y, et al. Development and Validation of the American Heart Association Predicting Risk of Cardiovascular Disease EVENTs (PREVENT) Equations. Circulation. 2024;149(6):430-449. Sophie implements the base 10-year total-CVD equation (no statin / antihypertensive use, no UACR / HbA1c / SDI terms). The equation is race-free by design; this is the central methodological difference from PCE.

## Boundary examples added
- Low edge: 30-year-old M, TC 170, HDL 60, SBP 110, BMI 22, eGFR 95 -> low single-digit 10-year total CVD risk. PASS.
- High edge: 75-year-old M, TC 250, HDL 30, SBP 170, BMI 35, eGFR 45 -> high band (>20% 10-year). PASS.
- META example (55yo M, TC 200, HDL 50, SBP 120, BMI 25, eGFR 90): lands in the borderline/low band for a healthy adult. PASS.
- Age-extension validation: PREVENT extends down to age 30 (unlike PCE 40-79); age 30 path returns a numeric result without divide-by-zero. PASS.

## Cross-implementation differential
- AHA PREVENT online calculator: META example returns a single-digit percent in the low band. Sophie matches within +/- 0.5%. PASS.
- Cross-checked the base-equation coefficient table against Khan 2024 Supplementary Table S3 (base equation, total CVD, 10-year).
- Disclaimer rendered: this is the base equation only; the extended PREVENT (with UACR / HbA1c / SDI) is intentionally not bundled to avoid implying inputs the local browser cannot validate.

## Edge-input handling notes
- Age constrained to 30-79 per PREVENT's validated range.
- Race-free by construction: no race input field exists; this is the visible contract with the source.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- All inputs labelled; compute button keyboard-reachable; result region updates aria-live. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
