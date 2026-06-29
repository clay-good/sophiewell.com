# v12 audit - chair-stand-30s

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Jones CJ, Rikli RE, Beam WC. A 30-s chair-stand test as a measure of lower body strength in community-residing older adults. Res Q Exerc Sport. 1999;70(2):113-119; CDC STEADI below-average age/sex norms. The full age/sex below-average table (ages 60-94, by sex) re-fetched verbatim and cross-verified across independent reproductions of the CDC STEADI norms (>= 2 sources, spec-v97).

`lib/ltcga-v176.js chairStand30s()` compares the stand count against the age/sex cut-point. Group G, Class B (CDC -> citation-staleness row).

## Source-governance notes
- Below-average cut-points (a count below = increased fall risk): men 60-64:14, 65-69:12, 70-74:12, 75-79:11, 80-84:10, 85-89:8, 90-94:7; women 60-64:12, 65-69:11, 70-74:10, 75-79:10, 80-84:9, 85-89:8, 90-94:4.
- Outside ages 60-94 there is no stratum -> valid:false (never a guessed band).
- Cites the CDC (STEADI); trips ISSUER_PATTERN -> docs/citation-staleness.md row.

## Boundary worked examples added
- below-norm flip at a band edge (women 75-79 cut-point 10: 9 below, 10 not); men 60-64 cut 14; women 90-94 cut 4; outside 60-94 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- stand count, age, sex validated; missing stratum or blank -> valid:false; never NaN (spec-v59 fuzz pass).
