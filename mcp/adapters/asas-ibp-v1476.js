// spec-v1476: MCP adapter. The dom keys mirror views/group-v1476.js and this tile's META example.

import * as IB from '../../lib/asas-ibp-v1476.js';

export default [
  {
    id: 'asas-ibp',
    summary: 'ASAS criteria for inflammatory back pain in chronic back pain: 4 of 5 items (onset under 40, insidious onset, better with exercise, not with rest, night pain).',
    compute: IB.asasIbp,
    fields: [
      { dom: 'ibp-chronic', arg: 'chronic', kind: 'bool', required: true, label: 'Back pain for 3 months or more' },
      { dom: 'ibp-age', arg: 'ageUnder40', kind: 'bool', required: false, label: 'Age at onset under 40' },
      { dom: 'ibp-insidious', arg: 'insidious', kind: 'bool', required: false, label: 'Insidious onset' },
      { dom: 'ibp-exercise', arg: 'exercise', kind: 'bool', required: false, label: 'Improves with exercise' },
      { dom: 'ibp-rest', arg: 'noRestRelief', kind: 'bool', required: false, label: 'Does not improve with rest' },
      { dom: 'ibp-night', arg: 'nightPain', kind: 'bool', required: false, label: 'Pain at night, improving on getting up' },
    ],
  },
];
