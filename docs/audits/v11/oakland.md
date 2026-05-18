# v11 audit - oakland

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Oakland K, Jairath V, Uberoi R, et al. *Derivation and validation of a novel risk score for safe discharge after acute lower gastrointestinal bleeding: a modelling study.* Lancet Gastroenterol Hepatol. 2017;2(9):635-643. Table 2 (per-parameter weights) and Figure 3 (<=8 safe-discharge cutoff; endorsed by BSG 2019 guideline).

Seven-parameter weighted model (range 0-35) per Oakland 2017 Table 2: age (<40 = 0; 40-69 = 1; >=70 = 2); sex (F = 0; M = 1); previous LGIB admission (1); blood on DRE (1); pulse (<70 = 0; 70-89 = 1; 90-109 = 2; >=110 = 3); SBP (50-89 = 5; 90-119 = 4; 120-129 = 3; 130-159 = 2; >=160 = 0); hemoglobin in g/L (<70 = 22; 70-89 = 17; 90-109 = 13; 110-129 = 8; 130-159 = 4; >=160 = 0). The renderer accepts hemoglobin in g/dL and the implementation converts internally (1 g/dL = 10 g/L). Score <= 8 = safe for outpatient management (95% probability of safe discharge per Oakland 2017; cutoff endorsed by BSG 2019). `lib/scoring-v4.js oakland()` implements the seven-parameter sum and the dichotomous safe-discharge band.

## Boundary examples added
- low: 35yo F + HR 65 + SBP 165 + Hgb 17 g/dL (no prior LGIB, no DRE blood) -> 0 (safe for outpatient management).
- mid: 75yo M + prior LGIB + DRE blood + HR 105 + SBP 100 + Hgb 11 g/dL -> 2 + 1 + 1 + 1 + 2 + 4 + 8 = 19 (not safe; inpatient assessment).
- high: 80yo M + prior LGIB + DRE blood + HR 115 + SBP 60 + Hgb 6 g/dL -> 2 + 1 + 1 + 1 + 3 + 5 + 22 = 35 (the Oakland 2017 published maximum).

Threshold edge: 50yo F + HR 78 + SBP 130 + Hgb 13 g/dL = 1 + 0 + 0 + 0 + 1 + 2 + 4 = 8 (right at the <=8 safe-discharge cutoff). Adding prior LGIB = 9 (the first not-safe value).

## Cross-implementation differential
- Reference implementation: Oakland K, et al. Lancet Gastroenterol Hepatol. 2017;2(9):635-643, Table 2 weights + Figure 3 cutoff.
- Test case: 75yo M + prior LGIB + DRE blood + HR 105 + SBP 100 + Hgb 11 g/dL.
- Sophie result: 19, not-safe band.
- Reference result: 2 + 1 + 1 + 1 + 2 + 4 + 8 = 19; >8 places the patient outside the safe-discharge band per Oakland 2017 Figure 3.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Hemoglobin is entered in g/dL; the implementation multiplies by 10 to apply the published g/L bands. The renderer label calls out the g/dL unit explicitly.
- Age is a typed `number` input; the band edges of 40 and 70 are strict (`<40 = 0`, `<70 = 1`, `>=70 = 2`) per Oakland 2017 Table 2.

## A11y / keyboard notes
- Four labeled `number` inputs, one labeled select, two labeled checkboxes; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
