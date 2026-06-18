# v12 audit - wifi

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Mills JL Sr, Conte MS, Armstrong DG, et al. J Vasc Surg. 2014;59(1):220-234.

`lib/vascular-v105.js wifi()` reads the clinical stage (1-4) off the Mills 2014
expert-panel amputation-risk grid for the Wound / Ischemia / foot Infection grade
triple (each 0-3), indexed STAGE[ischemia][wound][infection]. Class B (revisable
SVS classification -> docs/citation-staleness.md row, on-publication cadence).

## Boundary worked examples added
- W2 I3 fI1 -> clinical stage 4 (the spec acceptance anchor).
- W0 I0 fI0 -> 1; grid anchors W0 I0 fI1 -> 1 and W3 I3 fI3 -> 4.
- mid-grid W1 I2 fI2 -> 4; W0 I2 fI0 -> 2.
- accepts string grades from the renderer selects.
- out-of-range (4) or blank grade -> valid:false surfaced fallback.
- fuzz: grade-clamped lookup, no non-finite leak.

## Cross-implementation differential
- Reference: the Mills 2014 expert-panel amputation-risk table. The full 64-cell
  grid was re-fetched and cross-verified across two independent reproductions
  (NIH PMC8202158 and J Vasc Bras 2020 Table 4); 64/64 cells identical, all four
  anchor cells match. NOTE: this is the amputation-risk grid, NOT the separate
  revascularization-benefit table. PASS.

## Edge-input handling notes
- wifiGrade() coerces strings, rounds, and clamps to 0-3; any out-of-range grade
  returns a surfaced fallback rather than reading an undefined cell.

## A11y / keyboard notes
- Labeled selects; output aria-live="polite". 320px sweep passes with no horizontal
  scroll. Risk-stratification aid, not a revascularization or amputation order.

## Defects opened
- none

## Status
- PASS
