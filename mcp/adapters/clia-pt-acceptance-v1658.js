// spec-v1658 MCP adapter: clia-pt-acceptance in lib/clia-pt-acceptance-v1658.js. The dom keys mirror views/group-v1658.js and
// META['clia-pt-acceptance'].example.

import * as CLIA from '../../lib/clia-pt-acceptance-v1658.js';

export default [
  {
    id: 'clia-pt-acceptance',
    summary: 'Whether a proficiency-testing result is within the CLIA limit for routine chemistry or hematology (42 CFR 493.931, 493.941). Also gives the limit as a percent at a decision level, for the sigma metric.',
    compute: CLIA.cliaPtAcceptance,
    fields: [
      { dom: 'clia-analyte', arg: 'analyte', kind: 'enum', values: CLIA.ANALYTES.map((a) => a[0]), required: true, label: 'Analyte' },
      { dom: 'clia-target', arg: 'target', kind: 'number', required: true, label: 'Program\'s target value' },
      { dom: 'clia-response', arg: 'response', kind: 'number', required: true, label: 'Laboratory\'s response' },
      { dom: 'clia-sd', arg: 'sd', kind: 'number', required: false, label: 'Program\'s SD (white cell differential only)' },
      { dom: 'clia-decision', arg: 'decisionLevel', kind: 'number', required: false, label: 'Decision level, for the limit as a percent (optional)' },
    ]
  },
];
