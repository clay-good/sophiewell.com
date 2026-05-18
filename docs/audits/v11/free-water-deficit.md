# v11 audit - Free Water Deficit Calculator (`free-water-deficit`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Adrogue HJ, Madias NE. *Hypernatremia.* NEJM. 2000;342(20):1493-1499. Safety ceiling cross-checked against Sterns RH. NEJM. 2015;372(1):55-65 (10 mEq/L/24h cap on Na drop in chronic hypernatremia to avoid cerebral edema).

Formula: Free water deficit (L) = TBW × ((current Na / target Na) − 1). TBW factor matches `sodium-correction` (0.6 M < 65, 0.5 M ≥ 65 or F < 65, 0.45 F ≥ 65). Replacement rate (mL/h) = deficit L × 1000 / replaceOverHours. `lib/clinical-v5.js freeWaterDeficit()` enforces current Na > target Na (throws if not), and computes the implied Na drop rate per 24 h.

## Boundary examples added
- low: weight 70 kg, sex M, Na 148, target 145, 48 h -> TBW 42; deficit = 42 × (148/145 − 1) = 42 × 0.02069 = 0.869 L; rate = 869/48 = 18.1 mL/h; implied Na drop ((148-145)/48)×24 = 1.5 mEq/L/24h. Within 10 mEq/L/24h ceiling.
- mid (META example): weight 70 kg, sex M, Na 160, target 145, 48 h -> TBW 42; deficit = 42 × (160/145 − 1) = 42 × 0.10345 = 4.345 L (META expected "~4.3 L"); rate = 4345/48 = 90.5 mL/h; implied Na drop ((160-145)/48)×24 = 7.5 mEq/L/24h. Within ceiling.
- high (over-cap): weight 70 kg, sex M, Na 170, target 145, 24 h -> TBW 42; deficit = 42 × 0.1724 = 7.24 L; rate = 7240/24 = 301.7 mL/h; implied Na drop ((170-145)/24)×24 = 25 mEq/L/24h. Far exceeds 10 mEq/L/24h ceiling; safetyNote rendered.

Range-guard edges:
- current Na ≤ target Na throws `RangeError('currentNa must exceed targetNa; free-water deficit only applies to hypernatremia')`.
- weightKg below 1 or above 400 throws.
- replaceOverHours below 1 or above 168 (one week) throws.

## Cross-implementation differential
- Reference implementation: Adrogue-Madias 2000 hypernatremia formula.
- Test case: META example.
- Sophie result: deficit ~4.3 L; replace over 48 h.
- Reference result: 42 × (160/145 − 1) = 4.345 L.
- Delta: <0.5%. PASS.

## Edge-input handling notes
- TBW factor matches the `sodium-correction` tile, ensuring the two Adrogue-Madias workflows agree.
- The implied Na drop rate is computed and compared against the 10 mEq/L/24h Sterns 2015 ceiling; safetyNote prompts extending `replaceOverHours` or raising `targetNa` rather than just rendering a fast rate.
- Default `targetNa: 145` is the safe contemporary endpoint per Adrogue-Madias 2000; default `replaceOverHours: 48` matches the chronic-hypernatremia guidance.

## A11y / keyboard notes
- Five labeled number inputs + one sex select + one age input, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
