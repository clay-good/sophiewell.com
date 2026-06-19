# v12 audit - hiet-dosing

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Engebretsen KM, Kaczmarek KM, Morgan J, Holger JS. Clin Toxicol (Phila). 2011;49(4):277-283.

`lib/tox-v110.js hietDosing()` computes the high-dose-insulin-euglycemia bolus
(1 unit/kg), starting infusion (1 unit/kg/hr), and titration ceiling (10
unit/kg/hr) from weight, clamping the entered rate to the published ceiling.
Class A.

## Boundary worked examples added
- default 80 kg: 80-unit bolus, 80 units/hr start, 800 units/hr ceiling.
- a titrated 5 unit/kg/hr rate scales to 400 units/hr.
- band flip: an entered 12 unit/kg/hr rate clamps to the 10 unit/kg/hr ceiling.
- exactly 10 unit/kg/hr is the ceiling, not flagged as clamped.
- zero / blank / negative weight returns a surfaced fallback.

## Cross-implementation differential
- Reference: the 1 unit/kg bolus, 1 unit/kg/hr start, and 10 unit/kg/hr ceiling
  cross-verified against the Engebretsen review and poison-center references.
  Match. PASS.

## Edge-input handling notes
- a dosing aid carrying the second-check caveat; pairs with a dextrose infusion
  and glucose/potassium monitoring, which the output names.

## A11y / keyboard notes
- Labeled weight / bolus / rate inputs; output aria-live="polite". 320px sweep,
  no hscroll.

## Defects opened
- none

## Status
- PASS
