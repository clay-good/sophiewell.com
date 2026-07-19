// spec-v453 MCP wave: adapter for the Schatzker tibial plateau fracture classification in
// lib/schatzker-v453.js. The dom key mirrors the browser renderer (views/group-v453.js) and
// META['schatzker'].example. `type` is an enum (I..VI). The compute reports the type and its fracture-pattern
// description. The example sets type II; its expected text carries no numeric facts (the description is
// word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/schatzker-v453.js';

export default [
  {
    id: 'schatzker',
    summary: 'The Schatzker classification of tibial plateau fractures, by fracture pattern and location, types I/II/III/IV/V/VI. I: lateral split. II: lateral split-depression. III: lateral pure depression. IV: medial plateau. V: bicondylar. VI: plateau fracture with metaphyseal-diaphyseal dissociation. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.schatzker,
    fields: [
      { dom: 'schatzker-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Schatzker type' },
    ],
  },
];
