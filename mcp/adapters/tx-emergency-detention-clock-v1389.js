// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.
// Times are local wall-clock strings, 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as ED from '../../lib/tx-emergency-detention-clock-v1389.js';

export default [
  {
    id: 'tx-emergency-detention-clock',
    summary: 'Texas emergency detention deadline: 48 hours from presentation, waiting time included, rolled to 4 p.m. on the next business day. Under Health and Safety Code section 573.021, a person accepted for a preliminary examination may be held no longer than 48 hours after being presented to the facility without a protective custody order, and the 48 hours include time spent waiting in the facility for care. A period ending on a Saturday, Sunday, or legal holiday runs to 4 p.m. on the first succeeding business day. When it ends on a business day the section reads two ways (4 p.m. that day, or 4 p.m. on the next business day), and both are printed. A physician examines the person within 12 hours of apprehension.',
    compute: ED.txEmergencyDetentionClock,
    fields: [
      { dom: 'txed-presented', arg: 'presented', kind: 'string', required: true, label: 'Presented to the facility (YYYY-MM-DDTHH:MM)' },
      { dom: 'txed-apprehended', arg: 'apprehended', kind: 'string', label: 'Apprehended (YYYY-MM-DDTHH:MM)' },
      { dom: 'txed-extensions', arg: 'extensions', kind: 'number', label: 'Daily 24-hour weather or disaster extensions ordered' },
    ],
  },
];
