// spec-v410 MCP wave: adapter for the Anderson-D'Alonzo classification of odontoid fractures in
// lib/anderson-dalonzo-v410.js. The dom key mirrors the browser renderer (views/group-v410.js) and
// META['anderson-dalonzo'].example. `type` is an enum (I/II/III). The compute reports the type and its
// level description. The example sets type II; its expected text's only digits are the "C2" level label
// that the result echoes verbatim, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/anderson-dalonzo-v410.js';

export default [
  {
    id: 'anderson-dalonzo',
    summary: 'Anderson-D\'Alonzo classification of an odontoid (dens) fracture of C2, types I/II/III, by the level of the fracture line. I: an oblique fracture through the tip of the odontoid, above the transverse ligament (rare, usually stable). II: a fracture through the base (neck) of the odontoid at its junction with the C2 body (the most common type, the most prone to non-union). III: a fracture extending into the cancellous body of C2 (usually heals with immobilization). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.andersonDalonzo,
    fields: [
      { dom: 'ad-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Anderson-D\'Alonzo type' },
    ],
  },
];
