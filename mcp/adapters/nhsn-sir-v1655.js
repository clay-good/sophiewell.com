// spec-v1655 MCP adapter: nhsn-sir in lib/nhsn-sir-v1655.js. The dom keys mirror views/group-v1655.js and
// META['nhsn-sir'].example.

import * as SIR from '../../lib/nhsn-sir-v1655.js';

export default [
  {
    id: 'nhsn-sir',
    summary: 'The NHSN standardized infection ratio: observed infections divided by the predicted count from the facility\'s NHSN report. No ratio when fewer than 1.0 infections are predicted, as the NHSN SIR guide (March 2024) says.',
    compute: SIR.nhsnSir,
    fields: [
      { dom: 'sir-observed', arg: 'observed', kind: 'number', required: true, label: 'Observed infections (whole number)' },
      { dom: 'sir-predicted', arg: 'predicted', kind: 'number', required: true, label: 'Predicted infections (from the NHSN report)' },
    ]
  },
];
