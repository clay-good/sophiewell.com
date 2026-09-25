// spec-v1469: MCP adapter. The dom keys mirror views/group-v1469.js and this tile's META example.

import * as BP from '../../lib/blackburne-peel-v1469.js';

export default [
  {
    id: 'blackburne-peel',
    summary: 'Blackburne-Peel index of patellar height on a lateral knee radiograph at about 30 degrees of flexion. The index is A / B, where A is the perpendicular from the inferior patellar articular surface to the tibial plateau line and B is the patellar articular surface length (mm). The reading is given against both published cutoff sets: the original normal range 0.54 to 1.06, and the categories low below 0.80, normal 0.80 to 1.00, high above 1.00.',
    compute: BP.blackburnePeel,
    fields: [
      { dom: 'bp-a', arg: 'distanceA', kind: 'number', unit: 'mm', required: true, label: 'Distance A (inferior patellar articular surface to the tibial plateau line)' },
      { dom: 'bp-b', arg: 'lengthB', kind: 'number', unit: 'mm', required: true, label: 'Length B (patellar articular surface)' },
    ],
  },
];
