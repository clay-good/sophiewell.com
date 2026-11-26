// spec-v1492: MCP adapter. The dom keys mirror views/group-v1492.js and this tile's META example.

import * as BR from '../../lib/bolton-ratio-v1492.js';

export default [
  {
    id: 'bolton-ratio',
    summary: 'Bolton anterior and overall tooth-size ratios against 77.2% and 91.3%, with the excess in mm.',
    compute: BR.boltonRatio,
    fields: [
      { dom: 'br-max6', arg: 'maxAnterior', kind: 'number', required: false, label: 'Maxillary canine-to-canine sum of widths', unit: 'mm', min: 20, max: 80 },
      { dom: 'br-mand6', arg: 'mandAnterior', kind: 'number', required: false, label: 'Mandibular canine-to-canine sum of widths', unit: 'mm', min: 14, max: 80 },
      { dom: 'br-max12', arg: 'maxOverall', kind: 'number', required: false, label: 'Maxillary first-molar-to-first-molar sum', unit: 'mm', min: 60, max: 140 },
      { dom: 'br-mand12', arg: 'mandOverall', kind: 'number', required: false, label: 'Mandibular first-molar-to-first-molar sum', unit: 'mm', min: 42, max: 140 },
    ],
  },
];
