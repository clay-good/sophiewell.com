# v11 audit - Weight-Based Dose (`weight-dose`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Standard pharmacology convention `total_dose = weight_kg × dose_per_kg`, identical to the per-kg dosing notation used in DailyMed labels and the AAP Red Book.

## Boundary examples added
- low: 0.5 kg neonate × 0.01 mg/kg = 0.005 mg
- mid: 70 kg adult × 1 mg/kg = 70 mg
- high: 250 kg × 30 mg/kg = 7500 mg

## Cross-implementation differential
- Reference implementation: hand calculation. The formula is multiplication; the only behavior to verify is that Sophie's `r3` rounder retains 3 significant figures without drift.
- Test case: 70 kg × 0.1 mg/kg (a typical adult anaphylaxis epinephrine dose, 0.01 mg/kg up to 0.5 mg cap — illustrative).
- Sophie result: 7 mg (exact).
- Reference result: 7 mg (exact).
- Delta: 0%. PASS.

## Edge-input handling notes
- `lib/clinical.js weightDose` rejects negative weight or per-kg dose via `num({min:0})`. PASS.
- Unit is a free-text field; the renderer surfaces a "Computed per-kg value is unusually large" warning when `total/weight > 100`, which covers the most common transcription error (mcg vs mg confusion at the input). PASS.
- No upper safety cap on absolute dose (intentionally — the tile cannot know the drug). The free-text unit and the warning together meet the spec-v4 §5 safety floor.

## A11y / keyboard notes
- Three inputs, all label-bound. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
