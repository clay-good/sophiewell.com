# v11 audit - Cincinnati Prehospital Stroke Scale (`cincinnati`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. Cincinnati Prehospital Stroke Scale: reproducibility and validity. Acad Emerg Med. 1997;4(9):986-990. Three signs (facial droop, arm drift, abnormal speech); each 0 = normal or 1 = abnormal; any positive sign = positive screen.

## Boundary examples added
`cincinnatiStroke({facialDroop, armDrift, abnormalSpeech})` in [lib/field.js:72](../../../lib/field.js#L72).
- low: all three normal (0,0,0) -> total 0, positive=false. PASS.
- mid (META example: face=1, arm=0, speech=0): total 1, positive=true (1 of 3). PASS (matches META expected "POSITIVE (1 of 3)").
- high: all three abnormal (1,1,1) -> total 3, positive=true. PASS.
- single sign: speech=1 only -> positive=true (any one sign positive screens). PASS.

## Cross-implementation differential
- Reference implementation: original Kothari 1997 paper Table 2 scoring rules; cross-checked against MDCalc Cincinnati Prehospital Stroke Scale calculator.
- Test case: META example (1, 0, 0).
- Sophie result: POSITIVE (1 of 3).
- Reference result: positive screen (>=1 sign abnormal).
- Delta: 0/0. PASS.

## Edge-input handling notes
- `num()` enforces each input to be in [0, 1]; non-binary values throw RangeError caught by `safe()`.
- Renderer uses range sliders (min 0, max 1, step 1) so non-binary input is impossible from the UI.
- Optional time-of-last-known-well is free-text echoed back; not parsed (the scale is silence-on-time and Sophie records what the EMS provider typed).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three range sliders with associated `<output>` value indicators; labels include "(0 = normal, 1 = abnormal)" for screen readers. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
