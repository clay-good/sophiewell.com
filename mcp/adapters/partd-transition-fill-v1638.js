// spec-v1638 MCP adapter: partd-transition-fill in lib/partd-transition-fill-v1638.js. The dom keys
// mirror views/group-v1638.js and META['partd-transition-fill'].example. Administrative domain.
// No clock: the request date is an input.

import * as TF from '../../lib/partd-transition-fill-v1638.js';

export default [
  {
    id: 'partd-transition-fill',
    summary: 'Whether a Part D plan owes a temporary transition supply, and how many days. In the first 90 days of coverage a non-formulary drug, or one with prior authorization or step therapy, gets at least a month of medication, once (42 CFR 423.120(b)(3)). Gives the last day of the window and the 3-business-day notice date.',
    compute: TF.partdTransitionFill,
    fields: [
      { dom: 'ptf-status', arg: 'drugStatus', kind: 'enum', required: true, values: TF.STATUS.map((k) => k.value), label: 'Status of the drug on the plan' },
      { dom: 'ptf-effective', arg: 'coverageEffective', kind: 'string', required: true, label: 'Date coverage under the plan took effect (YYYY-MM-DD)' },
      { dom: 'ptf-requested', arg: 'requested', kind: 'string', required: true, label: 'Date of the fill request (YYYY-MM-DD)' },
      { dom: 'ptf-month', arg: 'monthDays', kind: 'number', required: true, label: 'Days in the approved one-month supply', unit: 'days' },
      { dom: 'ptf-already', arg: 'alreadySupplied', kind: 'number', required: true, label: 'Days already supplied under transition for this drug (0 if none)', unit: 'days' },
      { dom: 'ptf-change', arg: 'immediateChange', kind: 'enum', required: true, values: TF.CHANGE.map((k) => k.value), label: 'An immediate formulary change' },
      { dom: 'ptf-written', arg: 'daysWritten', kind: 'number', label: 'Days written on the prescription', unit: 'days' },
      { dom: 'ptf-adjudicated', arg: 'adjudicated', kind: 'string', label: 'Date the temporary fill adjudicated (YYYY-MM-DD)' },
    ],
  },
];
