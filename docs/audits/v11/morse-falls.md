# v11 audit - morse-falls

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Morse JM, Morse RM, Tylko SJ. *Development of a scale to identify the fall-prone patient.* Can J Aging. 1989;8(4):366-377. Six weighted items: history of falling (0/25), secondary diagnosis (0/15), ambulatory aid (none 0 / crutches-cane-walker 15 / furniture 30), IV or heparin lock (0/20), gait (normal 0 / weak 10 / impaired 20), mental status (oriented 0 / forgets limitations 15). Bands: 0-24 low, 25-50 moderate, >=51 high.

`lib/scoring-v4.js morseFalls()` maps each picker to its weight, sums to a 0-125 total, and returns `{score, parts, band, text}`.

## Boundary examples added
- 0 of 125 (nothing endorsed; tile example) -> low.
- 15 (secondary diagnosis only) -> low.
- 25 (history alone; lower edge of moderate) -> moderate.
- 50 (history + secondary + weak gait; upper edge of moderate) -> moderate.
- 80 (5 of 6 items; high band) -> high.
- 125 (all maxima) -> high.

## Cross-implementation differential
- Reference: Morse 1989 derivation, "history alone -> 25, moderate-risk band entry."
- Sophie result: score 25, band moderate. PASS.

## Edge-input handling notes
- Unknown enum tokens default to 0 (the safe, lowest-weight bucket).

## A11y / keyboard notes
- Two checkboxes and three labeled selects; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
