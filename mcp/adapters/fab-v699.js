// spec-v699 MCP adapter: Frontal Assessment Battery in lib/fab-v699.js.
// The dom keys mirror the browser renderer (views/group-v699.js) and META['fab'].example.
// Six 0-3 subtest enums; the sum 0-18 maps to a frontal-function band. Clinical domain.

import { fab } from '../../lib/fab-v699.js';

export default [
  {
    id: 'fab',
    summary: 'Frontal Assessment Battery (FAB; Dubois 2000): six executive-function subtests, each 0-3, summed to 0-18 (higher = better): conceptualization (similarities), mental flexibility (verbal fluency), motor programming (Luria series), sensitivity to interference, inhibitory control (go/no-go), environmental autonomy. A total < 12 suggests frontal / dysexecutive dysfunction.',
    compute: fab,
    fields: [
      { dom: 'fab-concept', arg: 'conceptualization', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Conceptualization (0-3)' },
      { dom: 'fab-flex', arg: 'flexibility', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Mental flexibility / verbal fluency (0-3)' },
      { dom: 'fab-motor', arg: 'motorProgramming', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Motor programming / Luria series (0-3)' },
      { dom: 'fab-interfere', arg: 'interference', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sensitivity to interference (0-3)' },
      { dom: 'fab-inhibit', arg: 'inhibitory', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Inhibitory control / go-no-go (0-3)' },
      { dom: 'fab-autonomy', arg: 'autonomy', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Environmental autonomy / prehension (0-3)' },
    ],
  },
];
