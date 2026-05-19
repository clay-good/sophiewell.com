# v11 audit - cam-icu

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Ely EW, Inouye SK, Bernard GR, et al. *Delirium in mechanically ventilated patients: validity and reliability of the Confusion Assessment Method for the ICU (CAM-ICU).* JAMA. 2001;286(21):2703-2710. Four-feature algorithm: feature 1 (acute onset or fluctuating course) AND feature 2 (inattention) AND (feature 3 (altered level of consciousness) OR feature 4 (disorganized thinking)).

`lib/scoring-v4.js camIcu()` implements the Ely 2001 algorithm exactly. The renderer surfaces each feature as a labeled checkbox so a bedside clinician can mirror the published flowchart.

## Boundary examples added
- negative (tile example): no features checked -> CAM-ICU negative.
- negative (partial): features 1 + 2 only -> CAM-ICU negative (algorithm also requires 3 or 4).
- positive (1 + 2 + 3): acute onset, inattention, altered LOC -> CAM-ICU positive.
- positive (1 + 2 + 4): acute onset, inattention, disorganized thinking -> CAM-ICU positive.
- not positive (2 + 3 + 4 without 1): inattention, altered LOC, disorganized thinking but no acute onset -> CAM-ICU negative.

## Cross-implementation differential
- Reference implementation: Ely EW, et al. JAMA. 2001;286(21):2703-2710 algorithm flowchart.
- Test case: features 1, 2, and 4 present.
- Sophie result: positive = true.
- Reference result: positive (1 + 2 + (3 or 4)). PASS.

## Edge-input handling notes
- Four boolean inputs only.
- Algorithm is short-circuit AND/OR; partial input renders the appropriate negative path.

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
