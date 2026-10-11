// spec-v1629 MCP adapter: isotonicity-e-value in lib/isotonicity-e-value-v1629.js. The dom keys mirror
// views/group-v1629.js and META['isotonicity-e-value'].example. Administrative domain. E-values are
// reader input; no table ships.

import * as IE from '../../lib/isotonicity-e-value-v1629.js';

export default [
  {
    id: 'isotonicity-e-value',
    summary: 'Tonicity agent to add by the sodium chloride equivalent method, or the isotonic volume by White-Vincent. E-values are entered by the reader; a preparation already past 0.9% is reported as hypertonic, never as 0 g to add.',
    compute: IE.isotonicityEValue,
    fields: [
      { dom: 'ie-mode', arg: 'mode', kind: 'enum', required: true, values: IE.MODES.map((m) => m.value), label: 'What to work out: the tonicity agent to add (agent), or the isotonic volume of water (white-vincent)' },
      { dom: 'ie-solutes', arg: 'solutes', kind: 'string', required: true, label: 'Solutes, one per line: weight in grams, then its sodium chloride equivalent (E-value)' },
      { dom: 'ie-vol', arg: 'volumeMl', kind: 'number', required: false, label: 'Final volume (required for the agent; optional for White-Vincent)', unit: 'mL' },
      { dom: 'ie-agent', arg: 'agentE', kind: 'number', required: false, label: 'Agent mode: E-value of the tonicity agent (1 for sodium chloride itself)' },
    ],
  },
];
