# v11 audit - carpenter-coustan

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Carpenter MW, Coustan DR. *Criteria for screening tests for gestational diabetes.* Am J Obstet Gynecol. 1982;144(7):768-773. 100-g 3-h OGTT cutoffs (mg/dL): fasting 95, 1-h 180, 2-h 155, 3-h 140. GDM diagnosed if >=2 values exceed (note: ">=" matches the Carpenter 1982 thresholds, which are the published cutoffs themselves). Single abnormal value = impaired glucose tolerance.

`lib/scoring-v4.js carpenterCoustan()` evaluates each of four OGTT timepoints against its cutoff using `>=`. Returns flags per timepoint, a count of values exceeded, and the diagnostic band per Carpenter 1982. Number coercion uses `Number()` so NaN comparisons return false and a missing input does not falsely flag GDM.

## Boundary examples added
- 0 abnormal (tile example: F 85 / 1h 160 / 2h 140 / 3h 120) -> not diagnostic of GDM.
- 1 abnormal (F 100 only) -> impaired glucose tolerance.
- 2 abnormal (F 100 + 1h 200) -> GDM.
- 4 abnormal (all exceed) -> GDM.
- Exactly at cutoff (F 95) -> abnormal (>=).
- One below cutoff (F 94, others normal) -> not diagnostic.

## Cross-implementation differential
- Reference: Carpenter 1982 §Methods.
- Test case: F 100, 1h 200, 2h 160, 3h 150 -> all four exceed -> GDM.
- Sophie result: 4 of 4 exceeded, GDM band.
- Reference: same. PASS.

## Edge-input handling notes
- Number() coercion: blank/non-numeric inputs become NaN, comparisons return false; the tile defaults to "not diagnostic" when no values entered.
- "At-cutoff" matches "abnormal" per Carpenter 1982's published thresholds.

## A11y / keyboard notes
- Four labeled numeric inputs with default placeholders; cutoff reference muted line; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
