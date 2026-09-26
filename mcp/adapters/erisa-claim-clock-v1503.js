// spec-v1503: MCP adapter for the ERISA claim clock. The dom keys mirror views/group-v1503.js.

import * as ER from '../../lib/erisa-claim-clock-v1503.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'erisa-claim-clock',
    summary: 'Employer health plan claim and appeal deadline under ERISA. Covers urgent, concurrent, pre-service and post-service claims (29 CFR 2560.503-1).',
    compute: ER.erisaClaimClock,
    fields: [
      { dom: 'er-type', arg: 'claimType', kind: 'enum', required: true, values: vals(ER.CLAIM_TYPES), label: 'Kind of claim' },
      { dom: 'er-stage', arg: 'stage', kind: 'enum', required: true, values: vals(ER.STAGES), label: 'Claim or appeal' },
      { dom: 'er-received', arg: 'received', kind: 'string', required: true, label: 'Plan received it (YYYY-MM-DD, or YYYY-MM-DDTHH:MM for urgent and concurrent care)' },
      { dom: 'er-extended', arg: 'extended', kind: 'enum', required: false, values: vals(ER.YES_NO), label: 'Claims only: plan took its 15-day extension' },
      { dom: 'er-extnotice', arg: 'extensionNotice', kind: 'string', required: false, label: 'Date of the extension notice (YYYY-MM-DD)' },
      { dom: 'er-levels', arg: 'levels', kind: 'enum', required: false, values: vals(ER.LEVELS), label: 'Appeals only: one or two levels' },
      { dom: 'er-denial', arg: 'denialReceived', kind: 'string', required: false, label: 'Date the denial was received (YYYY-MM-DD)' },
    ],
  },
];
