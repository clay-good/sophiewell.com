# v12 audit - slicc-sle

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Petri M, Orbai AM, Alarcon GS, et al. Derivation and validation of the SLICC classification criteria for SLE. Arthritis Rheum. 2012;64(8):2677-2686 (cross-verified against MDCalc SLICC 2012 and the Frontiers Immunol 2022 review; >= 2 sources, spec-v97).

`lib/rheum-v160.js sliccSle()` evaluates both qualifying pathways. Group G, Class A.

## Source-governance notes
- 11 clinical + 6 immunologic criteria. Classifies if >= 4 criteria with >= 1
  clinical AND >= 1 immunologic; OR biopsy-proven lupus nephritis with ANA or
  anti-dsDNA (the shortcut, which can classify with < 4 total criteria).
- Both pathways are evaluated and the satisfied pathway is named.

## Boundary worked examples added
- the tile example (3 clinical + 1 immunologic classifies); 4 clinical + 0
  immunologic does NOT classify (distribution rule); the biopsy shortcut with < 4
  total; biopsy without ANA/anti-dsDNA does not shortcut; nothing selected.

## Edge-input handling notes
- An all-unchecked input is valid and reports "does not meet" (never NaN). The
  spec-v59 fuzz harness confirms no non-finite leak.

## A11y / keyboard notes
- 17 labelled checkboxes + the biopsy shortcut checkbox, grouped under headings;
  output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
