# spec-v1760 — Values below an envelope's floor

> Status: **SHIPPED (2026-11-21)**: 80 tools. The catalog stays 2,387.

`lib/bounds.js` gives each envelope a floor and a ceiling, but every finder drove only the ceiling. The new
`scripts/probe-envelope-floor.mjs` drives each mapped field to half its floor: 113 fields in 80 tools answered.

| Example | Before | Now |
|---|---|---|
| FINDRISC, ADA and Cambridge diabetes risk: BMI 2.5 | scored | refused, with the range |
| Grobman VBAC: weight 150 g | 98.9% success | refused |
| fluid balance: weight 150 g | "+533% of body weight" | refused |
| MELD-Na, MELD 3.0: sodium 45 | pulled up to 125 and scored | refused |
| CRUSADE, TIMI risk index, SITS-SICH, REMS: systolic 10 | scored | refused |
| QTc: QT of 100 ms | corrected | refused |
| PSI, salicylate: arterial pH of -999999 or 12 | PSI scored it acidemic (Class IV) | refused |

The pH fields were never mapped: a label's trailing parenthetical stands in for a missing unit (spec-v1741), so
"Arterial pH (optional)" read its unit as "optional". The pH map entry now accepts those annotations (5 more fields).

**Floors that do not apply**, recorded in `scripts/lib/envelope-map.mjs` with the reason:

- By envelope: hemoglobin and hematocrit (0.7 g/dL has been survived without transfusion), albumin (congenital
  analbuminemia runs below 0.1 g/dL), glucose (neonatal lows in single digits).
- By field: hypothermia-rewarm core temperature (survival from 13.7 C is recorded), SNAPPE-II temperature
  (skipped on purpose since spec-v1741), START and JumpSTART respiratory rate (apnea is its own question), and the
  Revised Trauma Score's systolic and rate (it codes 1-49 mmHg and 1-5/min as 1).
- Not the mapped quantity: pulmonary-artery diastolic in PAPi and the transpulmonary gradient, toe pressure in
  the toe-brachial index, WBGT's wet-bulb temperature.

Where a score gives 0 a meaning, 0 keeps it: PIM3, BATT and ETS systolic 0 (no pulse), cerebral perfusion and
minute ventilation's blank 0, SAPS II FiO2 0 (not entered). `boundsAdvisory` checks both ends, so some looser
tool ceilings tightened to the envelope (APACHE II rate 100 -> 80 and potassium 12 -> 10; LODS, OASIS and SCORTEN
heart rate 350-400 -> 300).

Left for a sourced floor: APACHE II sodium 80-89 (its own minimum is 80).

Gates: `test/unit/probe-envelope-floor.test.js` (zero rows across at least 550 fields); the page test
`test/integration/envelope-refused-on-page.spec.js` drives half the floor as well as 1.5x the ceiling.
Tests: `test/unit/envelope-floor-v1760-{a,b,c,d}.test.js`.
