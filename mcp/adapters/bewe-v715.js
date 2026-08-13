// spec-v715 MCP adapter: Basic Erosive Wear Examination in lib/bewe-v715.js.
// The dom keys mirror the browser renderer (views/group-v715.js) and META['bewe'].example.
// Six sextant enums (each 0-3); the sum 0-18 maps to an erosive-wear risk level. Clinical domain.

import { bewe } from '../../lib/bewe-v715.js';

export default [
  {
    id: 'bewe',
    summary: 'Basic Erosive Wear Examination (BEWE; Bartlett 2008): dental erosive tooth wear screen. Score the most-affected surface in each of 6 sextants 0-3 (0 none, 1 initial texture loss, 2 defect <50% surface, 3 loss >=50%). Total = sum of the 6 highest scores (0-18). Levels: 0-2 none, 3-8 low, 9-13 medium (avoid restorations), >=14 high (consider restorations).',
    compute: bewe,
    fields: [
      { dom: 'bewe-s1', arg: 'sextant1', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sextant 1 (upper right)' },
      { dom: 'bewe-s2', arg: 'sextant2', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sextant 2 (upper anterior)' },
      { dom: 'bewe-s3', arg: 'sextant3', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sextant 3 (upper left)' },
      { dom: 'bewe-s4', arg: 'sextant4', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sextant 4 (lower left)' },
      { dom: 'bewe-s5', arg: 'sextant5', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sextant 5 (lower anterior)' },
      { dom: 'bewe-s6', arg: 'sextant6', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sextant 6 (lower right)' },
    ],
  },
];
