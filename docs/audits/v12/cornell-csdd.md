# v12 audit - cornell-csdd

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Alexopoulos GS, Abrams RC, Young RC, Shamoian CA. Cornell Scale for Depression in Dementia. Biol Psychiatry. 1988;23(3):271-284. The 19 items across five domains, the a/0/1/2 anchors, the unable-to-evaluate-scores-0 rule, the 0-38 range, and the > 10 probable / > 18 definite bands cross-verified against the Cornell administration-and-scoring form (>= 2 sources, spec-v97).

`lib/ltcga-v174.js cornellCsdd()` sums the 19 items to 0-38. Group G, Class A.

## Source-governance notes
- 19 items (4 mood-related, 4 behavioral disturbance, 3 physical signs, 4 cyclic functions, 4 ideational disturbance), each a (unable to evaluate, contributes 0) / 0 absent / 1 mild-intermittent / 2 severe.
- Bands: < 6 no significant depressive symptoms, 6-10 some depressive symptoms below the probable cut, > 10 probable major depression, > 18 definite. The original/authoritative thresholds use strict greater-than ("scores above 10 / above 18"); a local > 12 single-cutoff variant was seen and rejected as non-authoritative.
- "a" is reported as an unrated item so a partially-completed scale never silently inflates/deflates the band.
- Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/38 none; 10 some symptoms and 11 probable (the > 10 flip); 18 probable and 19 definite (the > 18 flip); 38/38 definite; two "a" items contribute 0 and report unrated; out-of-range (3) and blank -> valid:false.

## Edge-input handling notes
- Each item a/0/1/2; any null/blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
