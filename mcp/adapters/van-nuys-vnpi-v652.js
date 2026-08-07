// spec-v652 MCP adapter: USC/Van Nuys Prognostic Index (DCIS) in lib/van-nuys-vnpi-v652.js.
// The dom keys mirror the browser renderer (views/group-v652.js) and
// META['van-nuys-vnpi'].example. Four factors summed to 4-12: tumor size mm (raw,
// binned <=15/16-40/>=41), margin width mm (raw, binned >=10/1-9/<1), pathologic
// classification (1-3 enum), and age years (raw, binned >60/40-60/<40). Total 4-6 low,
// 7-9 intermediate, 10-12 high. Clinical domain.

import { vanNuysVnpi } from '../../lib/van-nuys-vnpi-v652.js';

export default [
  {
    id: 'van-nuys-vnpi',
    summary: 'USC/Van Nuys Prognostic Index (VNPI) for DCIS, 4-factor 2003 update: tumor size (mm), margin width (mm), pathologic classification (1-3), and age (years), each scored 1-3 and summed to 4-12. Total 4-6 low, 7-9 intermediate, 10-12 high risk.',
    compute: vanNuysVnpi,
    fields: [
      { dom: 'vnpi-size', arg: 'size', kind: 'number', required: true, label: 'Tumor size (mm); binned <=15 = 1, 16-40 = 2, >=41 = 3' },
      { dom: 'vnpi-margin', arg: 'margin', kind: 'number', required: true, label: 'Margin width (mm); binned >=10 = 1, 1 to <10 = 2, <1 = 3' },
      { dom: 'vnpi-class', arg: 'classification', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Pathologic classification: 1 = non-high grade no necrosis, 2 = non-high grade with necrosis, 3 = high grade' },
      { dom: 'vnpi-age', arg: 'age', kind: 'number', required: true, label: 'Age (years); binned >60 = 1, 40-60 = 2, <40 = 3' },
    ],
  },
];
