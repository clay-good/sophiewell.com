// spec-v708 MCP adapter: AAO-HNS Meniere hearing stage in lib/meniere-aao-hns-v708.js.
// The dom keys mirror the browser renderer (views/group-v708.js) and
// META['meniere-aao-hns'].example. Four pure-tone thresholds; their mean (PTA) maps to a
// hearing stage. Clinical domain.

import { meniereAaoHns } from '../../lib/meniere-aao-hns-v708.js';

export default [
  {
    id: 'meniere-aao-hns',
    summary: "AAO-HNS hearing stage for Meniere's disease (Committee on Hearing and Equilibrium 1995): PTA = mean of the pure-tone thresholds at 500, 1000, 2000, and 3000 Hz (dB HL), worst audiogram in the prior 6 months. Stage 1 PTA <= 25 dB, stage 2 26-40, stage 3 41-70, stage 4 > 70. Applies to definite Meniere's disease.",
    compute: meniereAaoHns,
    fields: [
      { dom: 'men-500', arg: 'threshold500', kind: 'number', unit: 'dB HL', required: true, label: 'Threshold at 500 Hz (dB HL)' },
      { dom: 'men-1000', arg: 'threshold1000', kind: 'number', unit: 'dB HL', required: true, label: 'Threshold at 1000 Hz (dB HL)' },
      { dom: 'men-2000', arg: 'threshold2000', kind: 'number', unit: 'dB HL', required: true, label: 'Threshold at 2000 Hz (dB HL)' },
      { dom: 'men-3000', arg: 'threshold3000', kind: 'number', unit: 'dB HL', required: true, label: 'Threshold at 3000 Hz (dB HL)' },
    ],
  },
];
