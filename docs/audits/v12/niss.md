# v12 audit - niss

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Osler T, Baker SP, Long W. J Trauma. 1997;43(6):922-925.

`lib/trauma-v108.js niss()` sums the squares of the three highest AIS severities
(1-6) regardless of body region, clamping each AIS to 1-6 and forcing the maximal
score 75 when any AIS is 6 (the AIS-6 convention ISS also uses). Class A.

## Boundary worked examples added
- no AIS entered -> fallback.
- sum of squares of the three worst AIS (5,4,3) = 50, major trauma.
- band flip: an AIS 6 forces the maximal score 75.
- three AIS of 2 -> 12, not major.
- AIS clamps to 1-6 and rounds.
- single AIS scores its square.

## Cross-implementation differential
- Reference: the sum-of-squares-of-three-worst-any-region rule and the AIS-6 -> 75
  convention cross-verified against the J Trauma full text and trauma-scoring
  references. The NISS departure from ISS (no three-region requirement) is the
  defining difference, stated in the note. Match. PASS.

## Edge-input handling notes
- a severity entered below 1 (or rounding to 0) is dropped; at least one valid AIS
  is required. NISS >= 16 marks major trauma.

## A11y / keyboard notes
- Labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
