# v12 audit - midas

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Stewart WF, Lipton RB, Dowson AJ, Sawyer J. Development and testing of the Migraine Disability Assessment (MIDAS) questionnaire. Neurology. 2001;56(6 Suppl 1):S20-S28.

`lib/neuro-v95.js midas()` sums only the five disability questions, clamps each day-count to the 92-day 3-month ceiling, bands the total, and reports the ancillary frequency/intensity items without scoring them.

## Boundary worked examples added
- band edges: sum 5 -> grade I, 6 -> II, 10 -> II, 11 -> III, 20 -> III, 21 -> IV.
- 2 + 4 + 1 + 3 + 1 = 11 -> grade III; ancillary freq 10 / intensity 6 reported but not summed.
- blanks coerce to 0; q1 1000 clamps to 92; intensity 50 clamps to 10.

## Cross-implementation differential
- Reference: Stewart 2001 MIDAS five-item sum and grade bands. Match. PASS.

## Edge-input handling notes
- Day-counts coerce blank to 0 and clamp to [0, 92]; the ancillary items are excluded from the sum so they cannot inflate the grade. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Seven labeled numeric inputs (five scored, two ancillary); output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the score and band only.

## Defects opened
- none

## Status
- PASS
