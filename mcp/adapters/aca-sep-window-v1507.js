// spec-v1507: MCP adapter for the Marketplace special enrollment window. The dom keys mirror views/group-v1507.js.

import * as SE from '../../lib/aca-sep-window-v1507.js';

export default [
  {
    id: 'aca-sep-window',
    summary: 'Marketplace special enrollment window and coverage start date. Handles loss of coverage, Medicaid, birth, marriage and moves (45 CFR 155.420).',
    compute: SE.acaSepWindow,
    fields: [
      { dom: 'sep-event', arg: 'event', kind: 'enum', required: true, values: SE.EVENTS.map((e) => e.value), label: 'Qualifying event' },
      { dom: 'sep-date', arg: 'eventDate', kind: 'string', required: true, label: 'Date of the event (YYYY-MM-DD)' },
      { dom: 'sep-learned', arg: 'learnedDate', kind: 'string', required: false, label: 'Date the person learned of it, if later (YYYY-MM-DD)' },
      { dom: 'sep-selected', arg: 'selectionDate', kind: 'string', required: false, label: 'Date the plan was chosen (YYYY-MM-DD)' },
    ],
  },
];
