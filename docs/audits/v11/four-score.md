# v11 audit - four-score

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland RL. *Validation of a new coma scale: The FOUR score.* Ann Neurol. 2005;58(4):585-593. Four ordinal components each scored 0-4: eye response, motor response, brainstem reflexes, and respiration; total 0-16. Designed for the ICU and explicitly for intubated patients (the GCS verbal component is omitted in favor of a respiration component that captures intubation and over-breathing of the ventilator). The FOUR is a measurement — there is no banded risk classification in Wijdicks 2005; the score = 0 pattern is the one Wijdicks 2010 AAN guidance ties to brain-death workup as a screen for confounders.

`lib/scoring-v4.js fourScore()` validates each of the four components as an integer 0-4, sums to a 0-16 total, and surfaces an "all maximal" note at score 16, the "all four absent / AAN 2010 brain-death-workup" note at score 0, and an "Intermediate pattern" message with the per-component E/M/B/R values otherwise.

## Boundary examples added

- Score 16 (tile example, E4 M4 B4 R4) -> "All four components maximal".
- Score 0 (all absent, E0 M0 B0 R0) -> AAN 2010 brain-death-workup note.
- Score 10 (E2 M3 B4 R1) -> "Intermediate" with E2 M3 B4 R1 reported.
- Score 1 (minimum non-zero) -> "Intermediate".

## Cross-implementation differential

- Reference: Wijdicks 2005 publishes the FOUR Score with the four ordinal components and the 0-16 total range. The Wijdicks 2010 AAN brain-death determination guidance ties the FOUR=0 pattern to the brain-death-workup screen.
- Sophie result: a maximal pattern returns score 16; a fully-absent pattern returns score 0 with the AAN note. PASS.

## Edge-input handling notes

- Non-integer (NaN, 2.5), out-of-range (5, -1), and missing components throw.

## A11y / keyboard notes

- Four labeled range fields with linked labels; aria-live result region wraps the tile output, including the per-component E/M/B/R muted line. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
