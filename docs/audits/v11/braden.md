# v11 audit - braden

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Bergstrom N, Braden BJ, Laguzza A, Holman V. *The Braden Scale for predicting pressure sore risk.* Nurs Res. 1987;36(4):205-210. Six ordinal items: sensory perception (1-4), moisture (1-4), activity (1-4), mobility (1-4), nutrition (1-4), friction/shear (1-3). Total 6-23. Bands: >=19 not at risk; 15-18 mild; 13-14 moderate; 10-12 high; <=9 very high.

`lib/scoring-v4.js braden()` clamps each item to its allowed range, sums to a 6-23 total, and returns `{score, parts, band, text}`.

## Boundary examples added
- 23 (all maxima; tile example) -> not at risk.
- 19 (lower edge of not-at-risk) -> not at risk.
- 18 (upper edge of mild) -> mild risk.
- 14 (upper edge of moderate) -> moderate risk.
- 12 (upper edge of high) -> high risk.
- 9 (upper edge of very high) -> very high risk.

## Cross-implementation differential
- Reference: Bergstrom 1987 Table 1 worked example (patient with sensory 2, moisture 2, activity 2, mobility 2, nutrition 2, friction 2 -> 12, high risk).
- Sophie result: score 12, band high risk. PASS.

## Edge-input handling notes
- Out-of-range values throw with a clear message. Non-numeric inputs throw.

## A11y / keyboard notes
- Six labeled range inputs with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
