// spec-v1638 MCP adapter: partd-opioid-safety-edit in lib/partd-opioid-safety-edit-v1638.js. The dom
// keys mirror views/group-v1638.js and META['partd-opioid-safety-edit'].example. Administrative
// domain: a plan's claim edits, not a prescribing limit. No clock.

import * as OE from '../../lib/partd-opioid-safety-edit-v1638.js';

const yn = ['yes', 'no'];
export default [
  {
    id: 'partd-opioid-safety-edit',
    summary: 'Which Part D opioid point-of-sale safety edit would fire, and the way past it. The care coordination edit at 90 MME a day, the optional hard edit at 200 MME, the 7-day opioid-naive edit, and the benzodiazepine and duplicate long-acting soft edits (CMS contract year 2027 memo). Exempt members are named. These are not prescribing limits.',
    compute: OE.partdOpioidSafetyEdit,
    fields: [
      { dom: 'ose-exempt', arg: 'exemption', kind: 'enum', required: true, values: OE.EXEMPT.map((k) => k.value), label: 'Exemption' },
      { dom: 'ose-mme', arg: 'cumulativeMme', kind: 'number', label: 'Cumulative daily MME across active opioid prescriptions', unit: 'MME' },
      { dom: 'ose-days', arg: 'daysSupply', kind: 'number', label: 'Days supply of the new opioid prescription', unit: 'days' },
      { dom: 'ose-recent', arg: 'recentOpioidFill', kind: 'enum', values: yn, label: 'An opioid fill within the plan lookback window' },
      { dom: 'ose-hard', arg: 'hardEdit200', kind: 'enum', values: yn, label: 'The plan uses the optional hard edit at 200 MME' },
      { dom: 'ose-benzo', arg: 'benzodiazepine', kind: 'enum', values: yn, label: 'Also on a benzodiazepine' },
      { dom: 'ose-la', arg: 'duplicateLongActing', kind: 'enum', values: yn, label: 'More than one long-acting opioid' },
      { dom: 'ose-plan-rx', arg: 'planPrescriberCount', kind: 'number', label: 'Prescriber count the plan attaches to its MME edits, if any' },
      { dom: 'ose-plan-ph', arg: 'planPharmacyCount', kind: 'number', label: 'Pharmacy count the plan attaches to its MME edits, if any' },
      { dom: 'ose-rx', arg: 'prescribers', kind: 'number', label: 'Number of opioid prescribers the member has' },
      { dom: 'ose-ph', arg: 'pharmacies', kind: 'number', label: 'Number of opioid pharmacies the member has' },
    ],
  },
];
