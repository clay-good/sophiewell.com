// spec-v1636 MCP adapter: deferoxamine-acute-iron in lib/deferoxamine-acute-iron-v1636.js. The dom keys
// mirror views/group-v1636.js and META['deferoxamine-acute-iron'].example. Clinical domain.

import * as DF from '../../lib/deferoxamine-acute-iron-v1636.js';

export default [
  {
    id: 'deferoxamine-acute-iron',
    summary: 'Deferoxamine for acute iron poisoning, as the label states it: the 1,000 mg initial dose or the 500 mg subsequent dose, the intravenous rate limit (15 mg/kg/hour for the first dose, 125 mg/hour after) with the shortest infusion time, and the running 24-hour total against 6,000 mg. The label gives the intramuscular route to all patients not in shock.',
    compute: (args) => DF.deferoxamineAcuteIron(args, new Date()),
    fields: [
      { dom: 'dai-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'dai-route', arg: 'route', kind: 'enum', required: true, values: DF.ROUTES.map((x) => x.value), label: 'Route' },
      { dom: 'dai-given', arg: 'givenLast24h', kind: 'number', required: true, label: 'Deferoxamine given in the last 24 hours (0 if none)', unit: 'mg' },
    ],
  },
];
