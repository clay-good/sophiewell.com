// spec-v1657 MCP adapter: staff-turnover-rate in lib/staff-turnover-rate-v1657.js. The dom keys mirror views/group-v1657.js and
// META['staff-turnover-rate'].example.

import * as TURN from '../../lib/staff-turnover-rate-v1657.js';

export default [
  {
    id: 'staff-turnover-rate',
    summary: 'Staff turnover and vacancy rates, and CMS\'s PBJ turnover: spells ended in a 90-day gap over eligible spells. Turnover over 100% is allowed and flagged.',
    compute: TURN.staffTurnoverRate,
    fields: [
      { dom: 'str-separations', arg: 'separations', kind: 'number', required: false, label: 'Separations in the period' },
      { dom: 'str-start', arg: 'startHeadcount', kind: 'number', required: false, label: 'Headcount at the start' },
      { dom: 'str-end', arg: 'endHeadcount', kind: 'number', required: false, label: 'Headcount at the end' },
      { dom: 'str-budgeted', arg: 'budgeted', kind: 'number', required: false, label: 'Budgeted positions' },
      { dom: 'str-filled', arg: 'filled', kind: 'number', required: false, label: 'Filled positions' },
      { dom: 'str-spells-ended', arg: 'spellsEnded', kind: 'number', required: false, label: 'CMS method: employment spells ended in a 90-day gap' },
      { dom: 'str-spells', arg: 'eligibleSpells', kind: 'number', required: false, label: 'CMS method: eligible employment spells' },
    ]
  },
];
