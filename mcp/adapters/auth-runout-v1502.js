// spec-v1502: MCP adapter for the authorization run-out clock. The dom keys mirror views/group-v1502.js.

import * as AR from '../../lib/auth-runout-v1502.js';

export default [
  {
    id: 'auth-runout',
    summary: 'When an authorization runs out, by its end date or by its units, and the date to submit the renewal.',
    compute: AR.authRunout,
    fields: [
      { dom: 'ar-start', arg: 'startDate', kind: 'string', required: true, label: 'Approval start date (YYYY-MM-DD)' },
      { dom: 'ar-end', arg: 'endDate', kind: 'string', required: true, label: 'Approval end date (YYYY-MM-DD)' },
      { dom: 'ar-approved', arg: 'approved', kind: 'number', required: true, label: 'Units or visits approved', bound: 'hcg', boundScale: 0.01 },
      { dom: 'ar-used', arg: 'used', kind: 'number', required: true, label: 'Units or visits used so far (0 if none)', bound: 'hcg', boundScale: 0.01 },
      { dom: 'ar-per', arg: 'perDose', kind: 'number', required: true, label: 'Units given at each administration' },
      // spec-v1794: this declared a floor of 56 days, which is the example drug's own schedule and nothing
      // else. A monthly biologic is every 28 days and the page takes it; an agent was refused. The library
      // reads any interval above 0 and at most 3650 days, which is what is stated now.
      { dom: 'ar-every', arg: 'intervalDays', kind: 'number', required: true, label: 'Days between administrations', min: 0, exclusiveMin: true, max: 3650 },
      { dom: 'ar-next', arg: 'nextDose', kind: 'string', required: true, label: 'Next scheduled administration (YYYY-MM-DD)' },
      { dom: 'ar-lead', arg: 'leadDays', kind: 'number', required: false, label: 'Days ahead to submit the renewal (default 14)', unit: 'days', max: 365 },
    ],
  },
];
