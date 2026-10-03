// spec-v1548 MCP adapter: WHO 2023 acute malnutrition in lib/wasting-classify-v1548.js. The dom keys mirror
// views/group-v1548.js and META['wasting-classify'].example. Clinical domain.

import * as W from '../../lib/wasting-classify-v1548.js';

export default [
  {
    id: 'wasting-classify',
    summary: 'Classifies severe or moderate acute malnutrition in a child 6 to 59 months by the WHO 2023 definitions. It uses MUAC, the weight-for-height z-score and edema of both feet; edema alone is severe, and the worse measure decides. It classifies by measurement and does not decide where to treat.',
    compute: W.wastingClassify,
    fields: [
      { dom: 'wc-age', arg: 'ageMonths', kind: 'number', required: true, label: 'Age in months (6 to 59)', min: 6, max: 59 },
      { dom: 'wc-edema', arg: 'edema', kind: 'enum', required: true, label: 'Edema of both feet: none, +, ++ or +++', values: W.EDEMA.map((e) => e.value) },
      { dom: 'wc-muac', arg: 'muac', kind: 'number', required: false, label: 'MUAC, in the unit given (one of MUAC or WHZ is needed without edema)', min: 8, max: 250 },
      { dom: 'wc-muac-unit', arg: 'muacUnit', kind: 'enum', required: false, label: 'MUAC unit (mm default)', values: W.MUAC_UNITS.map((u) => u.value) },
      { dom: 'wc-whz', arg: 'whz', kind: 'number', required: false, label: 'Weight-for-height or weight-for-length z-score', min: -6, max: 5 },
    ],
  },
];
