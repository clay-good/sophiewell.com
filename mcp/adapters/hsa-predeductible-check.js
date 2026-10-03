// spec-v1601 tool 3: MCP adapter for hsa-predeductible-check. The dom keys mirror views/group-v1601.js.

import * as HP from '../../lib/hsa-predeductible-check.js';

const vals = (xs) => xs.map((x) => x.value);
const box = (dom, arg, label) => ({ dom, arg, kind: 'bool', required: false, label: `Diagnosed: ${label}` });

export default [
  {
    id: 'hsa-predeductible-check',
    summary: 'Whether an HSA-qualifying plan can cover an item before the deductible. The IRS safe harbors for preventive care, the chronic-condition list, insulin and telehealth.',
    compute: HP.hsaPredeductibleCheck,
    fields: [
      { dom: 'hpd-item', arg: 'item', kind: 'enum', required: true, values: vals(HP.ITEMS), label: 'What the plan would cover before the deductible' },
      box('hpd-chf', 'chf', 'congestive heart failure'),
      box('hpd-cad', 'cad', 'coronary artery disease'),
      box('hpd-heart', 'heart', 'heart disease'),
      box('hpd-diabetes', 'diabetes', 'diabetes'),
      box('hpd-hypertension', 'hypertension', 'hypertension'),
      box('hpd-asthma', 'asthma', 'asthma'),
      box('hpd-osteoporosis', 'osteoporosis', 'osteoporosis'),
      box('hpd-osteopenia', 'osteopenia', 'osteopenia'),
      box('hpd-liver', 'liver', 'liver disease'),
      box('hpd-bleeding', 'bleeding', 'a bleeding disorder'),
      box('hpd-depression', 'depression', 'depression'),
      { dom: 'hpd-purpose', arg: 'purpose', kind: 'enum', required: false, values: vals(HP.YES_NO), label: 'Prescribed to prevent worsening or a secondary condition' },
      { dom: 'hpd-year', arg: 'planYear', kind: 'number', required: false, label: 'Year the plan year begins', unit: 'year' },
    ],
  },
];
