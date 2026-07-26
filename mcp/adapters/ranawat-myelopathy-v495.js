// spec-v495 MCP wave: adapter for the Ranawat rheumatoid-cervical-myelopathy classification in
// lib/ranawat-myelopathy-v495.js. The dom key mirrors the browser renderer (views/group-v495.js) and
// META['ranawat-myelopathy'].example. `klass` is an enum (I/II/IIIA/IIIB - bare III is deliberately absent so
// the ambulation split stays explicit). The compute reports the class and its neurologic-deficit description.
// The example sets class IIIA; its expected text carries no numeric facts (the description is word-only), so
// it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/ranawat-myelopathy-v495.js';

export default [
  {
    id: 'ranawat-myelopathy',
    summary: 'The Ranawat classification of the neurologic deficit of the rheumatoid cervical spine, classes I / II / IIIA / IIIB. I: pain, no neural deficit. II: subjective weakness with dysesthesias and hyperreflexia. IIIA: objective weakness and long-tract signs, still ambulatory. IIIB: the same, no longer ambulatory. Reports the class the clinician has determined from the neurologic examination, not a diagnosis, a decision to operate, or a prognosis.',
    compute: C.ranawatMyelopathy,
    fields: [
      { dom: 'ranawat-class', arg: 'klass', kind: 'enum', values: ['I', 'II', 'IIIA', 'IIIB'], label: 'Ranawat class' },
    ],
  },
];
