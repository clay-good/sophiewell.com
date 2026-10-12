// spec-v1637 MCP adapter: dscsa-dispenser-clocks in lib/dscsa-dispenser-clocks-v1637.js. The dom
// keys mirror views/group-v1637.js and META['dscsa-dispenser-clocks'].example. Administrative
// domain. No clock: the deadline comes from the date and time entered.

import * as DC from '../../lib/dscsa-dispenser-clocks-v1637.js';

export default [
  {
    id: 'dscsa-dispenser-clocks',
    summary: 'DSCSA deadlines for a pharmacy or other dispenser. Notify FDA and trading partners within 24 hours of determining a product is illegitimate; provide transaction records within 2 business days of a request; keep investigation and disposition records 6 years (21 U.S.C. 360eee-1(d)). Gives the deadline for the event entered.',
    compute: DC.dscsaDispenserClocks,
    fields: [
      { dom: 'ddc-event', arg: 'event', kind: 'enum', required: true, values: DC.EVENTS.map((k) => k.value), label: 'What happened' },
      { dom: 'ddc-when', arg: 'when', kind: 'string', required: true, label: 'Date and time it happened (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
