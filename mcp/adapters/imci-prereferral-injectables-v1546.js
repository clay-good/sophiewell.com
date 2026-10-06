// spec-v1546 MCP adapter: imci-prereferral-injectables in lib/imci-prereferral-injectables-v1546.js.
// The dom keys mirror views/group-v1546b.js and META['imci-prereferral-injectables'].example. Clinical domain.

import * as M from '../../lib/imci-prereferral-injectables-v1546.js';

export default [
  {
    id: 'imci-prereferral-injectables',
    summary: 'Gives IMCI pre-referral volumes for a child 2-59 months: ampicillin and gentamicin IM, IM quinine and rectal diazepam, by the chart bands with the exact mg/kg volume beside each.',
    compute: M.imciPrereferralInjectables,
    fields: [
      { dom: 'ipi-drug', arg: 'drug', kind: 'enum', required: true, label: 'Drug', values: M.DRUG_OPTIONS.map((d) => d.value) },
      { dom: 'ipi-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (preferred)', min: 1, max: 60 },
      { dom: 'ipi-age', arg: 'age', kind: 'number', label: 'Age in months', min: 0, max: 120 },
    ],
  },
];
