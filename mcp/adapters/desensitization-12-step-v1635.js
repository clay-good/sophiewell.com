// spec-v1635 MCP adapter: desensitization-12-step in lib/desensitization-12-step-v1635.js. The dom keys
// mirror views/group-v1635.js and META['desensitization-12-step'].example. Clinical domain.

import * as DS from '../../lib/desensitization-12-step-v1635.js';

export default [
  {
    id: 'desensitization-12-step',
    summary: 'Three-bag, 12-step drug desensitization arithmetic, following the published table. From the target dose, bag volume and final rate it gives the three bag concentrations, each step\'s rate, volume, dose and cumulative dose, and the total time. It is arithmetic for a protocol an allergist has already ordered: no premedication, risk stratification or reaction management.',
    compute: (args) => DS.desensitization12Step(args),
    fields: [
      { dom: 'd12-dose', arg: 'targetDose', kind: 'number', required: true, label: 'Total target dose', unit: 'mg' },
      { dom: 'd12-volume', arg: 'bagVolume', kind: 'number', required: true, label: 'Volume of each bag (250 in the published table)', unit: 'mL' },
      { dom: 'd12-rate', arg: 'finalRate', kind: 'number', required: true, label: 'Final rate, step 12 (80 in the published table)', unit: 'mL/h' },
    ],
  },
];
