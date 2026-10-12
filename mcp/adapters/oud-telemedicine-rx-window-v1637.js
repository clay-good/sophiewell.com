// spec-v1637 MCP adapter: oud-telemedicine-rx-window in lib/oud-telemedicine-rx-window-v1637.js.
// The dom keys mirror views/group-v1637.js and META['oud-telemedicine-rx-window'].example.
// Administrative domain. No clock: coverage is judged on the prescription's own date.

import * as TW from '../../lib/oud-telemedicine-rx-window-v1637.js';

export default [
  {
    id: 'oud-telemedicine-rx-window',
    summary: 'Which federal rule covers a controlled-substance prescription issued by telemedicine. For a prescriber who has not seen the patient in person: the opioid use disorder rule gives six calendar months from the first prescription (21 CFR 1306.51); the VA rule has no time limit (1306.52); the temporary rule covers Schedule II to V through December 31, 2026 (1307.41).',
    compute: TW.oudTelemedicineRxWindow,
    fields: [
      { dom: 'otw-date', arg: 'prescribedOn', kind: 'string', required: true, label: 'Date of the prescription (YYYY-MM-DD)' },
      { dom: 'otw-seen', arg: 'inPerson', kind: 'enum', required: true, values: TW.IN_PERSON.map((k) => k.value), label: 'In-person evaluation by the prescriber' },
      { dom: 'otw-schedule', arg: 'schedule', kind: 'enum', values: TW.SCHEDULES.map((k) => k.value), label: 'Schedule' },
      { dom: 'otw-purpose', arg: 'purpose', kind: 'enum', values: TW.PURPOSES.map((k) => k.value), label: 'Purpose' },
      { dom: 'otw-va', arg: 'va', kind: 'enum', values: TW.VA.map((k) => k.value), label: 'Department of Veterans Affairs' },
      { dom: 'otw-pdmp', arg: 'pdmp', kind: 'enum', values: TW.PDMP.map((k) => k.value), label: 'State drug-monitoring database' },
      { dom: 'otw-first', arg: 'firstTelemedicineRx', kind: 'string', label: 'Date of the first telemedicine prescription to this patient (YYYY-MM-DD)' },
    ],
  },
];
