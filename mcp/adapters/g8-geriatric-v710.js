// spec-v710 MCP adapter: G8 (Geriatric 8) screening tool in lib/g8-geriatric-v710.js.
// The dom keys mirror the browser renderer (views/group-v710.js) and
// META['g8-geriatric'].example. Eight per-item enums (one carries 0.5); the sum 0-17
// (<= 14 positive) decides referral for a comprehensive geriatric assessment. Clinical domain.

import { g8Geriatric } from '../../lib/g8-geriatric-v710.js';

export default [
  {
    id: 'g8-geriatric',
    summary: 'G8 (Geriatric 8) screening tool (Bellera 2012): identifies older cancer patients who need a full comprehensive geriatric assessment. Eight items summed to 0-17 (higher = better): food-intake decline (0-2), weight loss (0-3), mobility (0-2), neuropsychological problems (0-2), BMI (0-3), >3 medications/day (0-1), self-rated health vs peers (0/0.5/1/2), age (0-2). A total <= 14 is a positive screen (~90% sensitive) and warrants a full CGA.',
    compute: g8Geriatric,
    fields: [
      { dom: 'g8-food', arg: 'foodIntake', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Food-intake decline (points)' },
      { dom: 'g8-weight', arg: 'weightLoss', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Weight loss (points)' },
      { dom: 'g8-mobility', arg: 'mobility', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Mobility (points)' },
      { dom: 'g8-neuro', arg: 'neuropsych', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Neuropsychological problems (points)' },
      { dom: 'g8-bmi', arg: 'bmi', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Body mass index (points)' },
      { dom: 'g8-meds', arg: 'medications', kind: 'enum', values: ['0', '1'], required: true, label: 'More than 3 medications/day (points)' },
      { dom: 'g8-health', arg: 'selfHealth', kind: 'enum', values: ['0', '0.5', '1', '2'], required: true, label: 'Self-rated health vs peers (points)' },
      { dom: 'g8-age', arg: 'age', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Age (points)' },
    ],
  },
];
