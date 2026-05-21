# v11 audit - poss

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Pasero C. *Assessment of sedation during opioid administration for pain management.* J Perianesth Nurs. 2009;24(3):186-190. Single 5-level ordinal sedation scale (S, 1, 2, 3, 4). S / 1 / 2 are acceptable - opioid dosing may proceed. Score 3 is unacceptable - decrease opioid by 25-50%, add non-opioid analgesic, monitor closely. Score 4 is unacceptable - stop opioid, consider naloxone, call rapid response.

`lib/scoring-v4.js poss()` validates the level as an integer 0-4 (S mapped to 0) and returns `{score, label, band, action, acceptable, text}`.

## Boundary examples added

- 0 (S) -> acceptable, sleep easy to arouse.
- 1 (tile example) -> acceptable, awake and alert.
- 2 -> acceptable, slightly drowsy.
- 3 -> unacceptable; decrease opioid 25-50%, monitor closely.
- 4 -> unacceptable; stop opioid, consider naloxone, call rapid response.

## Cross-implementation differential

- Reference: Pasero 2009 Table 1 worked example "patient frequently drowsy, drifts off mid-conversation -> POSS 3 -> decrease opioid 25-50%, add non-opioid, monitor for further deterioration."
- Sophie result: `poss({level: 3})` returns `label: '3'`, `acceptable: false`, action string includes "decrease opioid by 25-50%, add non-opioid, monitor closely." PASS.

## Edge-input handling notes

- Non-integer or out-of-range items throw. Negative values throw.

## A11y / keyboard notes

- Single labeled range input (0-4) with a linked output span showing the canonical S/1/2/3/4 label; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
