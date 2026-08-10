// spec-v694 MCP adapter: Cobb angle scoliosis interpretation in lib/cobb-angle-v694.js.
// The dom key mirrors the browser renderer (views/group-v694.js) and
// META['cobb-angle'].example. One angle number -> severity band + advisory management
// context. Clinical domain.

import { cobbAngle } from '../../lib/cobb-angle-v694.js';

export default [
  {
    id: 'cobb-angle',
    summary: 'Cobb angle interpretation for scoliosis (Cobb 1948; Scoliosis Research Society): a curve >= 10 degrees defines scoliosis. Bands: < 10 not scoliosis, 10-24 mild, 25-44 moderate, >= 45 severe. Bracing is typically considered ~25-40 degrees in a skeletally immature patient and surgery ~45-50+; those cut-points are advisory and maturity-dependent. Companion to the Risser sign.',
    compute: cobbAngle,
    fields: [
      { dom: 'cobb-angle', arg: 'angle', kind: 'number', unit: 'degrees', required: true, label: 'Measured Cobb angle (degrees)' },
    ],
  },
];
