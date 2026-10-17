// spec-v1631 MCP adapter: valproate-albumin-normalized in lib/valproate-albumin-normalized-v1631.js. The dom
// keys mirror views/group-v1631.js and META['valproate-albumin-normalized'].example. Clinical domain.

import * as VA from '../../lib/valproate-albumin-normalized-v1631.js';

export default [
  {
    id: 'valproate-albumin-normalized',
    summary: 'Total valproic acid level normalized for low albumin. It applies the Hermida-Tutor free-fraction table and equation to a measured total level and albumin, and estimates the free level. Not reliable above 75 mg/L.',
    compute: VA.valproateAlbuminNormalized,
    fields: [
      { dom: 'vpa-total', arg: 'totalLevel', kind: 'number', required: true, label: 'Total valproic acid level', unit: 'mg/L' },
      { dom: 'vpa-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin' },
      { dom: 'vpa-alb-unit', arg: 'albuminUnit', kind: 'enum', required: true, values: VA.ALBUMIN_UNITS.map((u) => u.value), label: 'Albumin unit' },
    ],
  },
];
