// spec-v396 MCP wave: adapter for the Sievers classification of a bicuspid aortic valve in
// lib/sievers-bav-v396.js. The dom key mirrors the browser renderer (views/group-v396.js) and
// META['sievers-bav'].example. `type` is an enum (0/1/2). The compute reports the type and its raphe
// description. The example sets type 1; its expected text is the type description (a small integer echoed
// in the result), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/sievers-bav-v396.js';

export default [
  {
    id: 'sievers-bav',
    summary: 'Sievers classification (Sievers 2007) of a bicuspid aortic valve (types 0/1/2), by the number of raphes - used in echocardiography, CT, and aortic-valve repair / TAVR planning. 0: no raphe; two (usually symmetrical) leaflets and two commissures. 1: one raphe, formed by the fusion of two underdeveloped cusps; the most common type, sub-categorized by the fused sinuses (L-R, R-N, or N-L). 2: two raphes; the least common type. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sieversBav,
    fields: [
      { dom: 'sievers-type', arg: 'type', kind: 'enum', values: ['0', '1', '2'], label: 'Sievers type' },
    ],
  },
];
