# v12 audit - sarc-f

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Malmstrom TK, Morley JE. SARC-F: a simple questionnaire to rapidly diagnose sarcopenia. J Am Med Dir Assoc. 2013;14(8):531-532. Five items (Strength, Assistance walking, Rise, Climb stairs, Falls), 0-2 each, 0-10 total, >= 4 cutoff cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v177.js sarcF()` sums the 5 items to 0-10. Group G, Class A.

## Source-governance notes
- Five items each 0 (none) / 1 (some) / 2 (a lot / unable); total 0-10; >= 4 predicts sarcopenia. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/10 negative; 3 negative and 4 positive (the >= 4 cut flip); 10/10 positive; out-of-range/blank -> valid:false.

## Edge-input handling notes
- Each item validated 0-2; blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
