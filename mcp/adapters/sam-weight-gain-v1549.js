// spec-v1549 MCP adapter: sam-weight-gain in lib/sam-weight-gain-v1549.js.
// The dom keys mirror views/group-v1549.js and META['sam-weight-gain'].example. Clinical domain.

import * as M from '../../lib/sam-weight-gain-v1549.js';

export default [
  {
    id: 'sam-weight-gain',
    summary: 'Gives daily weight gain in g/kg/day during severe malnutrition treatment. Graded good at 10 or more, moderate at 5 up to 10, poor under 5, and not graded during stabilization.',
    compute: M.samWeightGain,
    fields: [
      { dom: 'swg-prev', arg: 'previous', kind: 'number', required: true, label: 'Previous weight in kg', min: 1, max: 40 },
      { dom: 'swg-cur', arg: 'current', kind: 'number', required: true, label: 'Current weight in kg', min: 1, max: 40 },
      { dom: 'swg-days', arg: 'days', kind: 'number', required: true, label: 'Days between the weights', min: 1, max: 60 },
      { dom: 'swg-phase', arg: 'phase', kind: 'enum', required: true, label: 'Phase', values: M.PHASE_OPTIONS.map((d) => d.value) },
    ],
  },
];
