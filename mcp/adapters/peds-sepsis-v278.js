// spec-v278 MCP wave (ninety-fifth): adapter for the Phoenix Sepsis Score in
// lib/peds-sepsis-v278.js. dom keys mirror the browser renderer (views/
// group-v278.js) and META['phoenix-sepsis'].example.fields. Only the age is
// required; every organ-system value is optional (a blank field is "not
// measured" and scores no points), matching the lib's own worst-value contract.

import * as F from '../../lib/peds-sepsis-v278.js';

export default [
  {
    id: 'phoenix-sepsis',
    summary: 'Phoenix Sepsis Score (2024 SCCM/JAMA international consensus) — an organ-dysfunction score across four systems: respiratory (0-3), cardiovascular (0-6), coagulation (0-2), neurologic (0-2), total 0-13. In a child with suspected/confirmed infection, total >= 2 meets the consensus definition of sepsis and a cardiovascular sub-score >= 1 meets septic shock. Reports a score and the consensus threshold, not a diagnosis or a treatment order.',
    compute: F.phoenixSepsis,
    fields: [
      { dom: 'phx-age', arg: 'ageMonths', kind: 'number', required: true, label: 'Age', unit: 'months' },
      { dom: 'phx-ratiotype', arg: 'ratioType', kind: 'enum', values: ['pf', 'sf'], label: 'Oxygenation ratio type (PaO2/FiO2 or SpO2/FiO2)' },
      { dom: 'phx-ratio', arg: 'ratio', kind: 'number', label: 'Oxygenation ratio value' },
      { dom: 'phx-support', arg: 'support', kind: 'enum', values: ['none', 'support', 'imv'], label: 'Respiratory support (none / any support / invasive mechanical ventilation)' },
      { dom: 'phx-vaso', arg: 'vasoactives', kind: 'number', label: 'Vasoactive medications (count)' },
      { dom: 'phx-lactate', arg: 'lactate', kind: 'number', label: 'Lactate', unit: 'mmol/L' },
      { dom: 'phx-map', arg: 'map', kind: 'number', label: 'Mean arterial pressure', unit: 'mmHg' },
      { dom: 'phx-plt', arg: 'platelets', kind: 'number', label: 'Platelets', unit: '10^3/uL' },
      { dom: 'phx-inr', arg: 'inr', kind: 'number', label: 'INR' },
      { dom: 'phx-ddimer', arg: 'ddimer', kind: 'number', label: 'D-dimer', unit: 'mg/L FEU' },
      { dom: 'phx-fib', arg: 'fibrinogen', kind: 'number', label: 'Fibrinogen', unit: 'mg/dL' },
      { dom: 'phx-gcs', arg: 'gcs', kind: 'number', label: 'Glasgow Coma Scale (3-15)' },
      { dom: 'phx-pupils', arg: 'pupilsFixed', kind: 'bool', label: 'Bilaterally fixed pupils' },
    ],
  },
];
