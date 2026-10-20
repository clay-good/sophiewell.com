// spec-v1657 MCP adapter: staffing-grid in lib/staffing-grid-v1657.js. The dom keys mirror views/group-v1657.js and
// META['staffing-grid'].example.

import * as GRID from '../../lib/staffing-grid-v1657.js';

export default [
  {
    id: 'staffing-grid',
    summary: 'A shift staffing grid: staff per shift at each census from a target HPPD and shift length. Counts are rounded up, RNs are at a chosen share, and a state minimum ratio is the floor.',
    compute: GRID.staffingGrid,
    fields: [
      { dom: 'sg-hppd', arg: 'targetHppd', kind: 'number', required: true, label: 'Target HPPD' },
      { dom: 'sg-shift', arg: 'shiftHours', kind: 'number', required: true, label: 'Shift length (hours)' },
      { dom: 'sg-from', arg: 'censusFrom', kind: 'number', required: true, label: 'Lowest census' },
      { dom: 'sg-to', arg: 'censusTo', kind: 'number', required: true, label: 'Highest census' },
      { dom: 'sg-step', arg: 'step', kind: 'number', required: false, label: 'Census step (default 1)' },
      { dom: 'sg-rn-share', arg: 'rnShare', kind: 'number', required: false, label: 'RN share of staff (%)' },
    ]
  },
];
