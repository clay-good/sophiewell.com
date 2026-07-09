// spec-v273 MCP wave (eighty-eighth): adapter for the TyG-BMI insulin-resistance
// surrogate in lib/metabolic-v273.js. dom keys mirror the browser renderer and
// META['tyg-bmi'].example.fields.

import * as F from '../../lib/metabolic-v273.js';

export default [
  {
    id: 'tyg-bmi',
    summary: 'TyG-BMI (Er 2016; TyG core Simental-Mendia 2008) = ln[(fasting triglycerides x fasting glucose) / 2] x BMI, lipids/glucose in mg/dL; a higher value marks greater insulin resistance (no universal cut-point).',
    compute: F.tygBmi,
    fields: [
      { dom: 'tygbmi-tg', arg: 'tg', kind: 'number', required: true, label: 'Fasting triglycerides', unit: 'mg/dL' },
      { dom: 'tygbmi-glucose', arg: 'glucose', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
      { dom: 'tygbmi-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
    ],
  },
];
