// spec-v502 MCP wave: adapter for the Norwood male-pattern-hair-loss scale in lib/norwood-hairloss-v502.js.
// The dom key mirrors the browser renderer (views/group-v502.js) and META['norwood-hairloss'].example.
// `stage` is an enum (I..VII plus 'III vertex'). The compute reports the stage and its recession / vertex
// description. The example sets stage IV; its expected text carries no numeric facts (the description is
// word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/norwood-hairloss-v502.js';

export default [
  {
    id: 'norwood-hairloss',
    summary: 'The Norwood (Hamilton-Norwood) scale of male-pattern (androgenetic) hair loss, by increasing frontotemporal recession and vertex loss, stages I-VII plus a distinct III vertex. I: no or minimal recession. II: triangular recession. III: the minimal balding extent. III vertex: crown-predominant loss. IV: recession and vertex loss separated by a band. V: the band narrows. VI: the areas are confluent. VII: only a horseshoe band remains. Reports the pattern stage the clinician has determined on examination, not a diagnosis of androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision.',
    compute: C.norwoodHairloss,
    fields: [
      { dom: 'norwood-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'III vertex', 'IV', 'V', 'VI', 'VII'], label: 'Norwood stage' },
    ],
  },
];
