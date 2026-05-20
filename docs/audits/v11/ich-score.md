# v11 audit - ich-score

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. *The ICH score: a simple, reliable grading scale for intracerebral hemorrhage.* Stroke. 2001;32(4):891-897. Five components: GCS (3-4 -> 2; 5-12 -> 1; 13-15 -> 0), age >=80 -> 1, ICH volume >=30 mL -> 1, infratentorial origin -> 1, intraventricular hemorrhage -> 1. Total 0-6. 30-day mortality per Hemphill 2001 Table 4: 0% / 13% / 26% / 72% / 97% / 100% / 100%.

`lib/scoring-v4.js ichScore()` returns `{score, parts, mortality30d, band}`.

## Boundary examples added
- 0 (tile example: GCS 15, age 70, vol 10) -> 0%.
- 1 (age >=80 alone) -> 13%.
- 2 (GCS 5-12 + age>=80) -> 26%.
- 3 (GCS 5-12 + vol>=30 + IVH) -> 72%.
- 4 (GCS 3-4 + vol>=30 + IVH) -> 97%.
- 6 (all 5 maxima) -> 100%.

## Cross-implementation differential
- Reference: Hemphill 2001 Table 4 mortality bands.
- Sophie result: matches across all six boundary cases above. PASS.

## Edge-input handling notes
- GCS outside 3-15 throws; age and volume outside [0, inf) throw.

## A11y / keyboard notes
- Three labeled range inputs and two checkboxes; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
