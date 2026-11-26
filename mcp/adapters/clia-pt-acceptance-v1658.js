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
      // spec-v1794: both declared `bound: 'hcg'` -- the serum hCG envelope, 0 to 10,000,000, as a stand-in for
      // "some analyte, some unit". Its floor of 0 is wrong for a proficiency-testing panel: the library reads
      // these from -1,000,000 deliberately, because a base excess and an anion gap are reported negative.
      { dom: 'clia-target', arg: 'target', kind: 'number', required: true, label: 'Program\'s target value', min: -1e6, max: 1e7 },
      { dom: 'clia-response', arg: 'response', kind: 'number', required: true, label: 'Laboratory\'s response', min: -1e6, max: 1e7 },
      { dom: 'clia-sd', arg: 'sd', kind: 'number', required: false, label: 'Program\'s SD (white cell differential only)' },
      { dom: 'clia-decision', arg: 'decisionLevel', kind: 'number', required: false, label: 'Decision level, for the limit as a percent (optional)' },
    ]
  },
];
