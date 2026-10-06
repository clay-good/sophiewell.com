// spec-v1561 MCP adapter: leprosy-reaction-prednisolone in lib/leprosy-reaction-prednisolone-v1561.js.
// The dom keys mirror views/group-v1561.js and META['leprosy-reaction-prednisolone'].example. Clinical domain.

import * as M from '../../lib/leprosy-reaction-prednisolone-v1561.js';

export default [
  {
    id: 'leprosy-reaction-prednisolone',
    summary: 'Gives the WHO 2020 20-week prednisolone taper for a type 1 leprosy reaction or neuritis: the 40 or 30 mg track from Table 3, the dose for a given week, and albendazole first.',
    compute: M.leprosyReactionPrednisolone,
    fields: [
      { dom: 'lr-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 5, max: 250 },
      { dom: 'lr-track', arg: 'track', kind: 'enum', label: 'Starting dose (optional)', values: M.TRACK_OPTIONS.map((d) => d.value) },
      { dom: 'lr-week', arg: 'week', kind: 'number', label: 'Week of treatment now (optional)', min: 1, max: 20 },
    ],
  },
];
