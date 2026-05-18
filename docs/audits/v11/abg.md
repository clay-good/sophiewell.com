# v11 audit - ABG Interpretation Walkthrough (`abg`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Standard acid-base physiology (pH 7.35-7.45; PaCO2 35-45 mmHg; HCO3 22-26 mEq/L). Winter formula for metabolic-acidosis compensation: expected PaCO2 = 1.5 x HCO3 + 8 +/- 2 (Albert MS, Dell RB, Winters RW. Quantitative displacement of acid-base equilibrium in metabolic acidosis. Ann Intern Med 1967;66:312-322). Metabolic-alkalosis compensation: expected PaCO2 ~ 0.7 x (HCO3 - 24) + 40. ARDS Berlin definition P/F bands (Ranieri VM et al. JAMA 2012;307:2526-2533).

## Boundary examples added
- pH 7.30 / PaCO2 30 / HCO3 14: primary = Metabolic acidosis; Winter expected PaCO2 = 1.5*14+8 = 29 +/- 2 (range 27-31); measured 30 -> appropriate respiratory compensation. PASS (matches META example).
- pH 7.50 / PaCO2 50 / HCO3 38: Metabolic alkalosis; expected PaCO2 ~ 0.7*(38-24)+40 = 49.8; measured 50 -> appropriate compensation. PASS.
- pH 7.25 / PaCO2 60 / HCO3 26: Respiratory acidosis (acute; uncompensated). PASS.
- pH 7.40 / PaCO2 40 / HCO3 24 / PaO2 80 / FiO2 0.40: Normal pH; P/F = 200 -> moderate ARDS band per Berlin. PASS.

## Cross-implementation differential
- Winter compensation cross-checked against Up-To-Date "Approach to the adult with metabolic acidosis" and Marino's ICU Book 4e: expected PaCO2 within +/- 2 mmHg of 1.5*HCO3+8. Sophie matches within rounding.
- ARDS Berlin P/F bands (mild 200-300, moderate 100-200, severe <=100) cross-checked against the Berlin definition tables.

## Edge-input handling notes
- pH constrained to 6-8 via `num()` validator; PaCO2 / HCO3 reject negatives.
- Optional oxygenation inputs (PaO2, FiO2) cleanly omit A-a / P/F output when not provided (matches §3.1 step 4(c)).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Numeric inputs are labelled; compute button is keyboard-reachable; result block updates `aria-live`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
