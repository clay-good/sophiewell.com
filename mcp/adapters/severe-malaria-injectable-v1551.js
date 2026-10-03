// spec-v1551 MCP adapter: the WHO 2026 injectable severe malaria doses in lib/severe-malaria-injectable-v1551.js.
// The dom keys mirror views/group-v1551.js and META['severe-malaria-injectable'].example. Clinical domain.

import * as SI from '../../lib/severe-malaria-injectable-v1551.js';

export default [
  {
    id: 'severe-malaria-injectable',
    summary: 'Gives the WHO injectable antimalarial dose for severe malaria at a weight. Artesunate is 3 mg/kg under 20 kg and 2.4 mg/kg from 20 kg; IM artemether and quinine are covered as alternatives. Quinine doses are salt, with the infusion rate limit. No product volume is given.',
    compute: SI.severeMalariaInjectable,
    fields: [
      { dom: 'smi-drug', arg: 'drug', kind: 'enum', required: true, label: 'Drug: artesunate, artemether or quinine', values: SI.DRUGS.map((d) => d.value) },
      { dom: 'smi-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 0.5, max: 150 },
    ],
  },
];
