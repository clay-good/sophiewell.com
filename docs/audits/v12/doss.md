# v12 audit - doss

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Schuurmans MJ, Shortridge-Baggett LM, Duursma SA. The Delirium Observation Screening Scale: a screening instrument for delirium. Res Theory Nurs Pract. 2003;17(1):31-50. The 13-item short form, 0/1 per-item scoring, 0-13 range, the 3 reverse-scored items, and the >= 3 cut cross-verified against the BEST-project verbatim form and an independent validation study (>= 2 sources, spec-v97).

`lib/ltcga-v174.js doss()` counts the 13 present behaviors, 0-13. Group G, Class A.

## Source-governance notes
- 13-item short form; each item present(1)/absent(0); total 0-13; >= 3 suggests delirium.
- Three items on the original form are reverse-scored (the normal behaviors "maintains attention", "knows the time of day", "remembers recent event"); each is phrased here in its abnormal/scoring direction so a present answer scores 1, leaving the published net 0/1 mapping unchanged.
- Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/13 below cut; 2 below cut and 3 suggests delirium (the >= 3 flip); 13/13 suggests delirium; an unanswered item and {} -> valid:false.

## Edge-input handling notes
- Each item present/absent; any unanswered -> valid:false; never NaN (spec-v59 fuzz pass).
