# v12 audit - berg-balance

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Berg K, Wood-Dauphinee S, Williams JI, Maki B. Measuring balance in the elderly: validation of an instrument. Can J Public Health. 1992;83 Suppl 2:S7-11 (cross-verified against the Shirley Ryan AbilityLab Rehab Measures database and StatPearls; ≥ 2 sources, spec-v97).

`lib/function-v154.js bergBalance()` sums fourteen 0–4 task scores into the 0–56
total with the wheelchair / assisted / independent strata and the increased-fall-
risk flag. Group G, Class A.

## Source-governance notes
- 14 tasks each 0 (unable) to 4 (independent and safe), summed 0–56. Strata 0–20
  wheelchair-bound / high fall risk, 21–40 walking with assistance, 41–56 walking
  independently.
- The canonical fall-risk cut-off is STRICT < 45 (a score of exactly 45 sits on the
  lower-risk side). The literature also notes a lower, more specific cut-off near 40
  (Riddle & Stratford); only the 45/56 figure is surfaced.

## Boundary worked examples added
- all tasks 3 → 42 (independent stratum yet < 45 increased risk); 44/45 fall-risk
  flip; stratum boundaries 20/21 and 40/41; max 56 lower-risk; blank task →
  valid:false.

## Edge-input handling notes
- Each task finite-checked and clamped to 0–4; a blank task surfaces a complete-the-
  fields fallback rather than an undercounted total; covered by the spec-v59 fuzz
  harness, zero non-finite leaks.

## A11y / keyboard notes
- Fourteen labelled selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
