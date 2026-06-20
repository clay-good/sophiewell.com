# v12 audit - warfarin-init-10mg

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Kovacs MJ, et al. Ann Intern Med. 2003;138(9):714-719, Figure 1. The full day-by-day table reconstructed from two independent Kovacs-attributed reproductions in exact agreement: AAFP 2005;71(4):763 Figure 1 and the RxFiles "Warfarin Tips & Dosing Nomograms" table.

`lib/warfarin-v133.js warfarinInit10mg()` returns the recommended warfarin dose for the entered treatment day per the Kovacs 10 mg initiation nomogram: a fixed conditional lookup, no interpolation. Class A (fixed nomogram table; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / table note
- Day 1 = 10 mg, Day 2 = 10 mg (fixed; no INR branch). INR is checked on days 3 and 5 only.
- The day-3 INR sets BOTH the day-3 and day-4 doses (they can differ - "day 4 repeats day 3" is FALSE):
  < 1.3 -> 15/15; 1.3-1.4 -> 10/10; 1.5-1.6 -> 10/5; 1.7-1.9 -> 5/5; 2.0-2.2 -> 2.5/2.5; 2.3-3.0 -> 0/2.5; > 3.0 -> 0/0.
- The 1.5-1.9 day-3 range is SPLIT (1.5-1.6 vs 1.7-1.9), resolving the common reproduction disagreement (some tables wrongly collapse it to a single 5 mg or 10 mg row).
- The day-5 INR sets days 5/6/7 via one of FOUR sub-tables, selected by which day-3 band the patient was in (groups A: day-3 < 1.5; B: 1.5-1.9; C: 2.0-3.0; D: > 3.0). The highest day-3 band (D) shifts its day-5 upper edges to 3.1-4.0 / > 4.0. Each sub-table is encoded verbatim (see KOVACS_DAY5).

## Boundary worked examples added
- AAFP worked example: day-3 INR 1.2 -> 15 mg on days 3 and 4 (group A). The 1.5-1.6 vs 1.7-1.9 split (10/5 vs 5/5). day-3 high bands hold the dose (2.3-3.0 -> day3 0, day4 2.5; > 3.0 -> 0/0). The day-5 sub-table selection: day-5 INR 2.5 gives 7.5/5/7.5 under day-3 group A but 5/5/5 under group B; group D's shifted 3.1-4.0 edge.

## Edge-input handling notes
- Out-of-range day (< 1 or > 7), a missing day-3 INR (days 3-7), or a missing day-5 INR (days 5-7) surfaces valid:false rather than a guessed dose. Joined the spec-v59 fuzz harness (zero non-finite leaks).
- NOT modeled (different instruments, deliberately excluded): the Kovacs Blood 2007 weekly-maintenance formula (63.835/INR - 0.265*age + 0.115*weight - 0.061*creatinine + 8.126) and the AAFP day-5 mg/week maintenance table (Pengo 2001, a 5-mg-no-heparin protocol).

## A11y / keyboard notes
- One labeled day select + two labeled INR number inputs (day-3, day-5); output aria-live="polite". 320px sweep, no hscroll; renders the spec-v100 §2 clause-5 high-stakes second-check caveat in the output.

## Defects opened
- none
