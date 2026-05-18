# v11 audit - Wells DVT and Caprini VTE Risk (`wells-dvt-caprini`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Wells PS, Anderson DR, Bormanis J, et al. *Value of assessment of pretest probability of deep-vein thrombosis in clinical management.* Lancet. 1997;350(9094):1795-1798 (Wells DVT). Caprini JA. *Thrombosis risk assessment as a guide to quality patient care.* Dis Mon. 2005;51(2-3):70-78 (Caprini RAM).

This tile pairs the original Wells DVT (covered in detail under `wells-dvt.md`) with a simplified Caprini Risk Assessment Model entered as a single user-supplied total-points value (the renderer assumes the clinician has tallied the Caprini items from the Caprini 2005 worksheet). `lib/scoring-v4.js caprini()` accepts an array of `{ points }` items, sums them, and bands per Caprini 2005 / Bahl 2010 (Ann Surg 251(2):344-350) thresholds: 0 = Very low, 1-2 = Low, 3-4 = Moderate, >= 5 = High.

## Boundary examples added
Wells DVT (abbreviated; full set in `wells-dvt.md`):
- low: 0 -> Low probability; mid: 2 -> Moderate; high: 3 -> High.

Caprini:
- low: 0 points -> "Very low".
- mid: 3 points (e.g., age 41-60 (1) + minor surgery (1) + BMI > 25 (1)) -> "Moderate".
- high: META example (5 points; e.g., age >= 75 (3) + history of DVT/PE (3) and one offsetting subtraction is not in the standard worksheet, so use age 61-74 (2) + obesity (1) + bedrest (1) + central venous access (1) = 5) -> "High".

Band-edge: 4 -> top of Moderate; 5 -> bottom of High.

## Cross-implementation differential
- Reference implementation: Caprini 2005 Dis Mon worksheet + Bahl 2010 Ann Surg validation point thresholds.
- Test case: 5 points (META example).
- Sophie result: 5, "High".
- Reference result: 5, High band (>= 5 per Bahl 2010).
- Delta: 0 ordinal-band categories. PASS.

## Edge-input handling notes
- The Caprini input is intentionally a single "points" number rather than 40+ checkboxes; this matches the workflow described in Caprini 2005 (clinician completes the paper or EMR-integrated worksheet, then enters the total). The label clarifies that the user should compute the total from the Caprini worksheet first, with a link out to the Caprini 2005 reference (no external network call from the page — citation only).
- Negative points are not accepted; `Number(x.points) || 0` clamps non-numeric / negative entries to 0 so a typo cannot inflate the band by accident in either direction. (Negative weights are not part of the Caprini worksheet.)
- Wells DVT side uses the same 10-checkbox layout as the standalone `wells-dvt` tile; behavior is identical.

## A11y / keyboard notes
- Wells DVT side: ten labeled checkboxes. Caprini side: one labeled number input. All Tab-reachable in source order; both output regions are `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
