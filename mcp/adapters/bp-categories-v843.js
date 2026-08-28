// spec-v843 MCP adapter: ACC/AHA blood pressure categories in lib/bp-categories-v843.js.
// The dom keys mirror the browser renderer (views/group-v843.js) and
// META['bp-categories'].example.
//
// Both pressures are required because the category is set by whichever is higher.
// Clinical domain.

import { bpCategories } from '../../lib/bp-categories-v843.js';

export default [
  {
    id: 'bp-categories',
    summary: 'Applies the ACC/AHA blood pressure categories for adults. Normal is under 120 AND under 80; elevated is 120 to 129 AND under 80; stage 1 hypertension is 130 to 139 OR 80 to 89; stage 2 is 140 or more OR 90 or more. Where the systolic and diastolic fall in different categories the HIGHER one applies, so 135/95 is stage 2. Readings above 180/120 are flagged as severe hypertension alongside the category.',
    compute: bpCategories,
    fields: [
      { dom: 'bpc-sbp', arg: 'systolic', kind: 'number', required: true, label: 'Systolic pressure', unit: 'mmHg' },
      { dom: 'bpc-dbp', arg: 'diastolic', kind: 'number', required: true, label: 'Diastolic pressure', unit: 'mmHg' },
    ],
  },
];
