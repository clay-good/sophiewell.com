// spec-v1483: MCP adapter. The dom keys mirror views/group-v1483.js and this tile's META example.

import * as OH from '../../lib/ohi-s-v1483.js';

const SCORES = ['0', '1', '2', '3'];

export default [
  {
    id: 'ohi-s',
    summary: 'Simplified Oral Hygiene Index (Greene and Vermillion): debris plus calculus scores over six index teeth, read as good, fair or poor oral hygiene.',
    compute: OH.ohiS,
    fields: [
      { dom: 'ohi-d16', arg: 'd16', kind: 'enum', required: false, values: SCORES, label: 'Debris score, tooth 16' },
      { dom: 'ohi-d11', arg: 'd11', kind: 'enum', required: false, values: SCORES, label: 'Debris score, tooth 11' },
      { dom: 'ohi-d26', arg: 'd26', kind: 'enum', required: false, values: SCORES, label: 'Debris score, tooth 26' },
      { dom: 'ohi-d36', arg: 'd36', kind: 'enum', required: false, values: SCORES, label: 'Debris score, tooth 36' },
      { dom: 'ohi-d31', arg: 'd31', kind: 'enum', required: false, values: SCORES, label: 'Debris score, tooth 31' },
      { dom: 'ohi-d46', arg: 'd46', kind: 'enum', required: false, values: SCORES, label: 'Debris score, tooth 46' },
      { dom: 'ohi-c16', arg: 'c16', kind: 'enum', required: false, values: SCORES, label: 'Calculus score, tooth 16' },
      { dom: 'ohi-c11', arg: 'c11', kind: 'enum', required: false, values: SCORES, label: 'Calculus score, tooth 11' },
      { dom: 'ohi-c26', arg: 'c26', kind: 'enum', required: false, values: SCORES, label: 'Calculus score, tooth 26' },
      { dom: 'ohi-c36', arg: 'c36', kind: 'enum', required: false, values: SCORES, label: 'Calculus score, tooth 36' },
      { dom: 'ohi-c31', arg: 'c31', kind: 'enum', required: false, values: SCORES, label: 'Calculus score, tooth 31' },
      { dom: 'ohi-c46', arg: 'c46', kind: 'enum', required: false, values: SCORES, label: 'Calculus score, tooth 46' },
    ],
  },
];
