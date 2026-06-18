# v12 audit - vereckei-avr

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Vereckei A, Duray G, Szenasi G, et al. Heart Rhythm. 2008;5(1):89-98.

`lib/cardio-v104.js vereckeiAvr()` evaluates the four sequential aVR steps in order, returns VT at the first positive step (naming it), and returns supraventricular when all four are negative. Class A (fixed 2008 algorithm).

## Boundary worked examples added
- all steps negative -> supraventricular (defined verdict).
- step 1 (initial dominant R in aVR) positive -> VT.
- vi/vt <= 1 (step 4) alone -> VT.
- fuzz: boolean step logic, no non-finite leak.

## Cross-implementation differential
- Reference: the Vereckei 2008 four-step aVR algorithm (verified against my-ekg.com verbatim wording and the JAHA 2020 reappraisal). vi/vt threshold is <= 1. Match. PASS.

## Edge-input handling notes
- Boolean flags only; fully-negative input returns the supraventricular verdict.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
