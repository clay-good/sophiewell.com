# v12 audit - caregiver-strain-index

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Robinson BC. Validation of a Caregiver Strain Index. J Gerontol. 1983;38(3):344-348. The 13 yes/no items, 0-13 range, and >= 7 high-strain threshold cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v182.js caregiverStrainIndex()` counts yes answers to 0-13. Group G, Class A.

## Source-governance notes
- 13 yes/no items, each yes = 1; total 0-13; >= 7 indicates a high level of caregiver strain. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- counts yes answers (0 and 13); 6 not high vs 7 high (the >= 7 flip); blank -> valid:false.

## Edge-input handling notes
- All 13 yes/no required; blank -> valid:false; never NaN (spec-v59 fuzz pass).
