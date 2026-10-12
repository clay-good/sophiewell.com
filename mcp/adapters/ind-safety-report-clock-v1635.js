// spec-v1635 MCP adapter: ind-safety-report-clock in lib/ind-safety-report-clock-v1635.js. The dom
// keys mirror views/group-v1635.js and META['ind-safety-report-clock'].example. Operational domain.
// The clock is injected.

import * as IS from '../../lib/ind-safety-report-clock-v1635.js';

export default [
  {
    id: 'ind-safety-report-clock',
    summary: 'IND safety report deadlines under 21 CFR 312.32. For a sponsor: 15 calendar days from the determination that the information qualifies, 7 calendar days from first receipt for an unexpected fatal or life-threatening suspected adverse reaction, and 15 days from an FDA request for more data. For an investigator the rule says "immediately" and no date is counted. Seriousness and causality are inputs.',
    compute: (args) => IS.indSafetyReportClock(args, new Date()),
    fields: [
      { dom: 'isr-role', arg: 'role', kind: 'enum', required: true, values: IS.ROLES.map((x) => x.value), label: 'Who is reporting' },
      { dom: 'isr-fatal', arg: 'fatalOrLifeThreatening', kind: 'enum', values: ['yes', 'no'], label: 'Unexpected fatal or life-threatening suspected adverse reaction (sponsor)' },
      { dom: 'isr-determined', arg: 'determined', kind: 'string', label: 'Date the sponsor determined it qualifies (YYYY-MM-DD)' },
      { dom: 'isr-received', arg: 'received', kind: 'string', label: 'Date the sponsor first received the information (YYYY-MM-DD)' },
      { dom: 'isr-request', arg: 'fdaRequest', kind: 'string', label: 'Date of an FDA request for more data (YYYY-MM-DD, optional)' },
    ],
  },
];
