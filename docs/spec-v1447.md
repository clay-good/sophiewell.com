# spec-v1447 — CPAK knee alignment phenotype

Found through the EFORT Open Reviews series (a knee-alignment review, PMC12494059): `cpak`, `ahka`
and `joint line obliquity` matched nothing. The catalog grades knee arthritis
(`kellgren-lawrence`) and meniscal tears, and had nothing for the constitutional alignment that knee
arthroplasty planning now starts from.

## Source, read 2026-09-24

MacDessi SJ et al, *Bone Joint J* 2021;103-B:329-337 (open access, PMC7954147; DOI checked):

- aHKA = MPTA - LDFA (negative varus, positive valgus); JLO = MPTA + LDFA (above 180 apex proximal,
  below 180 apex distal).
- "CPAK boundaries for neutral aHKA are 0 deg +/- 2 deg, inclusive ... for a neutral JLO are 180
  deg +/- 3 deg, inclusive."
- The nine-type matrix is a figure; the text places types I (varus, apex distal), II (neutral,
  apex distal), IV (varus, neutral) and V (neutral, neutral), which fixes the 3 x 3 order and so the
  other five. Types II, I and V were the commonest; VII-IX were rare.
- "The aHKA is not affected by joint space narrowing or tibiofemoral subluxation"; the EFORT review
  adds that an extra-articular deformity can still affect it.

## Behavior

Two angles in degrees; both required. The answer gives the type, the aHKA and the JLO, with the
inclusive neutral edges exactly as the paper states them. The 60-120 degree limit is a
transcription check. It describes a phenotype; it does not choose an alignment strategy.

## Tests

`test/unit/cpak.test.js`: the two formulas, all nine cells, the four inclusive edges, refusals.
