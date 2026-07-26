// spec-v447 MCP wave: adapter for the Anderson-Montesano classification in lib/anderson-montesano-v447.js.
// The dom key mirrors the browser renderer (views/group-v447.js) and META['anderson-montesano'].example.
// `type` is an enum (I/II/III). The compute reports the type and its morphology description. The example sets
// type III; its expected text carries no numeric facts (the description is word-only), so it flows through
// the default makeToArgs with no custom toArgs.

import * as C from '../../lib/anderson-montesano-v447.js';

export default [
  {
    id: 'anderson-montesano',
    summary: 'The Anderson-Montesano classification of occipital condyle fractures, by fracture morphology and mechanism, types I/II/III. I: impacted/comminuted from axial loading (typically stable). II: extending from a basioccipital / skull-base fracture (usually stable). III: alar-ligament avulsion (potentially unstable). Reports the imaging type, not a diagnosis, a stability determination, a treatment decision, or a prognosis.',
    compute: C.andersonMontesano,
    fields: [
      { dom: 'am-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Anderson-Montesano type' },
    ],
  },
];
