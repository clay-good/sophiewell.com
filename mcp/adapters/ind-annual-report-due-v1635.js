// spec-v1635 MCP adapter: ind-annual-report-due in lib/ind-annual-report-due-v1635.js. The dom keys
// mirror views/group-v1635.js and META['ind-annual-report-due'].example. Operational domain. The
// clock is injected; at least one date is needed.

import * as IA from '../../lib/ind-annual-report-due-v1635.js';

export default [
  {
    id: 'ind-annual-report-due',
    summary: 'When an IND goes into effect and when its annual reports are due. The IND is in effect 30 days after FDA receives it, or on FDA\'s earlier notice (21 CFR 312.40); the annual report is due within 60 days of each anniversary (312.33); and FDA is told of a new investigator within 30 days (312.30). The 30-day date assumes no clinical hold.',
    compute: (args) => IA.indAnnualReportDue(args, new Date()),
    fields: [
      { dom: 'iar-received', arg: 'received', kind: 'string', label: 'Date FDA received the IND (YYYY-MM-DD)' },
      { dom: 'iar-may-begin', arg: 'mayBegin', kind: 'string', label: 'Earlier date FDA said the study may begin (YYYY-MM-DD, optional)' },
      { dom: 'iar-investigator', arg: 'investigatorAdded', kind: 'string', label: 'Date a new investigator was added (YYYY-MM-DD, optional)' },
    ],
  },
];
