# v11 audit - Pediatric Weight-to-Dose Calculator (`peds-weight-dose`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Per-recipe FDA labeling on DailyMed for epinephrine, atropine, amiodarone, naloxone, dextrose D10, and PALS dosing for fluid bolus. PEDS_DOSE_RECIPES in [lib/field.js](../../../lib/field.js) lines 16-25 lists the per-kg numerator, cap, and floor for each recipe; verified against AHA PALS / standard prehospital pediatric resuscitation literature. Spec-v11 §3.3 step 7 (peds): pediatric dose errors are especially high-stakes; this tile carries the warning prominently and the math is the worst failure mode this site has.

## Boundary examples added
`pedsDose(weightKg, recipe)` returns `weightKg * perKg`, floored at `min` if defined, capped at `cap` if defined.
- low (epinephrine-iv-io, 3 kg): 3 x 0.01 = 0.03 mg IV/IO. PASS.
- mid (META example: epinephrine-iv-io, 10 kg): 10 x 0.01 = 0.1 mg IV/IO. PASS (matches META expected).
- cap-hit (epinephrine-iv-io, 200 kg): 200 x 0.01 = 2 mg, capped to 1 mg per FDA label; `capped: true` flag emits the cap-exceeded notice in the renderer. PASS.
- floor-hit (atropine, 2 kg): 2 x 0.02 = 0.04 mg, floored to 0.1 mg (minimum bradycardia dose per PALS). PASS.
- high (fluid-bolus-ns, 30 kg): 30 x 20 = 600 mL. PASS.
- naloxone (5 kg): 5 x 0.1 = 0.5 mg. PASS.

## Cross-implementation differential
- Reference implementation: PALS 2020 dosing tables (cross-checked against the Harriet Lane Handbook current edition).
- Test case: epinephrine-iv-io at 10 kg.
- Sophie result: 0.1 mg.
- Reference result: 0.1 mg (10 kg x 0.01 mg/kg).
- Delta: 0%. PASS.
- Test case: atropine at 2 kg.
- Sophie result: 0.1 mg (floored).
- Reference result: 0.1 mg minimum per PALS bradycardia recipe.
- Delta: 0%. PASS.

## Edge-input handling notes
- `num('weightKg', ...)` rejects non-finite or out-of-range (0.1-250 kg) weights with an inline error message; the renderer's `safe()` wrapper catches and displays the message.
- Recipe selector is a closed dropdown sourced from PEDS_DOSE_RECIPES; unknown recipes cannot be selected.
- `capped` flag drives a visible warning when the calculated dose exceeds the per-dose cap so that the cap is never silently substituted.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled number input, one labelled select; output region `aria-live="polite"`. Tab order matches visual order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
