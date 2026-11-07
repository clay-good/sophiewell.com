// spec-v1699 MCP adapter: dose-history-level in lib/dose-history-level-v1699.js. The dom keys mirror
// views/group-v1699.js and META['dose-history-level'].example.

import * as DHL from '../../lib/dose-history-level-v1699.js';

export default [
  {
    id: 'dose-history-level',
    summary: 'Drug level from the doses actually given, by one-compartment superposition, beside the level the same doses give on schedule. Late, missed and doubled doses are entered as given.',
    compute: DHL.doseHistoryLevel,
    fields: [
      { dom: 'dhl-route', arg: 'route', kind: 'enum', values: ['bolus', 'infusion', 'oral'], required: true, label: 'Route' },
      { dom: 'dhl-doses', arg: 'doses', kind: 'string', required: true, label: 'Doses, one per line: time, amount in mg' },
      { dom: 'dhl-vd', arg: 'vd', kind: 'number', required: true, label: 'Volume of distribution (L)' },
      { dom: 'dhl-hl', arg: 'halfLife', kind: 'number', required: false, label: 'Half-life (h)' },
      { dom: 'dhl-cl', arg: 'clearance', kind: 'number', required: false, label: 'Clearance (L/h), in place of half-life' },
      { dom: 'dhl-tau', arg: 'interval', kind: 'number', required: true, label: 'Scheduled interval (h)' },
      { dom: 'dhl-tinf', arg: 'infusionHours', kind: 'number', required: false, label: 'Infusion duration (h)' },
      { dom: 'dhl-ka', arg: 'ka', kind: 'number', required: false, label: 'Oral absorption rate ka (per h)' },
      { dom: 'dhl-f', arg: 'bioavailability', kind: 'number', min: 0, max: 1, required: false, label: 'Oral bioavailability F (0 to 1)' },
      { dom: 'dhl-eval', arg: 'evalTimes', kind: 'string', required: true, label: 'Times to evaluate, semicolon-separated' },
    ]
  },
];
