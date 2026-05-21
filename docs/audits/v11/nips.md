# v11 audit - nips

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Lawrence J, Alcock D, McGrath P, Kay J, MacMurray SB, Dulberg C. *The development of a tool to assess neonatal pain.* Neonatal Netw. 1993;12(6):59-66. Six behavioral items - facial expression (0/1), cry (0/1/2), breathing patterns (0/1), arms (0/1), legs (0/1), state of arousal (0/1). Total 0-7. Bands: 0-2 no/mild; 3-4 mild-to-moderate; >4 severe.

`lib/scoring-v4.js nips()` validates each item as an integer within its per-item max (1 for all except cry which is 0-2), sums to 0-7, and returns `{score, parts, band, text}`.

## Boundary examples added

- 0 (all zero; tile example) -> no / mild pain.
- 2 (upper edge of no/mild) -> no / mild pain.
- 3 (lower edge of mild-moderate) -> mild-to-moderate pain.
- 4 (upper edge of mild-moderate) -> mild-to-moderate pain.
- 5 (lower edge of severe) -> severe pain.
- 7 (all maxima) -> severe pain.

## Cross-implementation differential

- Reference: Lawrence 1993 worked example "facial 1, cry 2, breathing 1, arms 1, legs 0, state 1 -> total 6, severe pain band (>4 cutoff)."
- Sophie result: score 6, band severe. PASS.

## Edge-input handling notes

- Per-item out-of-range values throw (e.g. facial 2 throws; cry 3 throws). Negative values throw.

## A11y / keyboard notes

- Six labeled range inputs (one 0-2 for cry, five 0-1 for the rest) with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
