// spec-v1659 MCP adapter: smr in lib/smr-v1659.js. The dom keys mirror views/group-v1659.js and
// META['smr'].example.

import * as SMR from '../../lib/smr-v1659.js';

export default [
  {
    id: 'smr',
    summary: 'Standardized mortality or incidence ratio: observed events over the expected count, with an exact 95% interval. The expected count can be entered or summed from strata of person-time and reference rates.',
    compute: SMR.smr,
    fields: [
      { dom: 'smr-observed', arg: 'observed', kind: 'number', required: true, label: 'Observed events' },
      { dom: 'smr-expected', arg: 'expected', kind: 'number', required: false, label: 'Expected events (or enter strata below)' },
      { dom: 'smr-strata', arg: 'strata', kind: 'string', required: false, label: 'Strata, one per line: person-time, reference rate' },
    ]
  },
];
