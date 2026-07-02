// spec-v183 MCP wave 14: adapters for two lib/peds-v98.js pediatric tiles. dom
// keys mirror views/group-v24.js; arg names mirror the lib signatures. Kocher
// predictors and the PIM3 pupils / ventilation / elective flags are booleans;
// PIM3 recovery and diagnosis-risk axes are enums; labs are numbers.
//
// Deferred: kawasaki-criteria (principal / supplementary features arrive as
// variable-length key arrays, not the flat dom→arg→kind contract) and catch-head
// (high- and medium-risk factors are collected into arrays); both need a bespoke
// toArgs and are left for a later wave.

import * as F from '../../lib/peds-v98.js';

export default [
  {
    id: 'kocher-criteria',
    summary: 'Kocher criteria (Kocher 1999): non-weight-bearing, fever, ESR > 40, and WBC > 12 predict the probability of septic arthritis of the hip in a child.',
    compute: F.kocherCriteria,
    fields: [
      { dom: 'koch-nwb', arg: 'nonWeightBearing', kind: 'bool', label: 'Non-weight-bearing' },
      { dom: 'koch-fever', arg: 'fever', kind: 'bool', label: 'Fever > 38.5 °C' },
      { dom: 'koch-esr', arg: 'esr', kind: 'bool', label: 'ESR > 40 mm/hr' },
      { dom: 'koch-wbc', arg: 'wbc', kind: 'bool', label: 'WBC > 12 ×10⁹/L' },
    ],
  },
  {
    id: 'pim3',
    summary: 'Pediatric Index of Mortality 3 (Straney 2013): a logistic PICU mortality model from SBP, pupils, oxygenation (FiO2, PaO2), base excess, ventilation, elective/recovery status, and diagnosis-risk category.',
    compute: F.pim3,
    fields: [
      { dom: 'pim-sbp', arg: 'sbp', kind: 'number', label: 'Systolic blood pressure (mmHg)' },
      { dom: 'pim-pupils', arg: 'pupilsFixed', kind: 'bool', label: 'Both pupils > 3 mm and fixed' },
      { dom: 'pim-fio2', arg: 'fio2', kind: 'number', label: 'FiO2 (fraction) — if ventilated' },
      { dom: 'pim-pao2', arg: 'paO2', kind: 'number', label: 'PaO2 (mmHg) — if ventilated' },
      { dom: 'pim-be', arg: 'baseExcess', kind: 'number', label: 'Base excess (mmol/L)' },
      { dom: 'pim-vent', arg: 'mechVent', kind: 'bool', label: 'Mechanical ventilation in the first hour' },
      { dom: 'pim-elective', arg: 'elective', kind: 'bool', label: 'Elective admission' },
      { dom: 'pim-recovery', arg: 'recovery', kind: 'enum', values: ['none', 'bypass-cardiac', 'nonbypass-cardiac', 'noncardiac'], label: 'Recovery from procedure' },
      { dom: 'pim-risk', arg: 'riskCategory', kind: 'enum', values: ['none', 'low', 'high', 'very-high'], label: 'Diagnosis risk category' },
    ],
  },
];
