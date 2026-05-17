# v11 audit - Vasopressor Dose to Rate (`vasopressor`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Standard ICU infusion math `mL/hr = (dose × weight × 60) / concentration_mcg/mL`, identical to the worked examples in Marino's *The ICU Book* (4e), ch. 53, and to the bedside reference card distributed by ISMP for high-alert vasopressor concentrations.

## Boundary examples added
- low: norepinephrine 0.05 mcg/kg/min × 60 kg, 16 mcg/mL premix (4 mg / 250 mL) -> ugPerMin = 3.0; mL/hr = 3.0/16 × 60 = 11.25
- mid: norepinephrine 0.1 mcg/kg/min × 70 kg, 64 mcg/mL premix (16 mg / 250 mL) -> ugPerMin = 7.0; mL/hr = 7.0/64 × 60 = 6.5625 -> toFixed(2) = "6.56" (META example value)
- high: epinephrine 0.5 mcg/kg/min × 80 kg, 16 mcg/mL premix -> ugPerMin = 40.0; mL/hr = 40/16 × 60 = 150.00

Reverse-direction examples (rate -> dose):
- 6.56 mL/hr at 64 mcg/mL for 70 kg, mcg/kg/min: ugPerMin = 6.56 × 64 / 60 = 6.9973; dose = 6.9973 / 70 = 0.09996 -> ≈ 0.100 mcg/kg/min (matches forward direction within 0.04%).

## Cross-implementation differential
- Reference implementation: Marino *ICU Book* (4e) ch. 53 worked example for norepinephrine 0.1 mcg/kg/min × 70 kg at the standard 16 mg / 250 mL premix (64 mcg/mL) -> 6.5625 mL/hr.
- Test case: same as Marino's published example.
- Sophie result: 6.56 mL/hr.
- Reference result: 6.5625 mL/hr.
- Delta: 0.04% (rounding to 2 dp). PASS.

## Edge-input handling notes
- `lib/medication-v4.js vasopressorRateMlHr` rejects non-positive concentration with a typed `RangeError`; requires `weightKg > 0` only on the weight-based path (mcg/kg/min). Both forward and reverse helpers throw a typed error on unknown units, which the renderer surfaces in a muted paragraph. PASS.
- The drug picker is a closed select sourced from `data/vasopressor-doses/vasopressors.json`; the renderer also surfaces each drug's typical-range string (e.g., "0.05-0.5 mcg/kg/min" for norepinephrine) so an out-of-range dose is visually obvious. PASS.
- Vasopressin is encoded as `units/min` in the shard but the wrapper maps it to mcg/min for the math; the audit confirms the math is unit-agnostic (the wrapper treats both as "amount per minute"), but the visible label retains `units` for the user, so no value is silently re-labelled. PASS.

## A11y / keyboard notes
- Five form controls + select; all label-bound. Output `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
