// spec-v183 MCP wave 32: adapter for the SPAN-100 index in
// lib/stroke-prognosis-v210.js — a simple acute-stroke prognostic index that
// sums age and NIHSS. dom keys mirror views/group-v210.js.

import * as F from '../../lib/stroke-prognosis-v210.js';

export default [
  {
    id: 'span-100',
    summary: 'SPAN-100 index (Saposnik 2013): age plus NIHSS; an index ≥ 100 (SPAN-100 positive) marks a substantially worse acute-ischemic-stroke prognosis with a much lower favorable-outcome rate.',
    compute: F.spanScore,
    fields: [
      { dom: 'span-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'span-nihss', arg: 'nihss', kind: 'number', required: true, label: 'NIHSS (0–42)' },
    ],
  },
];
