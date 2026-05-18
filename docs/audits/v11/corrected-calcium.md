# v11 audit - Corrected Calcium for Albumin (`corrected-calcium`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Payne RB, Little AJ, Williams RB, Milner JR. *Interpretation of serum calcium in patients with abnormal serum proteins.* BMJ. 1973;4(5893):643-646.

Formula: Corrected Ca (mg/dL) = measured Ca + 0.8 × (4.0 − albumin g/dL). `lib/clinical.js correctedCalcium()` implements verbatim; rounds to 2 decimals via `r2`. Payne 1973 derived the 0.8 mg/dL per 1 g/dL albumin slope from a cohort with serum albumin 1.5-5.0 g/dL.

## Boundary examples added
- low: measured Ca 7.0, alb 4.0 -> corrected 7.0 (no correction at normal albumin; true hypocalcemia).
- mid (META example): measured Ca 8.0, alb 2.0 -> corrected 8.0 + 0.8 × (4-2) = 9.6 (normal range; pseudo-hypocalcemia from low albumin).
- high: measured Ca 11.0, alb 1.5 -> corrected 11.0 + 0.8 × 2.5 = 13.0 (severe hypercalcemia even more pronounced after correction).

Albumin-edge: alb = 4.0 -> correction term = 0, corrected = measured (verifies the +0 anchor). alb = 0.5 -> correction = +2.8 (extreme but mathematically valid; carries the implicit warning that ionized calcium is the contemporary gold standard for very low albumin).

## Cross-implementation differential
- Reference implementation: Payne 1973 BMJ formula.
- Test case: META example.
- Sophie result: 9.6 mg/dL.
- Reference result: 8.0 + 0.8 × (4-2) = 9.6 (Payne 1973).
- Delta: 0%. PASS.

## Edge-input handling notes
- Both inputs validated by the shared `num` helper; albumin has a minimum-value validator at 0 so a negative entry throws.
- The Payne 1973 formula is increasingly recognized as imprecise in critical illness (e.g., Steele 2013); the tile carries a helper-text note pointing the user to direct ionized-calcium measurement when feasible. This is a known limitation of the historical instrument, not a defect.

## A11y / keyboard notes
- Two labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
