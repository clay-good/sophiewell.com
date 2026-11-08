// spec-v1717 MCP adapter: kdri-kdpi in lib/kdri-kdpi-v1717.js. The dom keys mirror views/group-v1717.js and
// META['kdri-kdpi'].example; height and weight are canonical cm and kg here (the toggles are the page's).

import * as K from '../../lib/kdri-kdpi-v1717.js';

export default [
  {
    id: 'kdri-kdpi',
    summary: 'KDRI and KDPI from the eight donor factors in OPTN\'s 2024 refit, mapped with its 2025 table. It uses no race or HCV, and an unknown hypertension or diabetes status enters at the share OPTN uses.',
    compute: K.kdriKdpi,
    fields: [
      { dom: 'kdpi-age', arg: 'age', kind: 'number', min: 0, max: 100, required: true, label: 'Donor age (whole years)' },
      { dom: 'kdpi-height', arg: 'heightCm', kind: 'number', min: 30, max: 250, required: true, label: 'Height (cm)' },
      { dom: 'kdpi-weight', arg: 'weightKg', kind: 'number', min: 1, max: 300, required: true, label: 'Weight (kg)' },
      { dom: 'kdpi-cr', arg: 'creatinine', kind: 'number', min: 0.1, max: 20, required: true, label: 'Serum creatinine (mg/dL)' },
      { dom: 'kdpi-htn', arg: 'hypertension', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'History of hypertension' },
      { dom: 'kdpi-dm', arg: 'diabetes', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'History of diabetes' },
      { dom: 'kdpi-cva', arg: 'cva', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Cause of death CVA' },
      { dom: 'kdpi-dcd', arg: 'dcd', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Donation after circulatory death' },
    ],
  },
];
