# v12 audit - ybocs

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Goodman WK, Price LH, Rasmussen SA, et al. The Yale-Brown Obsessive Compulsive Scale. I. Development, use, and reliability. Arch Gen Psychiatry. 1989;46(11):1006-1011.

`lib/psych-v96.js ybocs()` sums the 10 items (each 0-4; items 1-5 obsessions, 6-10 compulsions), bands the total 0-40, reports the obsession/compulsion subtotals, and refuses a band from a partially-completed instrument.

## Boundary worked examples added
- band edges: 7 -> subclinical, 8 -> mild, 15 -> mild, 16 -> moderate, 23 -> moderate, 24 -> severe, 31 -> severe, 32 -> extreme.
- every item rated 2 -> total 20 -> moderate; obsessions 10/20, compulsions 10/20.
- a blank item -> "(complete all 10 items)"; an out-of-range item (5) is rejected.

## Cross-implementation differential
- Reference: Goodman 1989 Y-BOCS severity bands and the obsession/compulsion subscale split. Match. PASS.

## Edge-input handling notes
- Items clamped to 0-4; non-array / blank withholds the band; out-of-range yields valid:false. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Ten labeled numeric item inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the score, subtotals, and band only.

## Defects opened
- none

## Status
- PASS
