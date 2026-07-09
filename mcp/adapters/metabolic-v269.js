// spec-v269 MCP wave (ninety-second): adapter for the METS-IR insulin-resistance
// surrogate in lib/metabolic-v269.js. dom keys mirror the browser renderer and
// META['mets-ir'].example.fields.

import * as F from '../../lib/metabolic-v269.js';

export default [
  {
    id: 'mets-ir',
    summary: 'METS-IR (Bello-Chavolla 2018) = (ln[(2 x fasting glucose) + fasting triglycerides] x BMI) / ln(HDL-C), glucose/TG/HDL in mg/dL, BMI in kg/m^2; a higher value marks greater insulin resistance (no universal cut-point).',
    compute: F.metsIr,
    fields: [
      { dom: 'metsir-fpg', arg: 'fpg', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
      { dom: 'metsir-tg', arg: 'tg', kind: 'number', required: true, label: 'Fasting triglycerides', unit: 'mg/dL' },
      { dom: 'metsir-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'metsir-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
    ],
  },
];
