# v12 audit - modified-caregiver-strain-index

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Thornton M, Travis SS. Analysis of the reliability of the Modified Caregiver Strain Index. J Gerontol B Psychol Sci Soc Sci. 2003;58(2):S127-S132. The 13 items, 0/1/2 scoring, and 0-26 range cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v182.js modifiedCaregiverStrainIndex()` sums 13 items to 0-26. Group G, Class A.

## Source-governance notes
- 13 items each 0 (no) / 1 (sometimes) / 2 (regularly); total 0-26; higher = greater strain; no official cut. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- floor 0 and ceiling 26; all-ones 13; out-of-range/blank -> valid:false.

## Edge-input handling notes
- Each item 0-2; blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
