// spec-v300 MCP wave: adapter for the AVF maturation "Rule of 6s" in
// lib/av-fistula-v300.js. The dom keys mirror the browser renderer
// (views/group-v300.js) and META['avf-rule-of-6s'].example. `flow`, `diameter`,
// and `depth` are the three required measurements; the compute returns the
// per-criterion pass flags and the all-met result. The `band` carries the
// "700 / 7 / 4 vs 600 / 6 / 6" example, so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as A from '../../lib/av-fistula-v300.js';

export default [
  {
    id: 'avf-rule-of-6s',
    summary: 'Arteriovenous fistula (AVF) maturation "Rule of 6s" (2006 KDOQI): given the internal fistula blood flow (mL/min), vein inner diameter (mm), and vein depth from the skin (mm), reports which of the three thresholds are met (flow ≥ 600, diameter ≥ 6, depth ≤ 6) and whether all three are satisfied - all met is highly predictive of functional maturation (PPV >90%), not all met does not reliably predict failure (NPV ~47%). Reports the cited rule criteria, not a cannulation decision.',
    compute: A.avfRuleOf6s,
    fields: [
      { dom: 'avf-flow', arg: 'flow', kind: 'number', required: true, label: 'Fistula blood flow', unit: 'mL/min' },
      { dom: 'avf-diameter', arg: 'diameter', kind: 'number', required: true, label: 'Vein inner diameter', unit: 'mm' },
      { dom: 'avf-depth', arg: 'depth', kind: 'number', required: true, label: 'Vein depth from skin', unit: 'mm' },
    ],
  },
];
