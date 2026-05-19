# v11 audit - epworth

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Johns MW. *A new method for measuring daytime sleepiness: the Epworth sleepiness scale.* Sleep. 1991;14(6):540-545. Eight scenarios each scored 0 (would never doze) to 3 (high chance of dozing); sum 0-24; bands per Johns 1991: 0-10 normal, 11-14 mild, 15-17 moderate, 18-24 severe excessive daytime sleepiness.

`lib/scoring-v4.js epworth()` sums the eight Johns 1991 scenario scores and returns the Johns 1991 sleepiness band. Per-item input is clamped to [0, 3] so a slider drift cannot push a single scenario above the published per-item range.

## Boundary examples added
- normal (tile example): 6 of 24 -> normal band per Johns 1991 (0-10).
- normal (upper bound): 10 of 24 stays in the normal band.
- mild (cutoff): 11 of 24 -> mild excessive daytime sleepiness per Johns 1991 (11-14 band).
- moderate (cutoff): 15 of 24 -> moderate band per Johns 1991 (15-17).
- severe (maximum): 24 of 24 -> severe excessive daytime sleepiness per Johns 1991 (18-24).
- clamp check: per-item 99 / -5 clamp to 3 / 0 respectively.

## Cross-implementation differential
- Reference: hand-summed against Johns 1991 cutoffs (0-10 normal, 11-14 mild, 15-17 moderate, 18-24 severe).
- Test case: all eight items at 3 -> 24 -> severe band.
- Sophie result: 24 of 24, severe band.
- Reference: same. PASS.

## Edge-input handling notes
- Per-item clamp to [0, 3] (`epworthClamp`) handles slider out-of-range, non-finite, and negative values without crashing.
- Sum-of-eight slider items; no NaN paths.

## A11y / keyboard notes
- Eight labeled range inputs (0-3) with live `<output>` echoing the current value; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
