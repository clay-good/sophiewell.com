// spec-v1704 MCP adapter: pwv-carotid-femoral in lib/pwv-carotid-femoral-v1704.js. The dom keys mirror views/group-v1704.js and
// META['pwv-carotid-femoral'].example.

import * as PWV from '../../lib/pwv-carotid-femoral-v1704.js';

export default [
  {
    id: 'pwv-carotid-femoral',
    summary: 'Carotid-femoral pulse wave velocity from the path length and transit time, by 80% of the direct distance or by subtraction.',
    compute: PWV.pwvCarotidFemoral,
    fields: [
      { dom: 'pwv-method', arg: 'method', kind: 'enum', values: ['direct80', 'subtraction'], required: true, label: 'Path length method' },
      { dom: 'pwv-direct', arg: 'directMm', kind: 'number', required: false, label: 'Direct carotid-femoral distance (mm)' },
      { dom: 'pwv-nf', arg: 'notchFemoralMm', kind: 'number', required: false, label: 'Sternal notch to femoral (mm)' },
      { dom: 'pwv-nc', arg: 'notchCarotidMm', kind: 'number', required: false, label: 'Sternal notch to carotid (mm)' },
      { dom: 'pwv-tt', arg: 'transitMs', kind: 'number', required: true, label: 'Transit time (ms)' },
    ]
  },
];
