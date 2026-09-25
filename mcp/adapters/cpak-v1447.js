// spec-v1447: MCP adapter. The dom keys mirror views/group-v1447.js and this tile's META example.

import * as CP from '../../lib/cpak-v1447.js';

export default [
  {
    id: 'cpak',
    summary: 'Classifies a knee into one of the nine CPAK phenotypes from the medial proximal tibial and lateral distal femoral angles. It computes the arithmetic HKA (MPTA minus LDFA) and the joint line obliquity (their sum).',
    compute: CP.cpak,
    fields: [
      { dom: 'cpak-mpta', arg: 'mpta', kind: 'number', required: true, label: 'Medial proximal tibial angle (MPTA)', unit: 'degrees' },
      { dom: 'cpak-ldfa', arg: 'ldfa', kind: 'number', required: true, label: 'Lateral distal femoral angle (LDFA)', unit: 'degrees' },
    ],
  },
];
