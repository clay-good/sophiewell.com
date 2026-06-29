# v12 audit - interrai-abs

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Perlman CM, Hirdes JP. The Aggressive Behavior Scale: a new scale to measure aggression based on the Minimum Data Set. J Am Geriatr Soc. 2008;56(12):2298-2303. The 4 items, the per-item 0-3 MDS 7-day frequency anchors, and the 0-12 total cross-verified against the CIHI interRAI LTCF outcome-scales job aid and a PMC review (>= 2 sources, spec-v97).

`lib/ltcga-v174.js interraiAbs()` sums the 4 behaviors to 0-12. Group G, Class A.

## Source-governance notes
- 4 items (verbal abuse, physical abuse, socially inappropriate or disruptive behavior, resists care), each 0 not exhibited / 1 = 1-3 days / 2 = 4-6 days not daily / 3 daily on the MDS 7-day scale; total 0-12.
- SOURCING CORRECTION: the spec-v174 draft stated 0-4 per item (which would give 0-16); cross-verification fixed this to 0-3 per item / 0-12 total. The unit test pins the corrected range (a per-item 4 -> valid:false).
- The original Perlman & Hirdes scale defines NO named bands; the none/mild/moderate/severe split (0 / 1-2 / 3-5 / 6-12) is a secondary nursing-home-literature convention (JAMDA 2019), attributed as such in the interpretation. The published interRAI/MDS-derived scale is a journal source (not the licensed assessment form), so no citation-staleness row.

## Boundary worked examples added
- 0/12 none; 2 mild and 3 moderate (mild/moderate boundary); 5 moderate and 6 severe (moderate/severe boundary); 12/12 severe; the corrected out-of-range 4 and blank -> valid:false.

## Edge-input handling notes
- Each item validated to 0-3; any null/blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
