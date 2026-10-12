// spec-v1637 MCP adapter: unit-dose-repack-expiry in lib/unit-dose-repack-expiry-v1637.js. The dom
// keys mirror views/group-v1637.js and META['unit-dose-repack-expiry'].example. Administrative
// domain. No clock.

import * as UD from '../../lib/unit-dose-repack-expiry-v1637.js';

export default [
  {
    id: 'unit-dose-repack-expiry',
    summary: 'The latest expiration date for a solid oral drug repackaged into unit-dose containers. FDA\'s July 2020 policy: the shorter of 6 months from repackaging and 25 percent of the time left to the manufacturer\'s expiration date, when five circumstances are all present. It does not cover pharmacies or liquids.',
    compute: UD.unitDoseRepackExpiry,
    fields: [
      { dom: 'udr-repackaged', arg: 'repackaged', kind: 'string', required: true, label: 'Date of repackaging (YYYY-MM-DD)' },
      { dom: 'udr-expiry', arg: 'manufacturerExpiry', kind: 'string', required: true, label: 'Expiration date on the manufacturer\'s container (YYYY-MM-DD or YYYY-MM)' },
      ...UD.CONDITIONS.map((c) => ({ dom: c.dom, arg: c.arg, kind: 'enum', required: true, values: ['yes', 'no'], label: c.ask })),
    ],
  },
];
