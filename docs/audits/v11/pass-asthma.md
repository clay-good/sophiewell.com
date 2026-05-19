# v11 audit - pass-asthma

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Gorelick MH, Stevens MW, Schultz TR, Scribano PV. *Performance of a novel clinical score, the pediatric asthma severity score (PASS), in the evaluation of acute asthma.* Acad Emerg Med. 2004;11(1):10-18. Three items each scored 0-2: wheezing, work of breathing, prolonged expiration. Sum 0-6. Bands per Gorelick 2004: 0-1 mild, 2-3 moderate, 4-6 severe.

`lib/scoring-v4.js passAsthma()` clamps each per-item value to [0, 2] so slider drift cannot push a single domain outside the published range.

## Boundary examples added
- 0 of 6 (tile example) -> mild band.
- 1 of 6 (upper edge of mild) -> mild.
- 2 of 6 (lower edge of moderate) -> moderate.
- 3 of 6 (upper edge of moderate) -> moderate.
- 4 of 6 (lower edge of severe) -> severe.
- 6 of 6 (max) -> severe.
- per-item clamp: 99 / -1 -> 2 / 0.

## Cross-implementation differential
- Reference: Gorelick 2004.
- Test case: wheezing 2 + work-of-breathing 1 + expiration 1 = 4 -> severe.
- Sophie result: 4 of 6, severe band.
- Reference: same. PASS.

## Edge-input handling notes
- Per-item clamp to [0, 2] handles slider out-of-range, non-finite, and negative values.

## A11y / keyboard notes
- Three labeled range inputs (0-2); Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
