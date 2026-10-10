// spec-v629 wave 9: HIPAA breach-notification deadlines from lib/regulatory.js
// (non-clinical / administrative). Pure date arithmetic from the discovery date
// and the affected-individual count -- no clock, deterministic as-is.

import * as R from '../../lib/regulatory.js';

export default [
  {
    id: 'breach-clock',
    summary: 'HIPAA breach-notification deadlines: the individual, media, and HHS notice due dates from the discovery date and the number of affected individuals (HHS at 500 or more in total; media at more than 500 residents of one state).',
    compute: R.breachNotificationDeadlines,
    fields: [
      { dom: 'd', arg: 'discoveryDate', kind: 'string', required: true, label: 'Breach discovery date (YYYY-MM-DD)' },
      { dom: 'n', arg: 'affectedIndividuals', kind: 'number', required: true, label: 'Number of affected individuals' },
      { dom: 'bc-state', arg: 'largestStateResidents', kind: 'number', label: 'Most affected residents in any one state or jurisdiction (decides the media notice: more than 500)' },
    ],
  },
];
