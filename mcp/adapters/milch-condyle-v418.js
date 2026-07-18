// spec-v418 MCP wave: adapter for the Milch classification of lateral humeral condyle fractures in
// lib/milch-condyle-v418.js. The dom key mirrors the browser renderer (views/group-v418.js) and
// META['milch-condyle'].example. `type` is an enum (I/II). The compute reports the type and its
// groove/stability description. The example sets type I; its expected text carries no numeric facts (the
// description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/milch-condyle-v418.js';

export default [
  {
    id: 'milch-condyle',
    summary: 'Milch classification of lateral humeral condyle fractures (a common pediatric elbow injury), types I and II, by whether the fracture line reaches the trochlear groove and involves the lateral trochlear ridge. I: lateral to the trochlear groove, the lateral trochlear ridge intact (the elbow stays stable). II: into the trochlear groove, the lateral trochlear ridge involved (the elbow becomes unstable, the forearm can translate laterally). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.milchCondyle,
    fields: [
      { dom: 'mi-type', arg: 'type', kind: 'enum', values: ['I', 'II'], label: 'Milch type' },
    ],
  },
];
