// spec-v1656 MCP adapter: osha-noise-dose in lib/osha-noise-dose-v1656.js. The dom keys mirror
// views/group-v1656.js and META['osha-noise-dose'].example.

import * as OND from '../../lib/osha-noise-dose-v1656.js';

export default [
  {
    id: 'osha-noise-dose',
    summary: 'OSHA noise dose and 8-hour TWA from a day of exposures, per 29 CFR 1910.95 Appendix A. Checks the dose against the 50% action level and the 100% permissible exposure.',
    compute: OND.oshaNoiseDose,
    fields: [
      { dom: 'ond-segments', arg: 'segments', kind: 'string', required: false, label: 'Exposures, one per line: dBA, then hours or hours:minutes' },
      { dom: 'ond-dose', arg: 'dosimeterDose', kind: 'number', required: false, label: 'Dosimeter dose in percent (when no exposures are entered)' },
      { dom: 'ond-impulse', arg: 'impulseOver140', kind: 'enum', values: ['yes', 'no'], required: false, label: 'Impulsive or impact noise above 140 dB peak' },
    ]
  },
];
