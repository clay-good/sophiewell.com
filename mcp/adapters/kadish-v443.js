// spec-v443 MCP wave: adapter for the Kadish staging in lib/kadish-v443.js. The dom key mirrors the browser
// renderer (views/group-v443.js) and META['kadish'].example. `stage` is an enum (A/B/C/D). The compute
// reports the stage and its anatomic-extent description. The example sets stage C; its expected text carries
// no numeric facts (the description is word-only), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/kadish-v443.js';

export default [
  {
    id: 'kadish',
    summary: 'The Kadish staging of esthesioneuroblastoma (olfactory neuroblastoma), by the anatomic extent of the tumor, stages A/B/C/D. A: confined to the nasal cavity. B: nasal cavity plus paranasal sinuses. C: beyond the sinuses (orbit, skull base, intracranial). D: metastasis to cervical nodes or distant sites (Morita modification). Reports the anatomic stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.kadish,
    fields: [
      { dom: 'kadish-stage', arg: 'stage', kind: 'enum', values: ['A', 'B', 'C', 'D'], label: 'Kadish stage' },
    ],
  },
];
