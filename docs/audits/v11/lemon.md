# v11 audit - lemon

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Reed MJ, Dunn MJG, McKeown DW. *Can an airway assessment score predict difficulty at intubation in the emergency department?* Emerg Med J. 2005;22(2):99-102. Six factors with the 3-3-2 rule sub-grouped: Look externally (+1), Evaluate 3-3-2 (+1 per failed sub-measurement; max 3: incisor opening <3 fb, hyoid-to-mental <3 fb, thyroid-to-floor <2 fb), Mallampati >=III (+1), Obstruction/Obesity (+1), Neck mobility limited (+1). Sum 0-7. Higher score = greater predicted difficulty per Reed 2005.

`lib/scoring-v4.js lemon()` sums seven booleans (the three 3-3-2 sub-measurements are each independently checkable rather than collapsing the 3-3-2 sub-score). The function surfaces the 3-3-2 subtotal alongside the total so a clinician can verify the sub-rule independently of the look/Mallampati/obstruction/neck items.

## Boundary examples added
- 0 of 7 (no predictors; tile example) -> "no predictors" band.
- 1 of 7 (Mallampati >=III alone) -> 1 predictor band.
- 3 of 7 (all three 3-3-2 sub-failures) -> 3 predictors band; 3-3-2 subtotal = 3.
- 8 of 7 (every factor) -> 8 predictors band.
- 3-3-2 subtotal 2 (incisor + hyoid only, thyroid-floor >=2 fb OK) -> subtotal 2, total 2.

## Cross-implementation differential
- Reference: Reed 2005 §Method / Table 1.
- Test case: look (1) + incisor <3fb (1) + Mallampati >=III (1) + obstruction (1) = 4.
- Sophie result: 4 of 7, 3-3-2 subtotal 1.
- Reference: same. PASS.

## Edge-input handling notes
- Each input interpreted via `x ? 1 : 0`.
- The 3-3-2 sub-measurements are exposed individually so a clinician can document partial sub-failures rather than encoding the rule as a single 0/3 bit.

## A11y / keyboard notes
- Seven labeled checkboxes; Tab-reachable; aria-live result region with a separate muted line showing the 3-3-2 subtotal. `npm run test:a11y` clean.

## Defects opened
- spec-v14 §3.3.1 prose says "0-8" but the mathematics produces 0-7
  (Look 1 + 3-3-2 max 3 + Mallampati 1 + Obstruction 1 + Neck 1 = 7).
  Flagged for a future spec-v14 patch; implementation and band text
  use the correct 0-7 range.

## Status
- PASS-WITH-FIXES
