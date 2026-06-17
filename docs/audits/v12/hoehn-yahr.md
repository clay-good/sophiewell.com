# v12 audit - hoehn-yahr

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Hoehn MM, Yahr MD. Parkinsonism: onset, progression and mortality. Neurology. 1967;17(5):427-442.

`lib/neuro-v95.js hoehnYahr()` maps a Hoehn & Yahr stage to its descriptor and names whether the stage belongs to the original 1-5 scale or the modified scale (the 0 / 1.5 / 2.5 half-steps).

## Boundary worked examples added
- integer stage 2 -> original scale; stage 5 endpoint (wheelchair/bedridden).
- half-step 2.5 -> modified scale (mild bilateral, recovers on pull test).
- stages 0 and 1.5 -> modified-only.

## Cross-implementation differential
- Reference: Hoehn-Yahr 1967 original stages + the widely used modified half-steps. Match. PASS.

## Edge-input handling notes
- An unknown stage (3.5, 6) or blank returns a surfaced valid:false guard. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- One labeled <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the stage and variant only.

## Defects opened
- none

## Status
- PASS
