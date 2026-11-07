// spec-v1699 MCP adapter: emax-hill-effect in lib/emax-hill-effect-v1699.js. The dom keys mirror
// views/group-v1699.js and META['emax-hill-effect'].example.

import * as EHE from '../../lib/emax-hill-effect-v1699.js';

export default [
  {
    id: 'emax-hill-effect',
    summary: 'Sigmoid Emax (Hill) model: the effect at a concentration, or the concentration that gives a target effect, from E0, Emax, EC50 and the Hill coefficient.',
    compute: EHE.emaxHillEffect,
    fields: [
      { dom: 'ehe-e0', arg: 'e0', kind: 'number', required: true, label: 'Baseline effect E0' },
      { dom: 'ehe-emax', arg: 'emax', kind: 'number', required: true, label: 'Emax (negative if inhibitory)' },
      { dom: 'ehe-ec50', arg: 'ec50', kind: 'number', required: true, label: 'EC50' },
      { dom: 'ehe-n', arg: 'hill', kind: 'number', required: true, label: 'Hill coefficient n' },
      { dom: 'ehe-c', arg: 'concentration', kind: 'number', required: false, label: 'Concentration' },
      { dom: 'ehe-target', arg: 'targetEffect', kind: 'number', required: false, label: 'Target effect' },
    ]
  },
];
