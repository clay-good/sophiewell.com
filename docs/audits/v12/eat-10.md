# v12 audit - eat-10

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Belafsky PC, Mwamba D, Rees CJ, et al. Validity and reliability of the Eating Assessment Tool (EAT-10). Ann Otol Rhinol Laryngol. 2008;117(12):919-924. Ten 0-4 items, 0-40 total, and the >= 3 abnormal cutoff cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v178.js eat10()` sums the 10 items to 0-40. Group G, Class A.

## Source-governance notes
- Ten self-report items each 0 (no problem) to 4 (severe); total 0-40; >= 3 abnormal swallowing / aspiration risk. Patient self-report complement to a clinician swallow test. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- 0/40 normal; 2 normal and 3 abnormal (the >= 3 cut flip); ceiling 40; out-of-range/blank -> valid:false.

## Edge-input handling notes
- Each item 0-4; otherwise valid:false; never NaN (spec-v59 fuzz pass).
