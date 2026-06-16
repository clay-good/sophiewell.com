# v12 audit - harvey-bradshaw

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Harvey RF, Bradshaw JM. A simple index of Crohn's-disease activity. Lancet. 1980;1(8167):514.

`lib/hepgi-v93.js harveyBradshaw()` sums wellbeing, abdominal pain, liquid stools/day, abdominal mass, and complications, clamping each ordinal subscore to its published range.

## Boundary worked examples added
- wellbeing 2, pain 2, stools 4, mass 1, 1 complication -> 10, moderate.
- band edges: 4 remission, 5 mild, 8 moderate, 17 severe; 7 mild / 16 moderate.
- Out-of-range subscore is clamped and the clamp is surfaced.

## Cross-implementation differential
- Reference: Harvey-Bradshaw 1980 index; bands remission < 5, mild 5-7, moderate 8-16, severe > 16. Match. PASS.

## Edge-input handling notes
- Each ordinal subscore is clamped to [0, max]; stools and complications are non-negative counts. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Three labeled ordinal <select>s + two labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
