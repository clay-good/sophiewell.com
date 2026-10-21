// spec-v1658 MCP adapter: levey-jennings-limits in lib/levey-jennings-limits-v1658.js. The dom keys mirror views/group-v1658.js and
// META['levey-jennings-limits'].example.

import * as LJ from '../../lib/levey-jennings-limits-v1658.js';

export default [
  {
    id: 'levey-jennings-limits',
    summary: 'Levey-Jennings mean, SD, CV and control limits at 1, 2 and 3 SD from a series of control results. Results beyond 2 SD are named.',
    compute: LJ.leveyJenningsLimits,
    fields: [
      { dom: 'lj-results', arg: 'results', kind: 'string', required: true, label: 'Control results, one per line (a date or run label and a comma first is allowed)' },
      { dom: 'lj-min', arg: 'minimumCount', kind: 'number', required: false, label: 'The laboratory\'s minimum count for setting limits (optional)' },
    ]
  },
];
