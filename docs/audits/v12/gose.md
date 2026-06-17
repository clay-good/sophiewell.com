# v12 audit - gose

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Wilson JT, Pettigrew LE, Teasdale GM. Structured interviews for the Glasgow Outcome Scale and the Extended Glasgow Outcome Scale. J Neurotrauma. 1998;15(8):573-585.

`lib/neuro-v95.js gose()` maps the 8-category GOS-E (1-8) to its descriptor and to the legacy 5-point GOS via a fixed lookup, validated both directions in the unit test.

## Boundary worked examples added
- GOS-E 3 and 4 both -> legacy GOS 3 (severe disability).
- GOS-E 7 and 8 both -> legacy GOS 5 (good recovery).
- GOS-E 5 and 6 -> legacy GOS 4 (moderate disability); endpoints 1 (dead), 2 (vegetative).

## Cross-implementation differential
- Reference: Wilson 1998 GOS-E categories and the GOS-E -> GOS collapse. Match. PASS.

## Edge-input handling notes
- A category outside 1-8 or a blank returns a surfaced valid:false guard. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- One labeled <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the category and legacy mapping only.

## Defects opened
- none

## Status
- PASS
