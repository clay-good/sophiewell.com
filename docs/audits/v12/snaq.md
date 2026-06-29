# v12 audit - snaq

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Wilson MM, Thomas DR, Rubenstein LZ, et al. Appetite assessment: simple appetite questionnaire predicts weight loss. Am J Clin Nutr. 2005;82(5):1074-1081. Four 1-5 items, 4-20 total, and the <= 14 cutoff cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v178.js snaq()` sums the 4 items to 4-20. Group G, Class A.

## Source-governance notes
- Four appetite items each 1-5; total 4-20; <= 14 predicts >= 5% weight loss within 6 months. This is the Simplified Nutritional Appetite Questionnaire (Wilson 2005), NOT the Short Nutritional Assessment Questionnaire. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- 12/20 predicts weight loss; 14 at-risk and 15 not (the cut edge); floor 4 and ceiling 20; out-of-range/blank -> valid:false.

## Edge-input handling notes
- Each item 1-5; otherwise valid:false; never NaN (spec-v59 fuzz pass).
