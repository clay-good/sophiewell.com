# v12 audit - four-stage-balance

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: CDC STEADI — Assessment: 4-Stage Balance Test (Stopping Elderly Accidents, Deaths & Injuries toolkit). The four progressive stances and the full-tandem >= 10 s flag cross-verified across independent reproductions of the CDC STEADI instrument (>= 2 sources, spec-v97).

`lib/ltcga-v176.js fourStageBalance()` flags inability to hold the full tandem stance for 10 s. Group G, Class B (CDC -> citation-staleness row).

## Source-governance notes
- The value compared is the full-tandem hold time in seconds vs the 10 s cut-point; held < 10 s indicates increased fall risk.
- Cites the CDC (STEADI); trips ISSUER_PATTERN -> docs/citation-staleness.md row.

## Boundary worked examples added
- tandem held 8 s -> increased risk; 9.9 vs 10 boundary flip; >= 10 s not flagged; blank/negative -> valid:false.

## Edge-input handling notes
- hold time validated finite and >= 0; blank/negative -> valid:false; never NaN (spec-v59 fuzz pass).
