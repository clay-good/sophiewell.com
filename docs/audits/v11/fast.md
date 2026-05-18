# v11 audit - FAST and BE-FAST Stroke Assessment (`fast`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Kleindorfer DO et al. Designing a message for public stroke education using the FAST mnemonic. Stroke. 2007;38(10):2864-2868. BE-FAST extension: Aroor S, Singh R, Goldstein LB. BE-FAST: reducing the proportion of strokes missed using the FAST mnemonic. Stroke. 2017;48(2):479-481. Any positive item (Face / Arm / Speech, plus Balance / Eyes for BE-FAST) flips the screen positive.

## Boundary examples added
`fast(answers, {extended: true})` in [lib/field.js:81](../../../lib/field.js#L81).
- low: all five checkboxes unchecked -> negative. PASS.
- mid (META example: face only): FAST positive. PASS (matches META expected).
- high: all five abnormal -> positive (BE-FAST). PASS.
- balance-only (no FAST): the renderer flips the displayed label to "BE-FAST: POSITIVE" because either Balance or Eyes triggers the BE-FAST branch. PASS.
- speech-only: positive (single FAST sign suffices per Kleindorfer 2007). PASS.

## Cross-implementation differential
- Reference implementation: Kleindorfer 2007 boolean OR over FAST items; BE-FAST adds the same OR over Balance/Eyes per Aroor 2017.
- Test case: META example (face droop alone).
- Sophie result: FAST: POSITIVE.
- Reference result: positive screen.
- Delta: 0/0. PASS.

## Edge-input handling notes
- All inputs are checkboxes, so non-binary entry is impossible.
- The renderer dynamically promotes the label from "FAST" to "BE-FAST" when Balance or Eyes is checked, matching the intent of the BE-FAST extension.
- Time-of-last-known-well field is free-text echoed; not parsed.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- All five checkboxes labelled; one labelled text field. Reset-to-example yields a non-alarming "FAST: POSITIVE" with face-droop only. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
