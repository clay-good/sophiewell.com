# v12 audit - ad8

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Galvin JE, Roe CM, Powlishta KK, et al. The AD8: a brief informant interview to detect dementia. Neurology. 2005;65(4):559-564. Scoring/cut cross-verified against the Washington University Knight ADRC AD8 instrument page (>= 2 sources, spec-v97).

`lib/ltcga-v173.js ad8()` counts the 8 "Yes, a change" informant items, 0-8. Group G, Class A.

## Source-governance notes
- Total = count of items endorsed as a change due to thinking/memory problems; 0-1 normal, >= 2 suggests cognitive impairment.
- Journal + WashU issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/8 normal; 1 normal and 2 impairment (the >= 2 band flip); 8/8 impairment; a missing item and {} -> valid:false.

## Edge-input handling notes
- Every item must be answered yes/no; an unanswered item -> valid:false; never NaN (spec-v59 fuzz pass).
