# v11 audit - Sodium Correction Rate Planner (Adrogue-Madias) (`sodium-correction`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Adrogue HJ, Madias NE. *Hyponatremia.* NEJM. 2000;342(21):1581-1589 (hyponatremia). Adrogue HJ, Madias NE. *Hypernatremia.* NEJM. 2000;342(20):1493-1499 (hypernatremia). Safety ceilings cross-checked against Sterns RH. *Disorders of plasma sodium--causes, consequences, and correction.* NEJM. 2015;372(1):55-65 (8 mEq/L/24h chronic, 10-12 mEq/L/24h acute).

Adrogue-Madias formula: change in serum Na per liter of infusate = (infusate Na − serum Na) / (TBW + 1). TBW factor: 0.6 (M < 65), 0.5 (M ≥ 65 or F < 65), 0.45 (F ≥ 65). `lib/clinical-v5.js sodiumCorrection()` implements verbatim, surfaces a `directionMismatch` flag if the chosen infusate would push Na the wrong way (e.g., D5W in hyponatremia), and clamps `overCap` against the acuity-specific safety ceiling.

## Boundary examples added
- low (hyponatremia, 3% saline, META example): weight 70 kg, sex M, Na 110, infusate 3% saline (513 mEq/L), target ΔNa 8 mEq/24h, chronic -> TBW 0.6 × 70 = 42 L; change/L = (513 − 110) / (42+1) = 403/43 = 9.372 mEq/L per liter of 3% saline. Volume to raise by 8 = 8 / 9.372 = 0.854 L over 24 h; rate = 854/24 = 35.6 mL/h. Matches META expected text "About 0.85 L of 3% saline over 24 h". Within chronic 8-mEq cap.
- mid (hypernatremia, D5W): weight 60 kg, sex F, age 70, Na 158, infusate D5W (0 mEq/L), target ΔNa 8 mEq/24h -> elderly F factor 0.45; TBW 27 L; change/L = (0 − 158) / 28 = -5.643 mEq/L per liter D5W (lowering); desired change -8; volume = -8 / -5.643 = 1.418 L over 24 h; rate 59 mL/h. Within chronic 8-mEq cap.
- high (acute hyponatremia, over-cap): Na 105, target ΔNa 12 mEq/24h, acute -> overCap = (12 > 10) = true; safetyNote flags exceedance.

Direction-mismatch edge: hyponatremia + D5W -> `directionMismatch: true`, `volumeLiters: null`, `directionNote: "Selected infusate will not move Na toward target in hyponatremia"`.

## Cross-implementation differential
- Reference implementation: Adrogue-Madias 2000 NEJM Equation 1.
- Test case: META example.
- Sophie result: ~0.85 L of 3% saline over 24 h to raise Na by 8 mEq.
- Reference result: hand-trace (403/43 = 9.372 mEq/L per liter; 8/9.372 = 0.854 L).
- Delta: <0.5%. PASS.

## Edge-input handling notes
- TBW factor is a function of sex AND age (elderly ≥ 65 reduces factor by 0.1, matching Adrogue-Madias 2000 § Methods).
- Infusate is a closed-set select (3% saline, 0.9% saline, lactated Ringer's, 0.45% saline, D5W); arbitrary infusate Na is not accepted, preventing the most common transcription error.
- `directionMismatch` surfaces when the user picks an infusate that cannot move Na in the desired direction; volume / rate fields are blanked out rather than rendered as negative numbers.
- `overCap` against the 8 mEq/L/24h chronic ceiling (Sterns 2015) and 10 mEq/L/24h acute ceiling is a hard advisory; the safetyNote is rendered prominently to discourage rapid correction (osmotic demyelination risk).
- The function returns *both* a rate-based plan (preferred clinically) and a total-Na-deficit estimate (informational); the helper text discourages using the deficit as a one-shot dose.

## A11y / keyboard notes
- Five labeled inputs (weight, sex, age, currentNa, target) + one infusate select + one acuity radio, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
