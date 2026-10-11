// spec-v1634 MCP adapter: warfarin-inr-out-of-range in lib/warfarin-inr-out-of-range-v1634.js. The
// dom keys mirror views/group-v1634.js and META['warfarin-inr-out-of-range'].example. Clinical
// domain. "Previously stable" is needed unless there is major bleeding.

import * as WI from '../../lib/warfarin-inr-out-of-range-v1634.js';

export default [
  {
    id: 'warfarin-inr-out-of-range',
    summary: 'What the CHEST 2012 guideline suggests for an out-of-range INR on warfarin. It matches the INR, target range, prior stability and bleeding to the numbered recommendations (3.1, 3.2, 9.1a, 9.1b, 9.3) and quotes each with its grade. Where none applies it says so; it gives no vitamin K dose the recommendation does not state.',
    compute: WI.warfarinInrOutOfRange,
    fields: [
      { dom: 'wio-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'wio-low', arg: 'targetLow', kind: 'number', required: true, label: 'Target range, lower end' },
      { dom: 'wio-high', arg: 'targetHigh', kind: 'number', required: true, label: 'Target range, upper end' },
      { dom: 'wio-bleeding', arg: 'bleeding', kind: 'enum', required: true, values: WI.BLEEDING.map((b) => b.value), label: 'Bleeding' },
      { dom: 'wio-stable', arg: 'stable', kind: 'enum', values: ['yes', 'no'], label: 'INRs previously stable in range (needed unless major bleeding)' },
    ],
  },
];
