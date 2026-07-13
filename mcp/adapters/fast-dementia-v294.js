// spec-v294 MCP wave: adapter for the FAST dementia staging tile in
// lib/fast-dementia-v294.js. The single dom key mirrors the browser renderer
// (views/group-v294.js) and META['fast-dementia'].example.fields. `stage` is a
// required enum over the 16 FAST stage codes; the compute returns the verbatim
// functional descriptor and, for stage 7a and beyond, the Medicare dementia
// hospice-eligibility context. The `band` carries the "FAST stage 7a" example
// text, so it round-trips through the default makeToArgs with no custom toArgs.

import * as F from '../../lib/fast-dementia-v294.js';

export default [
  {
    id: 'fast-dementia',
    summary: 'FAST (Functional Assessment Staging Tool) for dementia: given the highest consecutive stage reached (1-5, 6a-6e, 7a-7f), reports the published functional descriptor and, at stage 7a and beyond, the Medicare dementia hospice-eligibility context (FAST 7a+ with a named complication). Reports the guideline descriptor and hospice context, not a diagnosis or an eligibility determination.',
    compute: F.fastStage,
    fields: [
      { dom: 'fast-stage', arg: 'stage', kind: 'enum', required: true, values: ['1', '2', '3', '4', '5', '6a', '6b', '6c', '6d', '6e', '7a', '7b', '7c', '7d', '7e', '7f'], label: 'Highest FAST stage reached' },
    ],
  },
];
