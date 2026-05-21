# v11 audit - cries

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Krechel SW, Bildner J. *CRIES: a new neonatal postoperative pain measurement score. Initial testing of validity and reliability.* Paediatr Anaesth. 1995;5(1):53-61. Five behavioral / physiological items (Crying [high-pitched]; Requires O2 to maintain SaO2 >=95%; Increased vital signs [HR/BP]; Expression; Sleeplessness), each scored 0-2. Total 0-10. Score >=4 considered indication for analgesia; >=7 severe pain.

`lib/scoring-v4.js cries()` validates each item as an integer 0-2, sums to 0-10, and returns `{score, parts, band, text}`.

## Boundary examples added

- 0 (all zero; tile example) -> no significant pain.
- 3 (upper edge of no-pain) -> no significant pain.
- 4 (lower edge of moderate) -> analgesia indicated.
- 6 (upper edge of moderate) -> analgesia indicated.
- 7 (lower edge of severe) -> severe pain.
- 10 (all 2s) -> severe pain.

## Cross-implementation differential

- Reference: Krechel 1995 worked example "post-op neonate with crying 1, O2 requirement 1, vitals 1, expression 1, sleeplessness 0 -> total 4, analgesia indicated."
- Sophie result: `cries({crying:1, requiresO2:1, vitals:1, expression:1, sleeplessness:0})` returns `score: 4, band: 'moderate pain - analgesia indicated'`. PASS.

## Edge-input handling notes

- Non-integer or out-of-range items throw. Negative values throw.

## A11y / keyboard notes

- Five labeled range inputs (each 0-2) with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
