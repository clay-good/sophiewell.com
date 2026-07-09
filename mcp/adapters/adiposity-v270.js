// spec-v270 MCP wave (ninety-first): adapter for the Cardiometabolic Index in
// lib/adiposity-v270.js. dom keys mirror the browser renderer and
// META['cmi'].example.fields.

import * as F from '../../lib/adiposity-v270.js';

export default [
  {
    id: 'cmi',
    summary: 'Cardiometabolic Index (Wakabayashi 2015) = (triglycerides / HDL, mg/dL) x waist-to-height ratio; a higher value marks a worse cardiometabolic profile (no universal cut-point).',
    compute: F.cmi,
    fields: [
      { dom: 'cmi-tg', arg: 'tg', kind: 'number', required: true, label: 'Triglycerides', unit: 'mg/dL' },
      { dom: 'cmi-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'cmi-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'cmi-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
];
