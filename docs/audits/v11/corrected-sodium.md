# v11 audit - Corrected Sodium for Hyperglycemia (`corrected-sodium`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Katz MA. *Hyperglycemia-induced hyponatremia--calculation of expected serum sodium depression.* NEJM. 1973;289(16):843-844 (Katz 1.6 factor). Hillier TA, Abbott RD, Barrett EJ. *Hyponatremia: evaluating the correction factor for hyperglycemia.* Am J Med. 1999;106(4):399-403 (Hillier 2.4 factor at glucose > 400 mg/dL).

Two factors reported side by side: Katz 1.6 mEq/L per 100 mg/dL glucose above 100 (classic); Hillier 2.4 mEq/L per 100 mg/dL glucose above 100 (validated for severe hyperglycemia, glucose > 400). `lib/clinical.js correctedSodium()` returns both: `naBy1_6` and `naBy2_4`.

## Boundary examples added
- low (no correction): measured Na 140, glucose 100 -> both factors yield 140.0 (no glucose excess).
- mid (META example): measured Na 130, glucose 600 -> Katz: 130 + (500/100) × 1.6 = 138; Hillier: 130 + 5 × 2.4 = 142.
- high: measured Na 120, glucose 1000 -> Katz: 120 + 9 × 1.6 = 134.4; Hillier: 120 + 9 × 2.4 = 141.6.

Boundary edge: glucose < 100 (e.g., 80) -> factor goes slightly negative; the formula produces `naBy1_6` 139.7 / `naBy2_4` 139.5 for measured Na 140. Not clinically meaningful but mathematically correct.

## Cross-implementation differential
- Reference implementation: Katz 1973 NEJM formula + Hillier 1999 Am J Med formula.
- Test case: META example (Na 130, glucose 600).
- Sophie result: Katz 138.0, Hillier 142.0.
- Reference result: Katz 130 + 5×1.6 = 138.0; Hillier 130 + 5×2.4 = 142.0.
- Delta: 0%. PASS.

## Edge-input handling notes
- Both factors are reported simultaneously so the clinician picks the contextually correct one: Hillier 2.4 for severe hyperglycemia (glucose > 400), Katz 1.6 for moderate hyperglycemia. The helper text documents this; the tile does NOT auto-pick a factor because the choice is clinical context, not a deterministic rule.
- Glucose has a min-value validator at 0 to prevent negative entries.

## A11y / keyboard notes
- Two labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
