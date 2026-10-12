// spec-v1635 MCP adapter: trial-record-retention in lib/trial-record-retention-v1635.js. The dom keys
// mirror views/group-v1635.js and META['trial-record-retention'].example. Operational domain.

import * as TR from '../../lib/trial-record-retention-v1635.js';

export default [
  {
    id: 'trial-record-retention',
    summary: 'The earliest federal date for destroying investigational drug study records. Two years after a marketing application is approved, or after the investigation (for a sponsor, shipment and delivery) is discontinued and FDA notified (21 CFR 312.62 and 312.57). A longer requirement entered by the reader governs if it is later. It is the federal minimum only.',
    compute: TR.trialRecordRetention,
    fields: [
      { dom: 'trr-role', arg: 'role', kind: 'enum', required: true, values: TR.ROLES.map((x) => x.value), label: 'Role' },
      { dom: 'trr-event', arg: 'event', kind: 'enum', required: true, values: TR.EVENTS.map((x) => x.value), label: 'What started the clock' },
      { dom: 'trr-date', arg: 'date', kind: 'string', required: true, label: 'Date of that event (YYYY-MM-DD)' },
      { dom: 'trr-longer', arg: 'longerUntil', kind: 'string', label: 'A longer retention date from the protocol, contract or state law (YYYY-MM-DD, optional)' },
    ],
  },
];
