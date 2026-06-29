# v12 audit - steadi-algorithm

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Stevens JA, Phelan EA. Development of STEADI: a fall prevention resource for health care providers. Health Promot Pract. 2013;14(5):706-714; CDC STEADI fall-risk algorithm. The screen-then-stratify pathway (negative screen -> low; positive screen -> high on recurrent/injurious falls or a gait/balance problem, else moderate) cross-verified against the CDC STEADI algorithm and the Lohman operationalization (>= 2 sources, spec-v97).

`lib/ltcga-v176.js steadiAlgorithm()` maps the three screening questions plus the gait/strength/balance result to low/moderate/high. Group G, Class B (CDC -> citation-staleness row).

## Source-governance notes
- Negative screen (no fall, not unsteady, not worried) -> low risk.
- Positive screen -> high risk when there is a recurrent (>= 2) or injurious fall or a gait/strength/balance problem; otherwise moderate.
- A reported fall requires its count and injury detail before scoring. Cites the CDC (STEADI); trips ISSUER_PATTERN -> docs/citation-staleness.md row.

## Boundary worked examples added
- negative -> low; positive (unsteady/worried) without a fall or gait problem -> moderate; positive + gait problem -> high; recurrent or injurious fall -> high; single non-injurious fall -> moderate; reported fall without detail -> valid:false.

## Edge-input handling notes
- four yes/no screen items required; a reported fall additionally requires count and injury; otherwise valid:false; deterministic pathway, never NaN (spec-v59 fuzz pass).
