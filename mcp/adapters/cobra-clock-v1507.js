// spec-v1507: MCP adapter for the COBRA clock. The dom keys mirror views/group-v1507.js.

import * as CB from '../../lib/cobra-clock-v1507.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'cobra-clock',
    summary: 'COBRA notice, election, first-payment and coverage-end dates. Coverage lasts 18, 29 or 36 months, at up to 102% of the premium.',
    compute: CB.cobraClock,
    fields: [
      { dom: 'cb-event', arg: 'event', kind: 'enum', required: true, values: vals(CB.EVENTS), label: 'Qualifying event' },
      { dom: 'cb-date', arg: 'eventDate', kind: 'string', required: true, label: 'Date of the event (YYYY-MM-DD)' },
      { dom: 'cb-loss', arg: 'lossDate', kind: 'string', required: false, label: 'Date coverage is lost, if later (YYYY-MM-DD)' },
      { dom: 'cb-admin', arg: 'employerAdministers', kind: 'enum', required: true, values: vals(CB.YES_NO), label: 'Employer is also the plan administrator' },
      { dom: 'cb-notice', arg: 'noticeDate', kind: 'string', required: false, label: 'Date of the election notice (YYYY-MM-DD)' },
      { dom: 'cb-elect', arg: 'electionDate', kind: 'string', required: false, label: 'Date COBRA was elected (YYYY-MM-DD)' },
      { dom: 'cb-disab', arg: 'disability', kind: 'enum', required: false, values: vals(CB.YES_NO), label: 'Disability extension' },
    ],
  },
];
