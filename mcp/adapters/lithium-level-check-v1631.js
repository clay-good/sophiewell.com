// spec-v1631 MCP adapter: lithium-level-check in lib/lithium-level-check-v1631.js. The dom keys
// mirror views/group-v1631.js and META['lithium-level-check'].example. Clinical domain. The lithium
// carbonate label's ranges, as a label row.

import * as LI from '../../lib/lithium-level-check-v1631.js';

export default [
  {
    id: 'lithium-level-check',
    summary: 'Places a serum lithium level against the FDA label range for acute or maintenance treatment. Shows the level the label gives as toxic. Says whether the sample was drawn 12 hours after the last dose, as the range assumes, and shows the label\'s renal statements. With a daily dose and a target it gives the proportional dose, with its assumptions.',
    compute: LI.lithiumLevelCheck,
    fields: [
      { dom: 'li-phase', arg: 'phase', kind: 'enum', required: true, values: LI.PHASES.map((p) => p.value), label: 'Acute manic or mixed episode (acute) or maintenance treatment (maintenance)' },
      { dom: 'li-level', arg: 'level', kind: 'number', required: true, label: 'Serum lithium level', unit: 'mEq/L' },
      { dom: 'li-hours', arg: 'hoursSinceDose', kind: 'number', required: true, label: 'Hours since the last dose', unit: 'hours' },
      { dom: 'li-crcl', arg: 'creatinineClearance', kind: 'number', required: false, label: 'Creatinine clearance (optional)', unit: 'mL/min' },
      { dom: 'li-dose', arg: 'dailyDose', kind: 'number', required: false, label: 'Current daily dose (optional, with a target)', unit: 'mg/day' },
      { dom: 'li-target', arg: 'target', kind: 'number', required: false, label: 'Target level (optional)', unit: 'mEq/L' },
    ],
  },
];
