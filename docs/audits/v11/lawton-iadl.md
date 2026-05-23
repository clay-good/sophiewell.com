# v11 audit - lawton-iadl

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Lawton MP, Brody EM. *Assessment of older people: self-maintaining and instrumental activities of daily living.* Gerontologist. 1969;9(3):179-186. Eight instrumental ADL items: telephone use, shopping, food preparation, housekeeping, laundry, mode of transportation, responsibility for own medications, ability to handle finances. Each item scored 1 (independent) or 0 (needs help). Total 0-8 on the modern unisex form (the 1969 original sex-stratified men out of 5; current published forms score all eight items for both sexes).

`lib/scoring-v4.js lawtonIadl()` validates each of the eight IADL items as integer 0 or 1, sums to a 0-8 total, and bands per common geriatric-assessment usage: 8 = full independence, 6-7 = mild impairment, 3-5 = moderate impairment, 0-2 = severe impairment.

## Boundary examples added

- Score 8 (tile example, all independent) -> full independence.
- Score 7 (one dependent) -> mild impairment.
- Score 6 (lower edge of mild) -> mild impairment.
- Score 5 (upper edge of moderate) -> moderate impairment.
- Score 3 (lower edge of moderate) -> moderate impairment.
- Score 2 (upper edge of severe) -> severe impairment.
- Score 0 (all dependent) -> severe impairment.

## Cross-implementation differential

- Reference: Lawton 1969 publishes the eight-item IADL form and the binary "needs help / independent" collapse. Banding cutoffs (6-7 / 3-5 / 0-2) follow the geriatric-assessment usage cited by the AGS and the Hartford Institute "Try This" series for the Lawton IADL.
- Sophie result: An 8 returns "full independence"; a 7 returns "mild impairment"; a 5 returns "moderate"; a 2 returns "severe". PASS.

## Edge-input handling notes

- Non-binary (>1, <0, 0.5), non-integer (NaN), and missing items throw.

## A11y / keyboard notes

- Eight labeled 0-1 range fields, all Tab-reachable; aria-live result region wraps the tile output. The muted summary line lists the IADLs the patient needs help with for the discharge note. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
