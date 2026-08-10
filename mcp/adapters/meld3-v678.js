// spec-v678 MCP adapter: MELD 3.0 in lib/meld3-v678.js.
// The dom keys mirror the browser renderer (views/group-v678.js) and
// META['meld3'].example. A sex enum, five lab numbers, and a dialysis flag feed a
// fitted formula returning a 6-40 waitlist-mortality score. Clinical domain.

import { meld3 } from '../../lib/meld3-v678.js';

export default [
  {
    id: 'meld3',
    summary: 'MELD 3.0 (Kim 2021): the current OPTN liver-allocation score, successor to MELD-Na, adding female sex and albumin. MELD 3.0 = 1.33*(female) + 4.56*ln(bilirubin) + 0.82*(137-Na) - 0.24*(137-Na)*ln(bilirubin) + 9.09*ln(INR) + 11.14*ln(creatinine) + 1.85*(3.5-albumin) - 1.83*(3.5-albumin)*ln(creatinine) + 6. Labs floored at 1.0; creatinine capped at 3.0 (dialysis sets it to 3.0); Na bounded 125-137; albumin bounded 1.5-3.5. Score rounded and bounded 6-40; higher = higher 90-day waitlist mortality.',
    compute: meld3,
    fields: [
      { dom: 'm3-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex (female adds 1.33 points)' },
      { dom: 'm3-bili', arg: 'bilirubin', kind: 'number', unit: 'mg/dL', required: true, label: 'Serum bilirubin (mg/dL)' },
      { dom: 'm3-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'm3-creat', arg: 'creatinine', kind: 'number', unit: 'mg/dL', required: true, label: 'Serum creatinine (mg/dL)' },
      { dom: 'm3-na', arg: 'sodium', kind: 'number', unit: 'mEq/L', required: true, label: 'Serum sodium (mEq/L)' },
      { dom: 'm3-alb', arg: 'albumin', kind: 'number', unit: 'g/dL', required: true, label: 'Serum albumin (g/dL)' },
      { dom: 'm3-dial', arg: 'dialysis', kind: 'boolean', required: false, label: '>= 2 dialysis sessions in prior week / 24h CVVHD (sets creatinine to 3.0)' },
    ],
  },
];
