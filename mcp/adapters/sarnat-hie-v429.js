// spec-v429 MCP wave: adapter for the Sarnat staging of neonatal HIE in lib/sarnat-hie-v429.js. The dom key
// mirrors the browser renderer (views/group-v429.js) and META['sarnat-hie'].example. `stage` is an enum
// (1/2/3). The compute reports the stage and its clinical features. The example sets stage 2; its expected
// text carries no numeric facts beyond the stage label (the features are word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/sarnat-hie-v429.js';

export default [
  {
    id: 'sarnat-hie',
    summary: 'The Sarnat staging of neonatal hypoxic-ischemic encephalopathy (HIE), the clinical grading of a term newborn after a hypoxic-ischemic insult, stages 1/2/3. 1 (mild): hyperalert, no seizures, resolves within 24 hours. 2 (moderate): lethargic or obtunded, hypotonia, seizures common. 3 (severe): stupor or coma, flaccid tone, suppressed or isoelectric EEG. Reports the clinical stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sarnatHie,
    fields: [
      { dom: 'sarnat-stage', arg: 'stage', kind: 'enum', values: ['1', '2', '3'], label: 'Sarnat stage' },
    ],
  },
];
