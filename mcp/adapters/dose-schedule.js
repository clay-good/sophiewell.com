// spec-v629 wave 11: next-dose scheduling (non-clinical / administrative). Shares
// lib/dose-schedule.js with the time-to-dose tile view. nextDoses returns null on
// a malformed time or unknown frequency, which surfaces as an INCOMPLETE result.

import { nextDoses } from '../../lib/dose-schedule.js';

export default [
  {
    id: 'time-to-dose',
    summary: 'Next dose times from the time of the last dose and a dosing frequency (q4h through qid), on a 24-hour clock wrapping at midnight.',
    compute: nextDoses,
    fields: [
      { dom: 'td-time', arg: 'time', kind: 'string', required: true, label: 'Time of the last dose (HH:MM, 24-hour)' },
      { dom: 'td-freq', arg: 'freq', kind: 'enum', values: ['q4h', 'q6h', 'q8h', 'q12h', 'qd', 'bid', 'tid', 'qid'], required: true, label: 'Dosing frequency' },
    ],
  },
];
