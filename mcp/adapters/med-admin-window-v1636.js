// spec-v1636 MCP adapter: med-admin-window in lib/med-admin-window-v1636.js. The dom keys mirror
// views/group-v1636.js and META['med-admin-window'].example. Administrative domain (compliance).

import * as MW from '../../lib/med-admin-window-v1636.js';

export default [
  {
    id: 'med-admin-window',
    summary: 'Whether a scheduled dose was given inside the CMS administration window. Time-critical medications: 30 minutes before or after. Not time-critical: 1 hour either side when prescribed more often than daily (no more often than every 4 hours), 2 hours either side when daily, weekly or monthly. It gives the earliest and latest acceptable time and the minutes early or late, and accepts a tighter hospital window.',
    compute: (args) => MW.medAdminWindow(args),
    fields: [
      { dom: 'maw-scheduled', arg: 'scheduled', kind: 'string', required: true, label: 'Scheduled time (YYYY-MM-DDTHH:MM)' },
      { dom: 'maw-actual', arg: 'actual', kind: 'string', required: true, label: 'Time the dose was given (YYYY-MM-DDTHH:MM)' },
      { dom: 'maw-frequency', arg: 'frequency', kind: 'enum', required: true, values: MW.FREQUENCIES.map((x) => x.value), label: 'Frequency of the order' },
      { dom: 'maw-class', arg: 'policyClass', kind: 'enum', required: true, values: MW.CLASSES.map((x) => x.value), label: 'Class under the hospital\'s policy' },
      { dom: 'maw-policy', arg: 'policyMinutes', kind: 'number', label: 'A tighter hospital window, each side (optional)', unit: 'minutes' },
    ],
  },
];
