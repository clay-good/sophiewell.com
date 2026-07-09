// spec-v271 MCP wave (ninetieth): adapter for the Castelli Risk Indices in
// lib/lipids-v271.js. dom keys mirror the browser renderer and
// META['castelli-index'].example.fields. The compute returns both indices.

import * as F from '../../lib/lipids-v271.js';

export default [
  {
    id: 'castelli-index',
    summary: 'Castelli Risk Index-I (total cholesterol / HDL) and Risk Index-II (LDL / HDL), all in mg/dL; higher ratios mark a more atherogenic profile (interpretation context-dependent).',
    compute: F.castelli,
    fields: [
      { dom: 'cast-tc', arg: 'tc', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'cast-ldl', arg: 'ldl', kind: 'number', required: true, label: 'LDL cholesterol', unit: 'mg/dL' },
      { dom: 'cast-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
    ],
  },
];
