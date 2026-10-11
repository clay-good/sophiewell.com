// spec-v1633 MCP adapter: lamotrigine-titration-calendar in
// lib/lamotrigine-titration-calendar-v1633.js. The dom keys mirror views/group-v1633.js and
// META['lamotrigine-titration-calendar'].example. Clinical domain. Two label rows: Lamictal and
// Lamictal XR.

import * as LT from '../../lib/lamotrigine-titration-calendar-v1633.js';

export default [
  {
    id: 'lamotrigine-titration-calendar',
    summary: 'The lamotrigine escalation schedule on the label, as dates. For immediate-release tablets (epilepsy older than 12 years, epilepsy ages 2 to 12 by weight, or adult bipolar disorder) or Lamictal XR, it takes the co-medication column (valproate, neither, or an enzyme inducer without valproate) and a start date and lists each week\'s dose, then the label\'s rule for later increases, the maintenance range, and the restart and stopping rules. It does not choose a dose the label leaves open.',
    compute: LT.lamotrigineTitrationCalendar,
    fields: [
      { dom: 'ltc-regimen', arg: 'regimen', kind: 'enum', required: true, values: LT.REGIMENS.map((d) => d.value), label: 'Formulation and indication' },
      { dom: 'ltc-comed', arg: 'comed', kind: 'enum', required: true, values: LT.COMEDS.map((d) => d.value), label: 'Co-medication: valproate, neither, or inducer' },
      { dom: 'ltc-date', arg: 'startDate', kind: 'string', required: true, label: 'Date of the first dose (YYYY-MM-DD)' },
      { dom: 'ltc-weight', arg: 'weightKg', kind: 'number', label: 'Weight (ages 2 to 12)', unit: 'kg' },
    ],
  },
];
