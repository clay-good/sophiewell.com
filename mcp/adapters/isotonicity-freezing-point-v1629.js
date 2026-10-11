// spec-v1629 MCP adapter: isotonicity-freezing-point in lib/isotonicity-freezing-point-v1629.js. The
// dom keys mirror views/group-v1629.js and META['isotonicity-freezing-point'].example. Administrative
// domain. Every 1% depression is reader input; no preset ships.

import * as FP from '../../lib/isotonicity-freezing-point-v1629.js';

export default [
  {
    id: 'isotonicity-freezing-point',
    summary: 'Adjusting agent to add to a compounded solution by the freezing-point (cryoscopic) method, to a depression of 0.52 °C. Every 1% depression is entered by the reader; a solution at or past 0.52 is reported as such, never as a negative weight.',
    compute: FP.isotonicityFreezingPoint,
    fields: [
      { dom: 'fp-solutes', arg: 'solutes', kind: 'string', required: true, label: 'Solutes, one per line: strength in % w/v, then the freezing-point depression of its 1% solution in °C' },
      { dom: 'fp-agent', arg: 'agentDepression', kind: 'number', required: false, label: 'Freezing-point depression of a 1% solution of the adjusting agent, from a reference', unit: '°C' },
      { dom: 'fp-vol', arg: 'volumeMl', kind: 'number', required: false, label: 'Final volume', unit: 'mL' },
    ],
  },
];
