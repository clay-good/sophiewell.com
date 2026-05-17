# v11 audit - Concentration-to-Rate (`conc-rate`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Standard ICU infusion formula `rate_mL_per_hr = (dose_per_min / concentration_per_mL) × 60`, the same identity used in the AACN Critical Care Nursing reference and every major infusion-pump program (Alaris, Plum 360).

## Boundary examples added
- low (units/hr path): heparin 1000 units/hr at 50 units/mL -> dosePerMin = 16.667 units/min; mL/min = 16.667/50 = 0.3333; mL/hr = 20.00
- mid (mcg/kg/min path): norepinephrine 0.1 mcg/kg/min × 70 kg with 0.064 mg/mL bag (= 64 mcg/mL standard premix) -> dosePerMin = 0.007 mg/min; mL/min = 0.007/0.064 = 0.10938; mL/hr = 6.5625 -> r2 = 6.56
- high (mg/min path): magnesium sulfate 2 g/hr (≈33.33 mg/min) at 80 mg/mL premix -> mL/min = 33.33/80 = 0.4167; mL/hr = 25.00

## Cross-implementation differential
- Reference implementation: hand calculation; also corroborated against the worked-example column on the bedside reference card for noradrenaline 0.064 mg/mL premixes.
- Test case: norepinephrine 0.1 mcg/kg/min, 70 kg, conc = 0.064 mg/mL.
- Sophie result: 6.56 mL/hr.
- Reference result: 6.5625 mL/hr (manual).
- Delta: 0.0% (rounding to two decimals, well within the ±0.5% spec-v11 §3.1.3 tolerance). PASS.

## Edge-input handling notes
- `lib/clinical.js concentrationToRate` rejects `concentrationValue < 1e-7` (positive only) and requires `weightKg > 0` only on the `mcg/kg/min` path. Unknown dose unit throws a typed error and surfaces in the muted result paragraph. PASS.
- The unit drop-downs are closed lists (mcg/kg/min, mcg/min, mg/min, units/hr, units/min) - users cannot type free text into the unit field. PASS.
- The preset cheat-sheet under the form documents seven standard premix concentrations so the user can copy/paste from real bedside pharmacy inventory. PASS.

## A11y / keyboard notes
- Five form controls, all label-bound; selects fall through `Tab` in source order. Output `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
