// spec-v1637 MCP adapter: cs-rx-transfer-check in lib/cs-rx-transfer-check-v1637.js. The dom keys mirror
// views/group-v1637.js and META['cs-rx-transfer-check'].example. Administrative domain. No clock.

import * as TR from '../../lib/cs-rx-transfer-check-v1637.js';

export default [
  {
    id: 'cs-rx-transfer-check',
    summary: 'Whether a controlled-substance prescription may be transferred to another pharmacy. An unfilled electronic prescription may move once between retail pharmacies (21 CFR 1306.08); Schedule III to V refills may move once, or more between pharmacies sharing a real-time database (1306.25). Lists what each pharmacist records. Both rules depend on state law.',
    compute: TR.csRxTransferCheck,
    fields: [
      { dom: 'crt-schedule', arg: 'schedule', kind: 'enum', required: true, values: TR.SCHEDULES.map((k) => k.value), label: 'Schedule' },
      { dom: 'crt-filled', arg: 'filled', kind: 'enum', required: true, values: TR.FILLED.map((k) => k.value), label: 'Has it been filled?' },
      { dom: 'crt-form', arg: 'form', kind: 'enum', values: TR.FORMS.map((k) => k.value), label: 'Form of the prescription' },
      { dom: 'crt-before', arg: 'transferredBefore', kind: 'enum', values: TR.BEFORE.map((k) => k.value), label: 'Transferred before?' },
      { dom: 'crt-database', arg: 'sharedDatabase', kind: 'enum', values: TR.DATABASE.map((k) => k.value), label: 'Do the two pharmacies share a real-time, online database? (refills)' },
      { dom: 'crt-state', arg: 'stateLaw', kind: 'enum', values: TR.STATE.map((k) => k.value), label: 'Does state law allow the transfer?' },
    ],
  },
];
