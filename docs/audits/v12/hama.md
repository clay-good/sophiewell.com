# v12 audit - hama

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol. 1959;32(1):50-55.

`lib/psych-v96.js hama()` sums the 14 clinician-rated items (each 0-4), bands the total 0-56, and refuses a band from a partially-completed instrument.

## Boundary worked examples added
- band edges: 17 -> mild, 18 -> mild to moderate, 24 -> mild to moderate, 25 -> moderate to severe, 30 -> moderate to severe, 31 -> severe.
- every item rated 2 -> total 28 -> moderate to severe.
- a blank item -> "(complete all 14 items)"; an out-of-range item (5) is rejected.

## Cross-implementation differential
- Reference: Hamilton 1959 14-item HAM-A severity structure. Match. PASS.

## Edge-input handling notes
- Items clamped to 0-4; non-array / blank withholds the band; out-of-range yields valid:false. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Fourteen labeled numeric item inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the score and band only.

## Defects opened
- none

## Status
- PASS
