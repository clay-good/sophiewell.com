# v12 audit - madrs

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Montgomery SA, Asberg M. A new depression scale designed to be sensitive to change. Br J Psychiatry. 1979;134:382-389.

`lib/psych-v96.js madrs()` sums the 10 items (each 0-6), bands the total 0-60, and refuses a band from a partially-completed instrument.

## Boundary worked examples added
- band edges: 6 -> normal, 7 -> mild, 19 -> mild, 20 -> moderate, 34 -> moderate, 35 -> severe.
- every item rated 2 -> total 20 -> moderate.
- a blank item -> "(complete all 10 items)"; an out-of-range item (7) is rejected.

## Cross-implementation differential
- Reference: Montgomery-Asberg 1979 MADRS severity bands. Match. PASS.

## Edge-input handling notes
- Items clamped to 0-6; non-array / blank withholds the band; out-of-range yields valid:false. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Ten labeled numeric item inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the score and band only.

## Defects opened
- none

## Status
- PASS
