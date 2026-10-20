// spec-v1658 MCP adapter: pt-event-score in lib/pt-event-score-v1658.js. The dom keys mirror views/group-v1658.js and
// META['pt-event-score'].example.

import * as PTE from '../../lib/pt-event-score-v1658.js';

export default [
  {
    id: 'pt-event-score',
    summary: 'CLIA proficiency-testing analyte and event scores against the 80% line, from each analyte\'s acceptable responses and challenges. Checks the two-consecutive and two-of-three rules too.',
    compute: PTE.ptEventScore,
    fields: [
      { dom: 'pte-analytes', arg: 'analytes', kind: 'string', required: true, label: 'One analyte per line: name, acceptable responses, challenges' },
      { dom: 'pte-prev', arg: 'previousEvent', kind: 'enum', values: PTE.HISTORY.map((x) => x.value), required: false, label: 'Previous event, overall' },
      { dom: 'pte-prev2', arg: 'eventBeforeThat', kind: 'enum', values: PTE.HISTORY.map((x) => x.value), required: false, label: 'The event before that, overall' },
    ]
  },
];
