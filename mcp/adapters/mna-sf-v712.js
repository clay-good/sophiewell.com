// spec-v712 MCP adapter: MNA-SF (Mini Nutritional Assessment Short Form) in
// lib/mna-sf-v712.js. The dom keys mirror the browser renderer (views/group-v712.js) and
// META['mna-sf'].example. Six per-item enums; the sum 0-14 maps to a nutritional-status
// band. Clinical domain.

import { mnaSf } from '../../lib/mna-sf-v712.js';

export default [
  {
    id: 'mna-sf',
    summary: 'MNA-SF (Mini Nutritional Assessment Short Form; Kaiser 2009): six-item nutritional screen for older adults, summed to 0-14. Food-intake decline (0-2), weight loss (0-3), mobility (0-2), psychological stress/acute disease (0 or 2), neuropsychological problems (0-2), BMI or calf circumference (0-3). Bands: 12-14 normal, 8-11 at risk of malnutrition, 0-7 malnourished.',
    compute: mnaSf,
    fields: [
      { dom: 'mna-food', arg: 'foodIntake', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Food-intake decline (points)' },
      { dom: 'mna-weight', arg: 'weightLoss', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Weight loss (points)' },
      { dom: 'mna-mobility', arg: 'mobility', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Mobility (points)' },
      { dom: 'mna-stress', arg: 'acuteStress', kind: 'enum', values: ['0', '2'], required: true, label: 'Psychological stress or acute disease (points)' },
      { dom: 'mna-neuro', arg: 'neuropsych', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Neuropsychological problems (points)' },
      { dom: 'mna-bmi', arg: 'bmiOrCalf', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'BMI or calf circumference (points)' },
    ],
  },
];
