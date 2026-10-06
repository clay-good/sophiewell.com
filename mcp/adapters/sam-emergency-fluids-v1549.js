// spec-v1549 MCP adapter: sam-emergency-fluids in lib/sam-emergency-fluids-v1549.js.
// The dom keys mirror views/group-v1549.js and META['sam-emergency-fluids'].example. Clinical domain.

import * as M from '../../lib/sam-emergency-fluids-v1549.js';

export default [
  {
    id: 'sam-emergency-fluids',
    summary: 'Gives the WHO volumes for a severely malnourished child in an emergency. ReSoMal for dehydration (standard ORS in cholera), the 15 mL/kg shock infusion with its stop signs, and oral or IV glucose for low blood sugar.',
    compute: M.samEmergencyFluids,
    fields: [
      { dom: 'se-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 40 },
      { dom: 'se-scenario', arg: 'scenario', kind: 'enum', required: true, label: 'Emergency', values: M.SCENARIO_OPTIONS.map((d) => d.value) },
      { dom: 'se-profuse', arg: 'profuse', kind: 'enum', label: 'Profuse watery diarrhea or suspected cholera (dehydration)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'se-conscious', arg: 'conscious', kind: 'enum', label: 'Consciousness (low blood sugar)', values: M.CONSCIOUS_OPTIONS.map((d) => d.value) },
    ],
  },
];
