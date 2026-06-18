# v12 audit - brugada-vt

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Brugada P, Brugada J, Mont L, et al. Circulation. 1991;83(5):1649-1659.

`lib/cardio-v104.js brugadaVt()` evaluates the four sequential Brugada steps in order, returns the verdict at the first positive step (VT), names that step, and returns SVT with aberrancy when all four are negative. Class A (fixed 1991 algorithm).

## Boundary worked examples added
- all steps negative -> SVT with aberrancy (defined verdict, firedStep null).
- step 1 positive -> VT, names step 1.
- first-positive-wins: step 3 positive while 1-2 negative names step 3.
- fuzz: boolean step logic, no arithmetic surface, no non-finite leak.

## Cross-implementation differential
- Reference: the Brugada 1991 four-step sequence (verified against AER/PMC, Healio, ECGbook secondary sources reproducing the original). Match. PASS.

## Edge-input handling notes
- Boolean flags only; a fully-negative input returns the SVT verdict rather than an undefined state.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
