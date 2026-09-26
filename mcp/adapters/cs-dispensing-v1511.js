// spec-v1511: MCP adapters for the controlled-substance dispensing tools. The dom keys mirror views/group-v1511.js.

import * as CS from '../../lib/cs-dispensing-v1511.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'cs-refill-validity',
    summary: 'Controlled-substance refills left under federal rules. C-II has none; C-III and C-IV allow 5 refills within 6 months (21 CFR 1306.22).',
    compute: CS.csRefillValidity,
    fields: [
      { dom: 'csr-schedule', arg: 'schedule', kind: 'enum', required: true, values: vals(CS.SCHEDULES), label: 'Schedule' },
      { dom: 'csr-issued', arg: 'issued', kind: 'string', required: true, label: 'Date issued (YYYY-MM-DD)' },
      { dom: 'csr-check', arg: 'checkDate', kind: 'string', required: true, label: 'Date of the fill being checked (YYYY-MM-DD)' },
      { dom: 'csr-auth', arg: 'authorized', kind: 'number', required: false, label: 'Refills authorized' },
      { dom: 'csr-done', arg: 'dispensed', kind: 'number', required: false, label: 'Refills already dispensed' },
    ],
  },
  {
    id: 'c2-fill-deadlines',
    summary: 'C-II partial-fill and emergency prescription deadlines. Gives 72 hours, 30 days, 60 days, or the 7-day written follow-up (21 CFR 1306.11, 1306.13).',
    compute: CS.c2FillDeadlines,
    fields: [
      { dom: 'c2f-case', arg: 'case', kind: 'enum', required: true, values: vals(CS.C2_CASES), label: 'Which case applies' },
      { dom: 'c2f-start', arg: 'start', kind: 'string', required: true, label: 'Starting date and time (YYYY-MM-DDTHH:MM)' },
    ],
  },
  {
    id: 'c2-multiple-rx-series',
    summary: 'Checks a series of C-II prescriptions against the 90-day total and the earliest-fill-date rule (21 CFR 1306.12(b)).',
    compute: CS.c2MultipleRxSeries,
    fields: [
      { dom: 'c2m-issued', arg: 'issued', kind: 'string', required: true, label: 'Date issued (YYYY-MM-DD)' },
      { dom: 'c2m-d1', arg: 'rx1Days', kind: 'number', required: true, label: 'Prescription 1 days supply' },
      { dom: 'c2m-e1', arg: 'rx1Earliest', kind: 'string', required: false, label: 'Prescription 1 earliest fill date (YYYY-MM-DD)' },
      { dom: 'c2m-d2', arg: 'rx2Days', kind: 'number', required: false, label: 'Prescription 2 days supply' },
      { dom: 'c2m-e2', arg: 'rx2Earliest', kind: 'string', required: false, label: 'Prescription 2 earliest fill date (YYYY-MM-DD)' },
      { dom: 'c2m-d3', arg: 'rx3Days', kind: 'number', required: false, label: 'Prescription 3 days supply' },
      { dom: 'c2m-e3', arg: 'rx3Earliest', kind: 'string', required: false, label: 'Prescription 3 earliest fill date (YYYY-MM-DD)' },
    ],
  },
];
