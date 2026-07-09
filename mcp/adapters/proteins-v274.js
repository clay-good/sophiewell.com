// spec-v274 MCP wave (eighty-seventh): adapter for the albumin-to-globulin
// ratio in lib/proteins-v274.js. dom keys mirror the browser renderer and
// META['agr'].example.fields. Globulin is derived as total protein - albumin.

import * as F from '../../lib/proteins-v274.js';

export default [
  {
    id: 'agr',
    summary: 'Albumin-to-globulin ratio = albumin / (total protein - albumin), both in g/dL; a lower value is less favorable and interpretation is context-dependent (typical range ~1.1-2.5).',
    compute: F.agr,
    fields: [
      { dom: 'agr-albumin', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
      { dom: 'agr-tp', arg: 'totalProtein', kind: 'number', required: true, label: 'Total protein', unit: 'g/dL' },
    ],
  },
];
