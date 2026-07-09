// spec-v276 MCP wave (eighty-sixth): adapter for the Buzby Nutritional Risk
// Index in lib/nutrition-v276.js. dom keys mirror the browser renderer and
// META['nri'].example.fields. Albumin is in g/L (a g/dL value x 10).

import * as F from '../../lib/nutrition-v276.js';

export default [
  {
    id: 'nri',
    summary: 'Nutritional Risk Index (Buzby, VA-TPN) = 1.519 x albumin (g/L) + 41.7 x (current weight / usual weight); bands >100 none, 97.5-100 mild, 83.5-97.5 moderate, <83.5 severe. A lower value marks greater perioperative nutritional risk.',
    compute: F.nri,
    fields: [
      { dom: 'nri-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/L' },
      { dom: 'nri-current', arg: 'currentWeight', kind: 'number', required: true, label: 'Current weight', unit: 'kg' },
      { dom: 'nri-usual', arg: 'usualWeight', kind: 'number', required: true, label: 'Usual weight', unit: 'kg' },
    ],
  },
];
