# v11 audit - lams

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Llanes JN, Kidwell CS, Starkman S, Leary MC, Eckstein M, Saver JL. *The Los Angeles Motor Scale (LAMS): a new measure to characterize stroke severity in the field.* Prehosp Emerg Care. 2004;8(1):46-50. LVO-prediction threshold re-verified against: Nazliel B, Starkman S, Liebeskind DS, Ovbiagele B, Kim D, Sanossian N, Ali LK, Buck B, Villablanca P, Vinuela F, Duckwiler G, Jahan R, Saver JL. *A brief prehospital stroke severity scale identifies ischemic stroke patients harboring persisting large arterial occlusions.* Stroke. 2008;39(8):2264-2267. Three motor items (facial droop 0-1, arm drift 0-2, grip strength 0-2); total 0-5; LAMS >=4 predicts persistent LVO with sensitivity 81% and specificity 89%.

`lib/scoring-v4.js lams()` validates each item as an integer within its allowed range, sums to `score` (0-5), and returns `lvoLikely: score >= 4`.

## Boundary examples added

- Score 0 (tile example, all-normal) -> LVO less likely.
- Score 3 (1 + 1 + 1, just below LVO threshold) -> LVO less likely.
- Score 4 (Nazliel 2008 LVO threshold) -> LVO likely.
- Score 5 (maximum, 1 + 2 + 2) -> LVO likely.

## Cross-implementation differential

- Reference: Nazliel 2008 reports the LAMS >=4 LVO threshold with sensitivity 81% and specificity 89%; Llanes 2004 frames the 0-5 motor scoring.
- Sophie result: a LAMS of 3 returns `lvoLikely: false`; a LAMS of 4 returns `lvoLikely: true`. PASS.

## Edge-input handling notes

- Non-integer (NaN, 1.5), out-of-range (facial 2, arm 3, grip -1), and missing keys throw.

## A11y / keyboard notes

- Three labeled range fields (0-1, 0-2, 0-2) with linked labels; aria-live result region wraps the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
