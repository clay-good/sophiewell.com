# v11 audit - ABG Interpretation Walkthrough (`abg`)

- Auditor: CG
- Date: 2026-06-10 (spec-v66 re-audit: respiratory compensation added)
- Citation re-verified against: Standard acid-base physiology (pH 7.35-7.45; PaCO2 35-45 mmHg; HCO3 22-26 mEq/L). Winter formula for metabolic-acidosis compensation: expected PaCO2 = 1.5 x HCO3 + 8 +/- 2 (Albert MS, Dell RB, Winters RW. Quantitative displacement of acid-base equilibrium in metabolic acidosis. Ann Intern Med 1967;66:312-322). Metabolic-alkalosis compensation: expected PaCO2 ~ 0.7 x (HCO3 - 24) + 40. **Respiratory compensation (spec-v66) via the Boston rules** (Narins RG, Emmett M. Simple and mixed acid-base disorders: a practical approach. Medicine (Baltimore) 1980;59(3):161-187): respiratory acidosis expected HCO3 = 24 + 0.1 x (PaCO2 - 40) acute, 24 + 0.35 x (PaCO2 - 40) chronic; respiratory alkalosis expected HCO3 = 24 + 0.2 x (PaCO2 - 40) acute, 24 + 0.4 x (PaCO2 - 40) chronic. ARDS Berlin definition P/F bands (Ranieri VM et al. JAMA 2012;307:2526-2533).

## Boundary examples added
- pH 7.30 / PaCO2 30 / HCO3 14: primary = Metabolic acidosis; Winter expected PaCO2 = 1.5*14+8 = 29 +/- 2 (range 27-31); measured 30 -> appropriate respiratory compensation. PASS (matches META example).
- pH 7.50 / PaCO2 50 / HCO3 38: Metabolic alkalosis; expected PaCO2 ~ 0.7*(38-24)+40 = 49.8; measured 50 -> appropriate compensation. PASS.
- pH 7.25 / PaCO2 60 / HCO3 26: Respiratory acidosis; Boston rules expected HCO3 = 24 + 0.1*(60-40) = 26 (acute) to 24 + 0.35*20 = 31 (chronic); measured 26 sits at the acute value -> acute, no superimposed metabolic process. PASS.
- pH 7.52 / PaCO2 28 / HCO3 22: Respiratory alkalosis; expected HCO3 = 24 + 0.2*(28-40) = 21.6 (acute) to 24 + 0.4*(-12) = 19.2 (chronic); measured 22 ~ acute value -> acute. PASS.
- pH 7.40 / PaCO2 40 / HCO3 24 / PaO2 80 / FiO2 0.40: Normal pH; P/F = 200 -> moderate ARDS band per Berlin. PASS.

## Cross-implementation differential
- Winter compensation cross-checked against Up-To-Date "Approach to the adult with metabolic acidosis" and Marino's ICU Book 4e: expected PaCO2 within +/- 2 mmHg of 1.5*HCO3+8. Sophie matches within rounding.
- Respiratory compensation (Boston rules) cross-checked against the Narins-Emmett 1980 coefficient table and Berend K, et al. N Engl J Med 2014;371:1434-1445 (acute resp acidosis HCO3 +1/10 mmHg = +0.1/mmHg; chronic +3.5/10 = +0.35/mmHg; acute resp alkalosis -2/10 = -0.2/mmHg; chronic -4/10 = -0.4/mmHg). Sophie reproduces these acute and chronic expected-HCO3 endpoints within rounding.
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
