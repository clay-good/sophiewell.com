# v12 audit - cdr-sob

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology. 1993;43(11):2412-2414. Staging ranges: O'Bryant SE, Waring SC, Cullum CM, et al. Arch Neurol. 2008;65(8):1091-1095. Box structure and the personal-care no-0.5 rule cross-verified against the WashU CDR scoring rules (>= 2 sources, spec-v97).

`lib/ltcga-v173.js cdrSob()` sums the six CDR boxes to 0-18. Group G, Class A.

## Source-governance notes
- Memory, orientation, judgment & problem-solving, community affairs, home & hobbies each 0/0.5/1/2/3; personal care 0/1/2/3 (no 0.5).
- O'Bryant 2008 global-CDR staging from the SOB: 0 none, 0.5-4.0 questionable/very mild, 4.5-9.0 mild, 9.5-15.5 moderate, 16.0-18.0 severe.
- Journal issuers; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0 none; 4.0 questionable and 4.5 mild (the very-mild/mild flip, tile example); 9.0 mild and 9.5 moderate; 16.0 severe; personal-care 0.5 and blanks -> valid:false.

## Edge-input handling notes
- Box values validated against the allowed set (personal care has no 0.5); any invalid/blank box -> valid:false; never NaN (spec-v59 fuzz pass).
