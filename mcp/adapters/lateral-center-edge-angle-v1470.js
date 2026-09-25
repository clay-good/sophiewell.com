// spec-v1470: MCP adapter. The dom key mirrors views/group-v1470.js and this tile's META example.

import * as LC from '../../lib/lateral-center-edge-angle-v1470.js';

export default [
  {
    id: 'lateral-center-edge-angle',
    summary: 'Reads the lateral center-edge angle of Wiberg from an AP pelvic radiograph against published hip dysplasia bands. Under 20 degrees is dysplastic, 20 to 25 borderline (18 to 25 in some studies), and 25 to 39 normal.',
    compute: LC.lateralCenterEdgeAngle,
    fields: [
      { dom: 'lcea-angle', arg: 'angle', kind: 'number', required: true, label: 'Lateral center-edge angle', unit: 'degrees' },
    ],
  },
];
