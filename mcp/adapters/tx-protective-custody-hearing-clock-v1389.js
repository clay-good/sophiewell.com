// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.

import * as PC from '../../lib/tx-protective-custody-hearing-clock-v1389.js';

export default [
  {
    id: 'tx-protective-custody-hearing-clock',
    summary: 'Texas probable-cause hearing deadline: 72 hours after protective custody detention, moved off a weekend or legal holiday. Under Health and Safety Code section 574.025, the hearing is held no later than 72 hours after the person was detained under a protective custody order, and when the 72 hours end on a Saturday, Sunday, or legal holiday it is held on the next day that is not one. Under section 574.005 the hearing on the application for court-ordered services is set within 14 days of filing, not in the first 3 days if the patient or attorney objects, and no later than the 30th day with continuances.',
    compute: PC.txProtectiveCustodyHearingClock,
    fields: [
      { dom: 'txpc-detained', arg: 'detained', kind: 'string', label: 'Detained under the protective custody order (YYYY-MM-DDTHH:MM)' },
      { dom: 'txpc-filed', arg: 'filed', kind: 'string', label: 'Application filed (YYYY-MM-DD)' },
    ],
  },
];
