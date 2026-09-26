// spec-v1507: MCP adapter for the Medicaid MAGI household tool. The dom keys mirror views/group-v1507.js.

import * as MH from '../../lib/magi-household-v1507.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'magi-household',
    summary: 'Each person\'s Medicaid MAGI household, income and percent of poverty. Applies the tax-filer, dependent and non-filer rules of 42 CFR 435.603(f).',
    compute: MH.magiHousehold,
    fields: [
      { dom: 'mh-people', arg: 'people', kind: 'string', required: true, label: 'Everyone in the home, one per line: name, age, files taxes (yes, no, joint), claimed by, spouse, parents in the home (a;b), required to file, annual MAGI income, full-time student' },
      { dom: 'mh-region', arg: 'region', kind: 'enum', required: true, values: vals(MH.REGIONS), label: 'Where the household lives' },
      { dom: 'mh-age', arg: 'ageRule', kind: 'enum', required: false, values: vals(MH.AGE_RULES), label: 'State age rule for children' },
      { dom: 'mh-year', arg: 'year', kind: 'number', required: false, label: 'Poverty guideline year (blank for this year)' },
    ],
  },
];
