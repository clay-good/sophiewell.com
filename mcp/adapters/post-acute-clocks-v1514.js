// spec-v1514: MCP adapters for the post-acute notice and benefit clocks. The dom keys mirror views/group-v1514.js.

import * as PA from '../../lib/post-acute-clocks-v1514.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'moon-deadline',
    summary: 'When the Medicare observation notice is due. It is required past 24 hours in observation, by 36 hours or at release (42 CFR 489.20(y)).',
    compute: PA.moonDeadline,
    fields: [
      { dom: 'moon-start', arg: 'observationStart', kind: 'string', required: true, label: 'Observation began (YYYY-MM-DDTHH:MM)' },
      { dom: 'moon-end', arg: 'endTime', kind: 'string', required: false, label: 'Released, transferred or admitted (YYYY-MM-DDTHH:MM)' },
    ],
  },
  {
    id: 'nomnc-deadline',
    summary: 'Notice of Medicare Non-Coverage deadline, 2 days before services end. A late notice extends coverage (42 CFR 405.1200).',
    compute: PA.nomncDeadline,
    fields: [
      { dom: 'nomnc-setting', arg: 'setting', kind: 'enum', required: true, values: vals(PA.NOMNC_SETTINGS), label: 'Setting' },
      { dom: 'nomnc-last', arg: 'lastCovered', kind: 'string', required: true, label: 'Last covered day (YYYY-MM-DD)' },
      { dom: 'nomnc-delivered', arg: 'delivered', kind: 'string', required: false, label: 'Date delivered (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'snf-qualifying-stay',
    summary: 'Skilled nursing qualifying stay: 3 inpatient days not counting discharge, SNF care within 30 days, and benefit days left (42 CFR 409.30).',
    compute: PA.snfQualifyingStay,
    fields: [
      { dom: 'snf-admit', arg: 'inpatientAdmit', kind: 'string', required: true, label: 'Inpatient admission date (YYYY-MM-DD)' },
      { dom: 'snf-discharge', arg: 'inpatientDischarge', kind: 'string', required: true, label: 'Hospital discharge date (YYYY-MM-DD)' },
      { dom: 'snf-snfadmit', arg: 'snfAdmit', kind: 'string', required: false, label: 'SNF admission date (YYYY-MM-DD)' },
      { dom: 'snf-used', arg: 'daysUsed', kind: 'number', required: false, label: 'SNF days already used this benefit period' },
    ],
  },
  {
    id: 'hospice-period-clock',
    summary: 'Hospice benefit periods of 90, 90, then 60 days, with certification and face-to-face windows (42 CFR 418.21, 418.22).',
    compute: PA.hospicePeriodClock,
    fields: [
      { dom: 'hosp-elect', arg: 'electionDate', kind: 'string', required: true, label: 'Election date (YYYY-MM-DD)' },
      { dom: 'hosp-asof', arg: 'asOf', kind: 'string', required: false, label: 'Date to check (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'im-notice-timing',
    summary: 'When the Important Message from Medicare is due. The first copy within 2 days of admission, a follow-up up to 2 days before discharge (42 CFR 405.1205).',
    compute: PA.imNoticeTiming,
    fields: [
      { dom: 'im-admit', arg: 'admission', kind: 'string', required: true, label: 'Inpatient admission (YYYY-MM-DDTHH:MM)' },
      { dom: 'im-first', arg: 'firstDelivered', kind: 'string', required: false, label: 'First IM delivered (YYYY-MM-DD)' },
      { dom: 'im-discharge', arg: 'discharge', kind: 'string', required: false, label: 'Planned discharge (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
