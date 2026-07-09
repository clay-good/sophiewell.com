// spec-v275 MCP wave (eighty-fifth): adapter for the RDW-to-platelet ratio in
// lib/fibrosis-v275.js — a non-invasive liver-fibrosis marker. dom keys mirror
// the browser renderer and META['rpr'].example.fields.

import * as F from '../../lib/fibrosis-v275.js';

export default [
  {
    id: 'rpr',
    summary: 'RDW-to-platelet ratio (Chen 2013) = red cell distribution width (%) / platelet count (10^9/L); a non-invasive liver-fibrosis marker where a higher ratio marks more advanced fibrosis (derivation cutoff ~0.1, etiology-dependent).',
    compute: F.rpr,
    fields: [
      { dom: 'rpr-rdw', arg: 'rdw', kind: 'number', required: true, label: 'Red cell distribution width', unit: '%' },
      { dom: 'rpr-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '10^9/L' },
    ],
  },
];
