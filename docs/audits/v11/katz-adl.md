# v11 audit - katz-adl

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Katz S, Ford AB, Moskowitz RW, Jackson BA, Jaffe MW. *Studies of illness in the aged. The index of ADL: a standardized measure of biological and psychosocial function.* JAMA. 1963;185(12):914-919. Six binary ADL items (bathing, dressing, toileting, transferring, continence, feeding); each scored 1 (independent) or 0 (dependent). Total 0-6. Bands per Katz 1963: 6 = full independence, 5 = mild impairment, 3-4 = moderate impairment, 0-2 = severe functional impairment.

`lib/scoring-v4.js katzAdl()` validates each of the six ADL items as integer 0 or 1, sums to a 0-6 total, and bands per Katz 1963.

## Boundary examples added

- Score 6 (tile example, all independent) -> full independence.
- Score 5 (one dependent) -> mild impairment.
- Score 4 (upper edge of moderate) -> moderate impairment.
- Score 3 (lower edge of moderate) -> moderate impairment.
- Score 2 (upper edge of severe) -> severe functional impairment.
- Score 0 (all dependent) -> severe functional impairment.

## Cross-implementation differential

- Reference: Katz 1963 publishes the six-item form and the band cutoffs at 6 / 5 / 3-4 / 0-2 verbatim; the same banding is in OASIS-D documentation and the AGS Beers Criteria 2023 functional-decline screen.
- Sophie result: A 5 returns "mild impairment"; A 3 returns "moderate impairment"; A 2 returns "severe functional impairment". PASS.

## Edge-input handling notes

- Non-binary (>1, <0, 0.5), non-integer (NaN), and missing items throw.

## A11y / keyboard notes

- Six labeled 0-1 range fields, all Tab-reachable; aria-live result region wraps the tile output, including a per-item independent/dependent muted summary line. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
