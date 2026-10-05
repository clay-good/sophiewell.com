// spec-v1551 MCP adapter: WHO pre-referral rectal artesunate in lib/rectal-artesunate-prereferral-v1551.js.
// The dom keys mirror views/group-v1551.js and META['rectal-artesunate-prereferral'].example. Clinical domain.

import * as RA from '../../lib/rectal-artesunate-prereferral-v1551.js';

export default [
  {
    id: 'rectal-artesunate-prereferral',
    summary: 'Gives the WHO pre-referral rectal artesunate dose for a child under 6. One 100 mg suppository up to 10 kg, two up to 20 kg, only with a danger sign, when IM artesunate is not available and referral takes 6 hours or more. Otherwise it says what to do instead.',
    compute: RA.rectalArtesunatePrereferral,
    fields: [
      { dom: 'ras-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'ras-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 0.5, max: 150 },
      { dom: 'ras-danger', arg: 'danger', kind: 'enum', required: true, label: 'Fever with a danger sign', values: RA.DANGER_OPTIONS.map((d) => d.value) },
      { dom: 'ras-referral', arg: 'referral', kind: 'enum', required: true, label: 'Time to referral care', values: RA.REFERRAL_OPTIONS.map((d) => d.value) },
      { dom: 'ras-im', arg: 'imAvailable', kind: 'enum', required: true, label: 'IM artesunate available', values: RA.IM_OPTIONS.map((d) => d.value) },
    ],
  },
];
