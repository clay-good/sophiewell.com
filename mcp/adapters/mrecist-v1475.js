// spec-v1475: MCP adapter. The dom keys mirror views/group-v1475.js and this tile's META example.

import * as MR from '../../lib/mrecist-v1475.js';

export default [
  {
    id: 'mrecist',
    summary: 'Modified RECIST (mRECIST) response for hepatocellular carcinoma from the sums of viable, arterially enhancing tumor diameters. Complete response is no enhancement left, partial response a 30% decrease from baseline, progression a 20% increase from the nadir or a new typical lesion.',
    compute: MR.mrecist,
    fields: [
      { dom: 'mr-baseline', arg: 'baseline', kind: 'number', required: true, label: 'Baseline sum of viable target-lesion diameters', unit: 'mm' },
      { dom: 'mr-current', arg: 'current', kind: 'number', required: true, label: 'Current sum of viable target-lesion diameters', unit: 'mm' },
      { dom: 'mr-nadir', arg: 'nadir', kind: 'number', required: true, label: 'Smallest sum since treatment started (nadir)', unit: 'mm' },
      { dom: 'mr-new', arg: 'newLesion', kind: 'bool', required: false, label: 'A new lesion with the typical HCC enhancement pattern' },
      { dom: 'mr-nontarget', arg: 'nonTarget', kind: 'bool', required: false, label: 'Unequivocal progression of non-target lesions' },
    ],
  },
];
