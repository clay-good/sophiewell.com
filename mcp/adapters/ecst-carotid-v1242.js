// spec-v1242: MCP adapter. The dom keys mirror views/group-v1242.js and this tile's META example.
// All three diameters are required: each percentage is a ratio, and a missing denominator is not a
// smaller one.

import { ecstCarotid } from '../../lib/ecst-carotid-v1242.js';

export default [
  {
    id: 'ecst-carotid',
    summary: 'ECST carotid stenosis measurement, with the NASCET figure for the same artery beside it. Both divide the narrowest residual lumen by a denominator and they choose different ones: NASCET uses the distal internal carotid beyond the bulb, ECST the estimated original diameter at the narrowing. The ECST denominator is the larger, so ECST always reports the higher percentage, and the gap is not small; on Rothwell 1994 the two sit on one line as ECST equals 0.6 times NASCET plus 40, which makes an ECST 70 percent stenosis a NASCET 50 percent one. That is why this tile exists: a trial threshold, a guideline and a radiology report may each mean a different artery by 70 percent, and nothing in the number says which method produced it. A residual lumen wider than its own denominator is refused rather than reported as a negative stenosis.',
    compute: ecstCarotid,
    fields: [
      { dom: 'ecst-residual', arg: 'residual', kind: 'number', required: true, label: 'Narrowest residual lumen (mm)' },
      { dom: 'ecst-distalIca', arg: 'distalIca', kind: 'number', required: true, label: 'Distal internal carotid diameter beyond the bulb (mm)' },
      { dom: 'ecst-originalBulb', arg: 'originalBulb', kind: 'number', required: true, label: 'Estimated original diameter at the stenosis (mm)' },
    ],
  },
];
