# v11 audit - meows

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Singh A, McGlennan A, England A, Simons R. *A validation study of the CEMACH recommended modified early obstetric warning system (MEOWS).* Anaesthesia. 2012;67(1):12-18. Track-and-trigger chart with per-parameter yellow/red thresholds for respiratory rate, SpO2, temperature, systolic and diastolic BP, heart rate, neurological response (AVPU), and pain score (0-3). Trigger = any one red parameter or two or more yellow parameters.

`lib/scoring-v4.js meows()` classifies each of the eight parameters as normal/yellow/red per Singh 2012 Table 1, counts reds and yellows, and returns `{flags, redCount, yellowCount, trigger, band, text}`.

## Boundary examples added

- All-normal vitals (tile example) -> no trigger.
- Single yellow (HR 110) -> no trigger.
- Two yellows (HR 110, SBP 95) -> trigger.
- Single red (SBP 80) -> trigger.
- SpO2 94 -> red (Singh's <95 cutoff is the only SpO2 zone).
- Temp 35.5 -> yellow; 34.9 -> red (the 35.0 boundary).

## Cross-implementation differential

- Reference: Singh 2012 reports the CEMACH chart's per-parameter thresholds and the "1 red OR ≥2 yellows" trigger rule used at Northwick Park. The same rule appears in the RCOG MEOWS chart referenced by Singh et al.
- Sophie result: a chart with one yellow returns `trigger: false`; with two yellows returns `trigger: true`; with one red returns `trigger: true`. PASS.

## Edge-input handling notes

- Non-finite numbers, negative vitals, and SpO2 outside 0-100 throw before banding.
- `neuro` outside {A,V,P,U} throws.
- `pain` outside integer 0-3 throws.

## A11y / keyboard notes

- Six numeric inputs + one AVPU select + one 0-3 range input, all Tab-reachable with linked labels; aria-live result region wraps the tile output. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
