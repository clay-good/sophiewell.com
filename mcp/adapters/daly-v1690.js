// spec-v1690 MCP adapter: daly in lib/daly-v1690.js. The dom keys mirror views/group-v1659.js and
// META['daly'].example.

import * as DALY from '../../lib/daly-v1690.js';

export default [
  {
    id: 'daly',
    summary: 'DALYs for one cause: the years of life lost to death plus the years lived with disability, in the simplified form WHO uses (Global Health Estimates technical paper GHE/2026.3) with no time discounting and no age weights. Years lost come from WHO\'s standard loss function by age at death, which is a normative maximum life span rather than local life expectancy. The disability side is prevalence times the disability weight, unadjusted for the comorbidity WHO corrects for.',
    compute: DALY.daly,
    fields: [
      { dom: 'daly-deaths', arg: 'deaths', kind: 'number', required: false, label: 'Deaths from this cause' },
      { dom: 'daly-age', arg: 'ageRange', kind: 'enum', required: false, label: 'Age range the deaths fall in', values: DALY.AGE_RANGES.map((a) => a.value) },
      { dom: 'daly-cases', arg: 'prevalentCases', kind: 'number', required: false, label: 'People living with this cause (prevalent cases)' },
      { dom: 'daly-weight', arg: 'disabilityWeight', kind: 'number', min: 0, max: 1, required: false, label: 'Disability weight for the condition (0-1)' },
    ]
  },
];
