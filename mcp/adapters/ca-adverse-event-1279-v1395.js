// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.

import * as AE from '../../lib/ca-adverse-event-1279-v1395.js';

export default [
  {
    id: 'ca-adverse-event-1279',
    summary: "Whether an event is a California reportable adverse event and when the report to CDPH is due. Under Health and Safety Code 1279.1 a licensed hospital reports any of 28 adverse events within five days of detection, or within 24 hours when the event is an ongoing urgent or emergent threat, and tells the patient or responsible party by the time the report is made. The events include wrong-site surgery, a retained foreign object, a stage 3 or 4 pressure ulcer acquired after admission, death from a fall, and neonatal hyperbilirubinemia over 30 mg/dL with death or serious disability; a catch-all covers any event causing death or serious disability.",
    compute: AE.caAdverseEvent1279,
    fields: [
      { dom: 'ae-event', arg: 'event', kind: 'enum', required: true, label: 'Event', values: AE.AE_EVENTS.map((e) => e.value) },
      { dom: 'ae-urgent', arg: 'urgent', kind: 'enum', label: 'An ongoing urgent or emergent threat', values: ['yes', 'no'] },
      { dom: 'ae-detected', arg: 'detected', kind: 'string', label: 'Detected (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
