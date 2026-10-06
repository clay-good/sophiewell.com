// spec-v1557 MCP adapter: WHO 2018 rabies post-exposure prophylaxis in lib/who-rabies-pep-v1557.js.
// The dom keys mirror views/group-v1557.js and META['who-rabies-pep'].example. Clinical domain.

import * as R from '../../lib/who-rabies-pep-v1557.js';

export default [
  {
    id: 'who-rabies-pep',
    summary: 'Gives WHO rabies post-exposure prophylaxis by exposure category and vaccination history. The vaccine schedules with dates, whether RIG is needed, the RIG ceiling (20 IU/kg human, 40 IU/kg equine) and its day-7 deadline, and the 10-day stop rule.',
    compute: R.whoRabiesPep,
    fields: [
      { dom: 'rp-category', arg: 'category', kind: 'enum', required: true, label: 'WHO exposure category', values: R.CATEGORY_OPTIONS.map((d) => d.value) },
      { dom: 'rp-prior', arg: 'prior', kind: 'enum', required: true, label: 'Rabies vaccination history', values: R.PRIOR_OPTIONS.map((d) => d.value) },
      { dom: 'rp-immuno', arg: 'immuno', kind: 'enum', required: true, label: 'Immunocompromised', values: R.YES_NO.map((d) => d.value) },
      { dom: 'rp-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (for the RIG ceiling)', min: 0.5, max: 250 },
      { dom: 'rp-rig', arg: 'rig', kind: 'enum', label: 'RIG available', values: R.RIG_OPTIONS.map((d) => d.value) },
      { dom: 'rp-day0', arg: 'day0', kind: 'string', label: 'Date of the first vaccine dose (YYYY-MM-DD)' },
    ],
  },
];
