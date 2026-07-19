// spec-v481 MCP wave: adapter for the Wiltse spondylolisthesis classification in
// lib/wiltse-spondylolisthesis-v481.js. The dom key mirrors the browser renderer (views/group-v481.js) and
// META['wiltse-spondylolisthesis'].example. `type` is an enum (I..V). The compute reports the type and its
// etiology description. The example sets type II; its expected text carries no numeric facts (the description
// is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/wiltse-spondylolisthesis-v481.js';

export default [
  {
    id: 'wiltse-spondylolisthesis',
    summary: 'The Wiltse-Newman-Macnab classification of spondylolisthesis, by etiology, types I/II/III/IV/V. I: dysplastic (congenital). II: isthmic (pars lesion; IIA lytic, IIB elongated, IIC acute fracture). III: degenerative. IV: traumatic. V: pathologic. Complements the Meyerding slip grade. Reports the etiologic type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.wiltseSpondylolisthesis,
    fields: [
      { dom: 'wiltse-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Wiltse type' },
    ],
  },
];
