# v11 audit - comfort-b

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: van Dijk M, Peters JWB, van Deventer P, Tibboel D. *The COMFORT Behavior Scale: a tool for assessing pain and sedation in infants.* Am J Nurs. 2005;105(1):33-36. Six behavioral items (Alertness, Calmness/Agitation, Respiratory response or Crying, Physical movement, Muscle tone, Facial tension), each scored 1-5. Total 6-30. Bands per van Dijk 2005: <11 over-sedation; 11-22 adequate; >22 inadequate sedation / distress.

`lib/scoring-v4.js comfortB()` validates each item as an integer 1-5, sums to 6-30, and returns `{score, parts, band, text}`.

## Boundary examples added

- 6 (all 1s, deepest sedation) -> over-sedation.
- 10 (upper edge of over-sedation) -> over-sedation.
- 11 (lower edge of adequate) -> adequate sedation.
- 18 (mid-band; tile example) -> adequate sedation.
- 22 (upper edge of adequate) -> adequate sedation.
- 23 (lower edge of distress) -> inadequate sedation / distress.
- 30 (all 5s) -> inadequate sedation / distress.

## Cross-implementation differential

- Reference: van Dijk 2005 Table 2 worked example "alertness 3, calmness 3, respiratory response 3, movement 3, muscle tone 3, facial tension 3 -> total 18, adequate sedation."
- Sophie result: score 18, band adequate sedation. PASS.

## Edge-input handling notes

- Non-integer or out-of-range items (0 or 6) throw. Negative values throw.

## A11y / keyboard notes

- Six labeled range inputs (each 1-5) with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
