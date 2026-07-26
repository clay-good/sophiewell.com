// spec-v461 MCP wave: adapter for the DeBakey aortic dissection classification in lib/debakey-v461.js. The dom
// key mirrors the browser renderer (views/group-v461.js) and META['debakey'].example. `type` is an enum
// (I/II/IIIa/IIIb). The compute reports the type and its origin/extent description. The example sets type I;
// its expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/debakey-v461.js';

export default [
  {
    id: 'debakey',
    summary: 'The DeBakey classification of aortic dissection, by the site of origin and the extent of the flap, types I/II/IIIa/IIIb. I: ascending aorta, extending through the arch into the descending (and often abdominal) aorta. II: confined to the ascending aorta. IIIa: descending thoracic aorta, limited above the diaphragm. IIIb: descending thoracic aorta, extending below the diaphragm. Reports the anatomic type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.debakey,
    fields: [
      { dom: 'debakey-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'IIIa', 'IIIb'], label: 'DeBakey type' },
    ],
  },
];
