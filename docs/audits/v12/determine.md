# v12 audit - determine

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Posner BM, Jette AM, Smith KW, Miller DR. Nutrition and health risks in the elderly: the nutrition screening initiative. Am J Public Health. 1993;83(7):972-978. The ten item weights were re-fetched VERBATIM from the ACL / Nutrition Screening Initiative "DETERMINE Your Nutritional Health" checklist (weights 2,3,2,2,2,4,1,1,2,2 = 21) and the bands cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v178.js determine()` sums the 10 weighted items to 0-21. Group G, Class A.

## Source-governance notes
- Weights: illness 2, fewer than 2 meals 3, few fruits/veg/milk 2, alcohol 2, tooth/mouth 2, money 4, eats alone 1, 3+ medications 1, 10-lb weight change 2, unable to self-care 2 (max 21). Bands 0-2 good, 3-5 moderate, >= 6 high. Journal/NSI issuer; "NSI" not in ISSUER_PATTERN; no staleness row.

## Boundary worked examples added
- 0 good; 2 good, 3 moderate, 6 high (the band edges); all-yes max 21; blanks -> valid:false.

## Edge-input handling notes
- All 10 yes/no required; otherwise valid:false; never NaN (spec-v59 fuzz pass).
