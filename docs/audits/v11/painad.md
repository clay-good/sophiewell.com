# v11 audit - painad

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Warden V, Hurley AC, Volicer L. *Development and psychometric evaluation of the Pain Assessment in Advanced Dementia (PAINAD) scale.* J Am Med Dir Assoc. 2003;4(1):9-15. Five behavioral items (breathing independent of vocalization, negative vocalization, facial expression, body language, consolability), each scored 0-2. Total 0-10. Bands: 0 no pain; 1-3 mild pain; 4-6 moderate pain; 7-10 severe pain.

`lib/scoring-v4.js painad()` validates each item as an integer 0-2, sums to 0-10, and returns `{score, parts, band, text}`.

## Boundary examples added

- 0 (all zero; tile example) -> no pain.
- 3 (upper edge of mild) -> mild discomfort.
- 4 (lower edge of moderate) -> moderate pain.
- 7 (lower edge of severe) -> severe pain.
- 10 (all 2s) -> severe pain.

## Cross-implementation differential

- Reference: Warden 2003 Table 2 worked example "breathing 1, vocalization 1, facial 1, body language 1, consolability 0 -> total 4, moderate pain band."
- Sophie result: score 4, band moderate pain. PASS.

## Edge-input handling notes

- Non-integer or out-of-range items throw. Negative values throw.

## A11y / keyboard notes

- Five labeled range inputs (each 0-2) with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
