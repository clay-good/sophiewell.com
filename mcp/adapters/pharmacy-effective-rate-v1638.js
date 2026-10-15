// spec-v1638 MCP adapter: pharmacy-effective-rate in lib/pharmacy-effective-rate-v1638.js. The dom
// keys mirror views/group-v1638.js and META['pharmacy-effective-rate'].example. Administrative
// domain. No clock.

import { pharmacyEffectiveRate } from '../../lib/pharmacy-effective-rate-v1638.js';

export default [
  {
    id: 'pharmacy-effective-rate',
    summary: 'A pharmacy\'s achieved effective rate against a contract guarantee, for brand or generic claims over a period. The rate is one minus ingredient cost paid over AWP; the difference from the guarantee times AWP is the true-up exposure. Adds net reimbursement and margin per prescription. A claims list gives brand and generic separately, the generic dispensing rate, and claims where the patient paid more than the pharmacy kept. No AWP is supplied.',
    compute: pharmacyEffectiveRate,
    fields: [
      { dom: 'per-awp', arg: 'awp', kind: 'number', required: false, label: 'Sum of AWP for the claims the contract counts', unit: 'dollars' },
      { dom: 'per-paid', arg: 'ingredientPaid', kind: 'number', required: false, label: 'Ingredient cost paid on those claims', unit: 'dollars' },
      { dom: 'per-guarantee', arg: 'guaranteedDiscountPercent', kind: 'number', label: 'Guaranteed discount off AWP', unit: 'percent' },
      { dom: 'per-rx', arg: 'prescriptions', kind: 'number', label: 'Number of prescriptions' },
      { dom: 'per-fees', arg: 'dispensingFees', kind: 'number', label: 'Dispensing fees paid (0 if none)', unit: 'dollars' },
      { dom: 'per-conc', arg: 'concessions', kind: 'number', label: 'Price concessions and later fees taken (0 if none)', unit: 'dollars' },
      { dom: 'per-acq', arg: 'acquisitionCost', kind: 'number', label: 'Acquisition cost of the drugs dispensed', unit: 'dollars' },
      { dom: 'per-claims', arg: 'claims', kind: 'string', label: 'Or a claims list (CSV with a header row: type, AWP, ingredient cost paid; optional fee, concessions, acquisition cost, patient pay)' },
      { dom: 'per-gb', arg: 'guaranteedBrandPercent', kind: 'number', label: 'Claims list: guaranteed brand discount off AWP', unit: 'percent' },
      { dom: 'per-gg', arg: 'guaranteedGenericPercent', kind: 'number', label: 'Claims list: guaranteed generic discount off AWP', unit: 'percent' },
    ],
  },
];
