# v11 audit - APGAR (`apgar`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Apgar V. *A proposal for a new method of evaluation of the newborn infant.* Curr Res Anesth Analg. 1953;32(4):260-267. Five-component newborn scorecard (Appearance, Pulse, Grimace, Activity, Respiration), each 0-2, total 0-10.

`lib/clinical.js apgar()` implements verbatim: sum the five 0-2 components; total range 0-10. Category bands per the standard teaching (Apgar's original paper does not band the score — banding language is universally taught and reflects the source's narrative that low totals warrant resuscitation):
- 7-10: Normal
- 4-6: Moderately depressed
- 0-3: Severely depressed

## Boundary examples added
- low: 0+0+0+0+0 = 0; "Severely depressed". (Pin: `test/unit/clinical.test.js` line ~170; covered by category branch.)
- mid (META example, normal newborn): 2+2+2+2+2 = 10; "Normal". Pinned at line 168.
- high: 2+1+1+1+1 = 6; "Moderately depressed".
- boundary low: 0+1+1+1+0 = 3; "Severely depressed" (top of severe band).
- boundary moderate: 1+1+1+1+0 = 4; "Moderately depressed" (bottom of moderate band).
- boundary normal: 2+2+2+1+0 = 7; "Normal" (bottom of normal band).

## Cross-implementation differential
- Reference implementation: Apgar V 1953 original five-component sum, hand-verified.
- Test case: META example — all components 2.
- Sophie result: total 10, "Normal".
- Reference result: 2+2+2+2+2 = 10, "Normal" (universal teaching).
- Delta: 0%. PASS.

## Edge-input handling notes
- Each component validated `min:0, max:2` by `num()`. Out-of-range entries throw a TypeError that the safe-renderer catches and displays as an inline error.
- Component selects (or numeric inputs depending on renderer) are constrained to the source-defined 0/1/2 set.
- Category text is bedside-actionable but does not include any "do X" directive — consistent with spec-v10 §2.3 / spec-v11 §5.3 (reference-only).

## A11y / keyboard notes
- All five components labelled with their Apgar mnemonic component, Tab-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
