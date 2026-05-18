# v11 audit - maddrey-lille

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Maddrey WC, Boitnott JK, Bedine MS, et al. *Corticosteroid therapy of alcoholic hepatitis.* Gastroenterology. 1978;75(2):193-199 (DF formula and the >=32 severe-disease cutoff in §Results); plus Louvet A, Naveau S, Abdelnour M, et al. *The Lille model: a new tool for therapeutic strategy in patients with severe alcoholic hepatitis treated with steroids.* Hepatology. 2007;45(6):1348-1354 (Lille equation 2 and the 0.45 non-response cutoff).

`lib/scoring-v4.js maddreyDf()` implements DF = 4.6 * (patient PT - control PT) + bilirubin (mg/dL); cutoff DF >= 32 = severe alcoholic hepatitis per Maddrey 1978 §Results.

`lib/scoring-v4.js lille()` implements the Louvet 2007 equation in SI units internally (1 mg/dL bilirubin = 17.1 umol/L; 1 g/dL albumin = 10 g/L). The renal-insufficiency flag is 1 when creatinine > 1.3 mg/dL (~115 umol/L) and 0 otherwise. Lille = exp(-R)/(1+exp(-R)) per Louvet 2007 equation 2, with the 0.45 cutoff for non-response to steroids.

The two scores ship as one card because Lille is only interpretable in the context of corticosteroid therapy initiated for a Maddrey DF >= 32 patient.

## Boundary examples added (Maddrey DF)
- low: patient PT 13, control PT 12, bilirubin 1 -> 4.6*(13-12) + 1 = 5.6 (not severe per Maddrey 1978).
- mid: patient PT 20, control PT 12, bilirubin 10 -> 4.6*8 + 10 = 46.8 (severe alcoholic hepatitis per Maddrey 1978). Tile empty-state example.
- high: patient PT 30, control PT 12, bilirubin 20 -> 4.6*18 + 20 = 102.8 (deep into severe band).

## Boundary examples added (Lille)
- low: age 50, alb 3.0 g/dL, cr 0.9 mg/dL, bili day 0 10 mg/dL, bili day 7 6 mg/dL, PT 20 -> R ~= 2.375; Lille ~= 0.085 (predicts response to steroids per Louvet 2007).
- mid (cutoff-adjacent): age 60, alb 2.5 g/dL, cr 1.0 mg/dL, bili day 0 12 mg/dL, bili day 7 11 mg/dL, PT 22 -> Lille around the 0.45 cutoff; tested in the unit suite.
- high: age 65, alb 2.0 g/dL, cr 1.5 mg/dL, bili day 0 15 mg/dL, bili day 7 15 mg/dL, PT 25 -> R ~= -2.548; Lille ~= 0.93 (predicts non-response per Louvet 2007).

## Cross-implementation differential
- DF reference: Maddrey 1978 §Methods formula (hand calculation). For PT 20, control 12, bili 10: 4.6*8 + 10 = 46.8. Sophie returns 46.8. PASS.
- Lille reference: Louvet 2007 equation 2 (hand calculation). For the Lille low example above, R = 3.19 - 5.05 + 4.41 + 1.1286 - 1.1115 - 0.192 = 2.3751; Lille = e^-2.3751 / (1 + e^-2.3751) = 0.0852. Sophie returns 0.0852. PASS within 0.5%.

## Edge-input handling notes
- All numeric inputs must be positive (bilirubin and bilirubin day 7 may be zero per the formula; the others must be positive). Out-of-range inputs throw RangeError surfaced by the renderer's `safe()` guard.
- Bilirubin entered in mg/dL (US convention); converted to umol/L internally for the Louvet 2007 equation (which is in SI).
- Albumin entered in g/dL; converted to g/L internally.
- Creatinine entered in mg/dL; renal-insufficiency threshold > 1.3 mg/dL per Louvet 2007 §Methods.

## A11y / keyboard notes
- Nine labeled `number` inputs grouped under `<h3>` section headers (Maddrey DF and Lille); all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
