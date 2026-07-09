// spec-v272 MCP wave (eighty-ninth): adapter for the waist-to-height ratio in
// lib/anthro-v272.js. dom keys mirror the browser renderer and
// META['whtr'].example.fields.

import * as F from '../../lib/anthro-v272.js';

export default [
  {
    id: 'whtr',
    summary: 'Waist-to-height ratio (Ashwell) = waist circumference / height, any consistent unit; a value at or above the 0.5 boundary marks increased central-adiposity risk.',
    compute: F.whtr,
    fields: [
      { dom: 'whtr-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'whtr-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
];
