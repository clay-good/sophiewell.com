# v12 audit - sof-frailty-index

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Ensrud KE, Ewing SK, Taylor BC, et al. Comparison of 2 frailty indexes for prediction of falls, disability, fractures, and death in older women. Arch Intern Med. 2008;168(4):382-389. The 3 items, 0-3 total, and the 0 robust / 1 pre-frail / >= 2 frail bands cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v177.js sofFrailtyIndex()` sums the 3 items to 0-3. Group G, Class A.

## Source-governance notes
- Items each +1: weight loss >= 5% over the prior year; cannot rise from a chair 5 times without arms; reduced energy ("no" to "full of energy?"). Total 0-3; 0 robust, 1 pre-frail, >= 2 frail. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0 robust; 1 pre-frail and 2 frail (the band edges); 3 frail; blank -> valid:false.

## Edge-input handling notes
- All 3 yes/no required; blank -> valid:false; never NaN (spec-v59 fuzz pass).
