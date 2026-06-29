# v12 audit - cmai

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Cohen-Mansfield J, Marx MS, Rosenthal AS. A description of agitation in a nursing home. J Gerontol. 1989;44(3):M77-M84. The 29 long-form items, the 1-7 frequency anchors, and the 29-203 total cross-verified against the official 1991 CMAI instruction manual, the APA tool page, and a 2024 Frontiers source (>= 2 sources, spec-v97).

`lib/ltcga-v174.js cmai()` sums the 29 frequency ratings to 29-203 and reports the three factor subscales. Group G, Class A.

## Source-governance notes
- 29-item long form; each behavior rated 1 never / 2 less than once a week / 3 once-twice a week / 4 several times a week / 5 once-twice a day / 6 several times a day / 7 several times an hour over the prior two weeks. Total 29-203; the floor is 29, not 0.
- NO total severity band: the CMAI manual explicitly advises against summing a total severity score ("it is not useful to calculate a total score"); the tile reports the total as a frequency quantifier and surfaces the three factor subscale sums. The three-factor membership (aggressive / physically non-aggressive / verbally agitated) is the manual's most-cited nursing-home solution; factor membership varies by population and is noted.
- Free for clinical/research use with attribution; journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- Floor 29 (all never); ceiling 203 (all several-times-an-hour); factor floors (aggressive 9, physically non-aggressive 6, verbally agitated 5); a mid total (one item at 7) reflects the bounded sum; out-of-range (0 or 8) and blank -> valid:false.

## Edge-input handling notes
- Each item validated to 1-7; any null/blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
