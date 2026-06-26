# v12 audit - iief5

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Rosen RC, Cappelleri JC, Smith MD, et al. Development and evaluation of an abridged 5-item version of the International Index of Erectile Function (IIEF-5) as a diagnostic tool for erectile dysfunction. Int J Impot Res. 1999;11(6):319-326 (cross-verified against MDCalc and peer-reviewed IIEF reviews; ≥ 2 sources, spec-v97).

`lib/urology-v153.js iief5()` consumes five item scores and computes the 5–25
total with the five validated severity bands. Group G, Class A.

## Source-governance notes
- Item 1 (confidence) scored 1–5; items 2–5 carry an on-form "0 = no sexual activity
  / did not attempt intercourse" option (range 0–5). Bands anchored to 5–25: 22–25
  no ED, 17–21 mild, 12–16 mild-to-moderate, 8–11 moderate, 5–7 severe.
- A score ≤21 is the published diagnostic threshold for erectile dysfunction; the
  renderer surfaces this when the total is ≤21.
- Totals below 5 (possible when the 0 options are used) fall in the severe band.

## Boundary worked examples added
- 21/22 mild→no-ED boundary (and the ≤21 threshold message); 7/8 severe→moderate
  boundary; max 25 → no ED; all-zero-attempt Q2–Q5 with Q1=1 → 1, severe; blank item
  → valid:false.

## Edge-input handling notes
- Each item finite-checked and clamped; a blank item surfaces a complete-the-fields
  fallback rather than an undercounted total; covered by the spec-v59 fuzz harness,
  zero non-finite leaks.

## A11y / keyboard notes
- Five labelled selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
