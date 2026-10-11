// spec-v1634 MCP adapter: fda-adverse-event-report-clock in
// lib/fda-adverse-event-report-clock-v1634.js. The dom keys mirror views/group-v1634.js and
// META['fda-adverse-event-report-clock'].example. Operational domain. The clock is injected.

import * as FC from '../../lib/fda-adverse-event-report-clock-v1634.js';

export default [
  {
    id: 'fda-adverse-event-report-clock',
    summary: 'The FDA postmarketing adverse event report that applies, and its due date. A serious and unexpected event is a 15-day Alert report due 15 calendar days from first receipt; anything else for an approved drug or licensed biologic goes in the periodic report, dated from the approval or license date (21 CFR 314.80, 600.80, 310.305). Seriousness, expectedness and causality are inputs, not decided here.',
    compute: (args) => FC.fdaAdverseEventReportClock(args, new Date()),
    fields: [
      { dom: 'fac-setting', arg: 'setting', kind: 'enum', required: true, values: FC.SETTINGS.map((x) => x.value), label: 'Setting' },
      { dom: 'fac-outcome', arg: 'outcome', kind: 'enum', required: true, values: FC.OUTCOMES.map((x) => x.value), label: 'Most serious outcome' },
      { dom: 'fac-unexpected', arg: 'unexpected', kind: 'enum', values: ['yes', 'no'], label: 'Unexpected (not listed in the current labeling); needed when serious' },
      { dom: 'fac-received', arg: 'received', kind: 'string', required: true, label: 'Date the information was first received (YYYY-MM-DD)' },
      { dom: 'fac-source', arg: 'source', kind: 'enum', values: FC.SOURCES.map((x) => x.value), label: 'Postmarketing study (optional)' },
      { dom: 'fac-approval', arg: 'approval', kind: 'string', label: 'Approval or license date, for periodic reports (YYYY-MM-DD)' },
    ],
  },
];
