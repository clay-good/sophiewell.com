// spec-v646 MCP adapter: McCormack Load-Sharing Classification in
// lib/mccormack-v646.js. The dom keys mirror the browser renderer
// (views/group-v646.js) and META['mccormack-lsc'].example. Three components, each a
// required 1-3 enum; sum 3-9. A total >= 7 predicts short-segment posterior fixation
// failure (anterior support advised). Clinical domain.

import { mccormackLsc } from '../../lib/mccormack-v646.js';

export default [
  {
    id: 'mccormack-lsc',
    summary: 'McCormack Load-Sharing Classification of spine fractures: three CT/radiographic components (comminution, fragment apposition, kyphosis to correct), each 1-3, summed to 3-9. A total ≥ 7 predicts failure of short-segment posterior fixation (anterior support or a longer construct advised); ≤ 6 suggests short-segment posterior fixation suffices. Complements TLICS.',
    compute: mccormackLsc,
    fields: [
      { dom: 'mcc-comm', arg: 'comminution', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Comminution of the body: 1 = ≤ 30%, 2 = 30-60%, 3 = > 60%' },
      { dom: 'mcc-app', arg: 'apposition', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Fragment apposition/spread: 1 = minimal (< 2 mm), 2 = ≥ 2 mm over ≥ half the surface, 3 = wide spread' },
      { dom: 'mcc-kyph', arg: 'kyphosis', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Kyphosis to correct: 1 = ≤ 3°, 2 = 4-9°, 3 = ≥ 10°' },
    ],
  },
];
