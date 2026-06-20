# v12 audit - warfarin-init-5mg

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Crowther MA, et al. Arch Intern Med. 1999;159(1):46-48, Table 1 (faithfully reproduced by AAFP 2005;71(4):763). Two independent fetches of the reproduction returned identical band tables.

`lib/warfarin-v133.js warfarinInit5mg()` returns the recommended warfarin dose for the entered treatment day per the Crowther 5 mg initiation nomogram: a fixed lookup, no interpolation. Class A (fixed nomogram table; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / table note
- Day 1 = 5 mg, Day 2 = 5 mg (fixed loading dose, no INR branch).
- Day 3 (by that morning's INR): < 1.5 -> 10 mg; 1.5-1.9 -> 5 mg; 2.0-3.0 -> 2.5 mg; > 3.0 -> 0 mg.
- Day 4: < 1.5 -> 10 mg; 1.5-1.9 -> 7.5 mg; 2.0-3.0 -> 5 mg; > 3.0 -> 0 mg.
- Day 5: < 2.0 -> 10 mg; 2.0-3.0 -> 5 mg; > 3.0 -> 0 mg. The day-5 low band is < 2.0, NOT < 1.5 like days 3-4 - the easy-to-mis-transcribe row, guarded by a dedicated test.
- Day 6: < 1.5 -> 12.5 mg; 1.5-1.9 -> 10 mg; 2.0-3.0 -> 7.5 mg; > 3.0 -> 0 mg.

## Boundary worked examples added
- Day-1/day-2 fixed 5 mg; the day-3, day-4, day-5 and day-6 band boundaries (including the 3.0-vs-3.1 hold edge and the day-5 < 2.0 trap); a > 3.0 INR holds the dose at 0 mg.

## Edge-input handling notes
- An out-of-range treatment day (< 1 or > 6) or a blank/non-positive INR on an INR-driven day surfaces valid:false rather than a guessed dose. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- One labeled day select + one labeled INR number input; output aria-live="polite". 320px sweep, no hscroll; renders the spec-v100 §2 clause-5 high-stakes second-check caveat in the output.

## Defects opened
- none
