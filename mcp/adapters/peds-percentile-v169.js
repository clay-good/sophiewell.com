// spec-v183 MCP wave 14: adapters for the two lib/peds-percentile-v169.js CDC
// growth-chart tiles. dom keys mirror views/group-v169.js; arg names mirror the
// lib signatures. Sex is an enum; age and the measured value are numbers.

import * as F from '../../lib/peds-percentile-v169.js';

export default [
  {
    id: 'cdc-stature-for-age',
    summary: 'CDC 2000 stature-for-age percentile (LMS method): from sex, age, and height → percentile, z-score, and the reference-range band for ages 2–20 years.',
    compute: F.cdcStatureForAge,
    fields: [
      { dom: 'cs-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'cs-age', arg: 'ageYears', kind: 'number', label: 'Age (years, 2–20)' },
      { dom: 'cs-ht', arg: 'heightCm', kind: 'number', label: 'Height (cm)' },
    ],
  },
  {
    id: 'cdc-weight-for-age',
    summary: 'CDC 2000 weight-for-age percentile (LMS method): from sex, age, and weight → percentile, z-score, and the reference-range band for ages 2–20 years.',
    compute: F.cdcWeightForAge,
    fields: [
      { dom: 'cw-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'cw-age', arg: 'ageYears', kind: 'number', label: 'Age (years, 2–20)' },
      { dom: 'cw-wt', arg: 'weightKg', kind: 'number', label: 'Weight (kg)' },
    ],
  },
];
