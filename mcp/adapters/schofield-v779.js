// spec-v779 MCP adapter: Schofield BMR in lib/schofield-v779.js.
// The dom keys mirror the browser renderer (views/group-v779.js) and META['schofield'].example.
// Weight in canonical kg, age in years, sex enum; the age band selects the coefficient pair.
// Clinical domain.

import { schofield } from '../../lib/schofield-v779.js';

export default [
  {
    id: 'schofield',
    summary: 'Schofield equations (1985), the FAO/WHO/UNU reference standard for basal metabolic rate. BMR in kcal/day from weight alone, with a separate coefficient and constant per sex and per age band (under 3, 3-10, 10-18, 18-30, 30-60, over 60). Needs no height, unlike Mifflin-St Jeor or Harris-Benedict. Bands are closed below and open above, so age exactly 30 uses the 30-60 equation. Basal only; activity and stress factors are applied separately.',
    compute: schofield,
    fields: [
      { dom: 'schof-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'schof-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'yr' },
      { dom: 'schof-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
];
