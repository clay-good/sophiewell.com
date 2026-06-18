# v12 audit - add-rs

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Rogers AM, Hermann LK, Booher AM, et al. Circulation. 2011;123(20):2213-2218.

`lib/cardio-v104.js addRs()` counts the three high-risk categories (each 0 or 1) to a 0-3 total, maps 0 low / 1 intermediate / >= 2 high, and renders an optional D-dimer pathway note that is never a score input. Class A.

## Boundary worked examples added
- no categories -> 0, low.
- one category -> 1, intermediate.
- 1 -> 2 flip -> high risk.
- three categories clamp at 3.
- D-dimer < 500 with ADD-RS <= 1 -> rule-out pathway note; >= 500 -> proceed to imaging; ADD-RS >= 2 -> does not rule out.
- fuzz: bounded category count, no non-finite leak.

## Cross-implementation differential
- Reference: the 2010 AHA/ACC guideline three-category rule (verified against the Rogers 2011 IRAD validation and the Circulation 2018 ADD-RS + D-dimer study). The 500 ng/mL rule-out threshold applies only to ADD-RS <= 1. Match. PASS.

## Edge-input handling notes
- D-dimer is a pathway note only; ADD-RS >= 2 is reported as "D-dimer does not rule out", consistent with the published pathway.

## A11y / keyboard notes
- Labeled checkboxes plus a labeled numeric D-dimer input; output aria-live="polite". 320px sweep passes with no horizontal scroll. Pretest-risk aid, not a CT-angiography order.

## Defects opened
- none

## Status
- PASS
