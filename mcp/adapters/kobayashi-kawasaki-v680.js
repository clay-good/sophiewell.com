// spec-v680 MCP adapter: Kobayashi IVIG-resistance score in lib/kobayashi-kawasaki-v680.js.
// The dom keys mirror the browser renderer (views/group-v680.js) and
// META['kobayashi-kawasaki'].example. Seven pre-treatment numbers; a weighted sum 0-11
// predicts IVIG resistance in Kawasaki disease. Clinical domain.

import { kobayashiKawasaki } from '../../lib/kobayashi-kawasaki-v680.js';

export default [
  {
    id: 'kobayashi-kawasaki',
    summary: 'Kobayashi score (Kobayashi 2006): predicts IVIG resistance in Kawasaki disease from pre-treatment values. Points: sodium <=133 mmol/L (2), treatment by day <=4 of illness (2), AST >=100 IU/L (2), neutrophils >=80% (2), CRP >=10 mg/dL (1), age <=12 months (1), platelets <=300 x10^3/uL (1). Total 0-11; >=4 = high risk of IVIG resistance.',
    compute: kobayashiKawasaki,
    fields: [
      { dom: 'kob-na', arg: 'sodium', kind: 'number', unit: 'mmol/L', required: true, label: 'Serum sodium (mmol/L)' },
      { dom: 'kob-day', arg: 'illnessDay', kind: 'number', unit: 'days', required: true, label: 'Day of illness at start of treatment' },
      { dom: 'kob-ast', arg: 'ast', kind: 'number', unit: 'IU/L', required: true, label: 'AST (IU/L)' },
      { dom: 'kob-neut', arg: 'neutrophil', kind: 'number', unit: '%', required: true, label: 'Neutrophil percentage (%)' },
      { dom: 'kob-crp', arg: 'crp', kind: 'number', unit: 'mg/dL', required: true, label: 'CRP (mg/dL)' },
      { dom: 'kob-age', arg: 'ageMonths', kind: 'number', unit: 'months', required: true, label: 'Age (months)' },
      { dom: 'kob-plt', arg: 'platelets', kind: 'number', unit: 'x10^3/uL', required: true, label: 'Platelet count (x10^3/uL)' },
    ],
  },
];
