# v11 audit - padua

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Barbar S, Noventa F, Rossetto V, et al. *A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score.* J Thromb Haemost. 2010;8(11):2450-2457. Table 4 (90-day VTE by Padua band) and §Results (>= 4 high-risk threshold).

Weighted 11-item model per Barbar 2010: active cancer 3, prior VTE 3, reduced mobility 3, known thrombophilia 3, recent (<= 1 month) trauma or surgery 2, age >= 70 = 1, heart and/or respiratory failure 1, acute MI or ischemic stroke 1, acute infection / rheumatologic disorder 1, BMI >= 30 = 1, ongoing hormonal treatment 1. Threshold >= 4 = high risk for VTE per Barbar 2010 §Results. `lib/scoring-v4.js padua()` implements the sum and the dichotomous band with the Barbar 2010 Table 4 90-day VTE rates (0.3% low, 11.0% high if untreated) surfaced in the interpretation block.

## Boundary examples added
- low: no criteria -> 0 (low risk; 90-day VTE 0.3% without prophylaxis).
- mid: age >= 70 + heart failure + acute infection + BMI >= 30 -> 4 (high risk; right at the threshold).
- high: every criterion positive -> 3 + 3 + 3 + 3 + 2 + 1 + 1 + 1 + 1 + 1 + 1 = 20 (high risk).

Threshold edge: active cancer alone -> 3 (low); active cancer + age >= 70 -> 4 (high). The 3 / 4 transition is the most clinically relevant boundary and is asserted explicitly.

## Cross-implementation differential
- Reference implementation: Barbar S, et al. J Thromb Haemost. 2010;8(11):2450-2457, Table 2 (weights) + Table 4 (outcomes).
- Test case: active cancer + age >= 70.
- Sophie result: 4, high risk.
- Reference result: 3 + 1 = 4, high risk per Barbar 2010 §Results.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Eleven checkboxes with per-item point weights printed in each label so the score breakdown is visible without the user having to compute it.
- "Recent trauma or surgery" matches Barbar 2010 (within the past month) and the label preserves that qualifier; "reduced mobility" matches Barbar 2010 (bedrest with bathroom privileges for >= 3 days).

## A11y / keyboard notes
- Eleven labeled checkboxes; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
