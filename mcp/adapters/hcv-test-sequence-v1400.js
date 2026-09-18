// spec-v1400: MCP adapter. The dom keys mirror views/group-v1400.js and this tile's META example.

import * as HC from '../../lib/hcv-test-sequence-v1400.js';

export default [
  {
    id: 'hcv-test-sequence',
    summary: 'Hepatitis C testing sequence (CDC): a reactive antibody is not a diagnosis until HCV RNA shows whether infection is current. Antibody nonreactive: no HCV antibody detected, unless there was a possible exposure in the past 6 months, when RNA testing is how an early infection is found. Antibody reactive with RNA detected: current infection. Antibody reactive with RNA not detected: no current infection, either a resolved past infection or a false-positive antibody. Antibody reactive with RNA not done: RNA is needed, because a reactive antibody alone is never a diagnosis and many people with antibody have cleared the virus.',
    compute: HC.hcvTestSequence,
    fields: [
      { dom: 'hcv-antibody', arg: 'antibody', kind: 'enum', required: true, label: 'HCV antibody', values: HC.ANTIBODY.map((a) => a.value) },
      { dom: 'hcv-rna', arg: 'rna', kind: 'enum', required: true, label: 'HCV RNA', values: HC.RNA.map((a) => a.value) },
      { dom: 'hcv-recent', arg: 'recentExposure', kind: 'enum', required: true, label: 'Possible exposure in the past 6 months', values: ['yes', 'no'] },
    ],
  },
];
