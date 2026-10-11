// spec-v1631 MCP adapter: caffeine-citrate-dose in lib/caffeine-citrate-dose-v1631.js. The dom keys
// mirror views/group-v1631.js and META['caffeine-citrate-dose'].example. Clinical domain. The
// caffeine citrate label's dosing table, as a label row; no target range is shown.

import * as CC from '../../lib/caffeine-citrate-dose-v1631.js';

export default [
  {
    id: 'caffeine-citrate-dose',
    summary: 'Loading and maintenance doses of caffeine citrate for apnea of prematurity from the FDA label, for a weight. Gives each in mg of caffeine citrate, mg of caffeine base and mL of the 20 mg/mL solution. A serum level is set beside the 50 mg/L the label associates with serious toxicity; the label gives no therapeutic range.',
    compute: CC.caffeineCitrateDose,
    fields: [
      { dom: 'cf-weight', arg: 'weight', kind: 'number', required: true, label: 'Infant weight' },
      { dom: 'cf-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: CC.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'cf-level', arg: 'level', kind: 'number', required: false, label: 'Serum caffeine level (optional)', unit: 'mg/L' },
    ],
  },
];
