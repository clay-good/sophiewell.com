// spec-v1502: MCP adapter for the units-to-request calculator. The dom keys mirror views/group-v1502.js.

import * as AU from '../../lib/auth-units-request-v1502.js';

export default [
  {
    id: 'auth-units-request',
    summary: 'Billing units to request for an authorization period. Each administration rounds up to whole units, with loading doses.',
    compute: AU.authUnitsRequest,
    fields: [
      { dom: 'au-basis', arg: 'basis', kind: 'enum', required: true, values: AU.DOSE_BASIS.map((b) => b.value), label: 'Dose in mg or mg per kg' },
      { dom: 'au-dose', arg: 'dose', kind: 'number', required: true, label: 'Maintenance dose', min: 0, exclusiveMin: true, max: 100000 },
      { dom: 'au-weight', arg: 'weightKg', kind: 'number', required: false, label: 'Weight, for mg per kg', unit: 'kg' },
      { dom: 'au-unit', arg: 'unitMg', kind: 'number', required: true, label: 'Billing unit size from the HCPCS descriptor', unit: 'mg', min: 0, exclusiveMin: true, max: 100000 },
      // spec-v1794: this declared a floor of 56 days, which is the example drug's own schedule and nothing
      // else. A monthly biologic is every 28 days and the page takes it; an agent was refused. The library
      // reads any interval above 0 and at most 3650 days, which is what is stated now.
      { dom: 'au-every', arg: 'intervalDays', kind: 'number', required: true, label: 'Days between maintenance doses', min: 0, exclusiveMin: true, max: 3650 },
      { dom: 'au-first', arg: 'firstDose', kind: 'string', required: true, label: 'First maintenance dose in the period (YYYY-MM-DD)' },
      { dom: 'au-end', arg: 'periodEnd', kind: 'string', required: true, label: 'Last day of the period (YYYY-MM-DD)' },
      { dom: 'au-lcount', arg: 'loadingCount', kind: 'number', required: false, label: 'Number of loading doses (0 if none)', max: 20 },
      { dom: 'au-ldose', arg: 'loadingDose', kind: 'number', required: false, label: 'Loading dose, same basis', min: 0, exclusiveMin: true, max: 100000 },
    ],
  },
];
