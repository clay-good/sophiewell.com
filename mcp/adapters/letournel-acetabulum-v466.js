// spec-v466 MCP wave: adapter for the Judet-Letournel acetabular fracture classification in
// lib/letournel-acetabulum-v466.js. The dom key mirrors the browser renderer (views/group-v466.js) and
// META['letournel-acetabulum'].example. `pattern` is an enum of the ten pattern slugs. The compute reports the
// pattern, its group (elementary/associated), and its description. The example sets `transverse`; its expected
// text carries no numeric facts (the description is word-only), so it flows through the default makeToArgs with
// no custom toArgs.

import * as C from '../../lib/letournel-acetabulum-v466.js';

export default [
  {
    id: 'letournel-acetabulum',
    summary: 'The Judet-Letournel classification of acetabular fractures: five elementary patterns (posterior wall, posterior column, anterior wall, anterior column, transverse) and five associated patterns (posterior column + posterior wall, transverse + posterior wall, T-shaped, anterior column + posterior hemitransverse, both-column). Reports the fracture pattern, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.letournelAcetabulum,
    fields: [
      { dom: 'letournel-pattern', arg: 'pattern', kind: 'enum',
        values: ['posterior-wall', 'posterior-column', 'anterior-wall', 'anterior-column', 'transverse', 'pc-pw', 'transverse-pw', 't-shaped', 'ac-pht', 'both-column'],
        label: 'Judet-Letournel pattern' },
    ],
  },
];
