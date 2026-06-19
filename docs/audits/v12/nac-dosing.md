# v12 audit - nac-dosing

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Prescott LF, et al. BMJ. 1979;2(6198):1097-1100; Bateman DN, et al. Lancet. 2014;383:697-704.

`lib/tox-v110.js nacDosing()` computes the weight-based IV NAC regimen: three-bag
(150 / 50 / 100 mg/kg over 1 / 4 / 16 h) or two-bag SNAP (200 / 100 mg/kg over
4 / 16 h), with the dosing weight capped at 110 kg. Class A.

## Boundary worked examples added
- three-bag at 70 kg: 10500 / 3500 / 7000 mg (21000 mg total).
- two-bag SNAP at 70 kg: 14000 / 7000 mg.
- band flip: a 120 kg patient is dosed at the 110 kg cap (16500 / 5500 / 11000 mg).
- exactly 110 kg is not flagged as capped.
- zero / blank / negative weight returns a surfaced fallback.

## Cross-implementation differential
- Reference: the per-bag mg/kg rates and durations and the 110-kg cap cross-
  verified against the SNAP trial protocol and MDCalc. Match. PASS.

## Edge-input handling notes
- a dosing aid carrying the second-check caveat; cross-links acetaminophen-nomogram
  for the treatment-line decision.

## A11y / keyboard notes
- Labeled weight input + regimen select; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none

## Status
- PASS
