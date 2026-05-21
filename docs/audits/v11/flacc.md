# v11 audit - flacc

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. *The FLACC: a behavioral scale for scoring postoperative pain in young children.* Pediatr Nurs. 1997;23(3):293-297. Five behavioral items (face, legs, activity, cry, consolability), each scored 0-2. Total 0-10. Bands: 0 relaxed; 1-3 mild discomfort; 4-6 moderate pain; 7-10 severe pain or severe discomfort.

`lib/scoring-v4.js flacc()` validates each item as an integer 0-2, sums to 0-10, and returns `{score, parts, band, text}`.

## Boundary examples added

- 0 (all zero; tile example) -> relaxed.
- 3 (upper edge of mild) -> mild discomfort.
- 4 (lower edge of moderate) -> moderate pain.
- 6 (upper edge of moderate) -> moderate pain.
- 7 (lower edge of severe) -> severe pain.
- 10 (all 2s) -> severe pain.

## Cross-implementation differential

- Reference: Merkel 1997 Table 2 worked example "face 1, legs 1, activity 1, cry 1, consolability 0 -> total 4, moderate pain."
- Sophie result: score 4, band moderate pain. PASS.

## Edge-input handling notes

- Non-integer or out-of-range items throw. Negative values throw.

## A11y / keyboard notes

- Five labeled range inputs (each 0-2) with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
