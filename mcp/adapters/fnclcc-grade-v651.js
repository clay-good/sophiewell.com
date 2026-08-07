// spec-v651 MCP adapter: FNCLCC soft-tissue sarcoma grade in lib/fnclcc-grade-v651.js.
// The dom keys mirror the browser renderer (views/group-v651.js) and
// META['fnclcc-grade'].example. Three components summed to 2-8: tumor differentiation
// (1-3 enum), mitotic count per 10 HPF (raw count, binned 0-9/10-19/>=20 to 1/2/3),
// and tumor necrosis (0-2 enum). Total 2-3 grade 1, 4-5 grade 2, 6-8 grade 3. Clinical domain.

import { fnclccGrade } from '../../lib/fnclcc-grade-v651.js';

export default [
  {
    id: 'fnclcc-grade',
    summary: 'FNCLCC histologic grade for adult soft-tissue sarcoma: three components summed to 2-8 — tumor differentiation (1-3), mitotic count per 10 HPF (0-9=1, 10-19=2, >=20=3), tumor necrosis (none=0, <50%=1, >=50%=2). Total 2-3 grade 1, 4-5 grade 2, 6-8 grade 3.',
    compute: fnclccGrade,
    fields: [
      { dom: 'fnclcc-diff', arg: 'differentiation', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Tumor differentiation: 1 = resembles normal adult mesenchyme, 2 = typing certain, 3 = embryonal/undifferentiated/synovial/doubtful' },
      { dom: 'fnclcc-mitoses', arg: 'mitoticCount', kind: 'number', required: true, label: 'Mitotic count (mitoses per 10 high-power fields); binned 0-9=1, 10-19=2, >=20=3' },
      { dom: 'fnclcc-necrosis', arg: 'necrosis', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Tumor necrosis: 0 = none, 1 = <50%, 2 = >=50%' },
    ],
  },
];
