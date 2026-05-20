# v11 audit - norton-push

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Norton D, McLaren R, Exton-Smith AN. *An Investigation of Geriatric Nursing Problems in Hospital.* Churchill Livingstone, 1962 (five 1-4 items; total 5-20; <=14 at risk). PUSH Tool 3.0: NPIAP/NPUAP 2005 (Ratliff CR, Rodeheaver GT; length-by-width band 0-10, exudate 0-3, tissue type 0-4; total 0-17; declining total indicates healing).

`lib/scoring-v4.js nortonPush()` clamps each Norton item to [1, 4] and each PUSH item to its allowed range, returning `{norton, nortonTotal, nortonBand, push, pushTotal, text}`.

## Boundary examples added
- Norton 20 (all maxima; tile example) -> low risk.
- Norton 19 (lower edge of low) -> low.
- Norton 18 (upper edge of medium) -> medium.
- Norton 14 (upper edge of at risk) -> at risk.
- PUSH 17 (all maxima) -> high total.
- PUSH clamps out-of-range to 10 / 0 / 4.

## Cross-implementation differential
- Reference: Norton 1962 derivation cohort bands; PUSH 3.0 NPIAP 2005 worked examples.
- Sophie result: matches Norton bands across the four cases above; PUSH total matches the worked-example sum. PASS.

## Edge-input handling notes
- Norton items clamp to [1, 4]; PUSH items clamp to their respective max values.

## A11y / keyboard notes
- Eight labeled range inputs with linked output spans; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
