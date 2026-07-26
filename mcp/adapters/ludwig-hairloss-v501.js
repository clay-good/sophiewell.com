// spec-v501 MCP wave: adapter for the Ludwig female-pattern-hair-loss scale in lib/ludwig-hairloss-v501.js.
// The dom key mirrors the browser renderer (views/group-v501.js) and META['ludwig-hairloss'].example. `grade`
// is an enum (I/II/III). The compute reports the grade and its crown-thinning description. The example sets
// grade II; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/ludwig-hairloss-v501.js';

export default [
  {
    id: 'ludwig-hairloss',
    summary: 'The Ludwig scale of female-pattern (androgenetic) hair loss, by the degree of central crown thinning with the frontal hairline preserved throughout, grades I / II / III. I: perceptible crown thinning behind a retained frontal fringe. II: pronounced thinning within that area. III: full baldness within that area. Reports the pattern grade the clinician has determined on examination, not a diagnosis of androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision.',
    compute: C.ludwigHairloss,
    fields: [
      { dom: 'ludwig-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III'], label: 'Ludwig grade' },
    ],
  },
];
