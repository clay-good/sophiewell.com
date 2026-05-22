# v11 audit - race

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Pérez de la Ossa N, Carrera D, Gorchs M, Querol M, Millán M, Gomis M, Dorado L, López-Cancio E, Hernández-Pérez M, Chicharro V, Escalada X, Jiménez X, Dávalos A. *Design and validation of a prehospital stroke scale to predict large arterial occlusion: the rapid arterial occlusion evaluation scale.* Stroke. 2014;45(1):87-91. Five NIHSS-derived items: facial palsy 0-2, arm motor 0-2, leg motor 0-2, head/gaze deviation 0-1, aphasia (if right hemiparesis) or agnosia (if left hemiparesis) 0-2. Total 0-9. LVO threshold >=5 with sensitivity 85% and specificity 68% in the derivation cohort.

`lib/scoring-v4.js race()` validates each of the five items as an integer within its allowed range, sums to a 0-9 total, and returns `lvoLikely: score >= 5` plus the Pérez de la Ossa 2014 LVO band.

## Boundary examples added

- Score 0 (tile example, all-normal) -> LVO less likely.
- Score 4 (1+1+1+0+1, just below threshold) -> LVO less likely.
- Score 5 (Pérez de la Ossa 2014 LVO threshold: facial 2, arm 2, gaze 1) -> LVO likely.
- Score 9 (maximum, all items maximal) -> LVO likely.

## Cross-implementation differential

- Reference: Pérez de la Ossa 2014 reports LVO threshold >=5 with sensitivity 85% / specificity 68%.
- Sophie result: RACE 4 returns `lvoLikely: false`; RACE 5 returns `lvoLikely: true`. PASS.
- Per-item ranges (facial 0-2, arm 0-2, leg 0-2, gaze 0-1, language/agnosia 0-2) verified against the published RACE form.

## Edge-input handling notes

- Non-integer (NaN, 1.5), out-of-range (facial 3, gaze 2, arm -1), and missing keys throw.

## A11y / keyboard notes

- Five labeled range fields with linked labels; aria-live result region wraps the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
