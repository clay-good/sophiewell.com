// spec-v417 MCP wave: adapter for the Wassel classification of thumb polydactyly in
// lib/wassel-thumb-v417.js. The dom key mirrors the browser renderer (views/group-v417.js) and
// META['wassel-thumb'].example. `type` is an enum (I..VII). The compute reports the type and its
// duplication-level description. The example sets type IV; its expected text carries no numeric facts (the
// description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/wassel-thumb-v417.js';

export default [
  {
    id: 'wassel-thumb',
    summary: 'Wassel classification of thumb polydactyly (radial / preaxial thumb duplication) by the most proximal level of skeletal duplication, types I-VII. Odd numerals are a bifid bone (shared base); even numerals are a complete duplication; the numbers ascend proximally. I: bifid distal phalanx. II: duplicated distal phalanx. III: bifid proximal phalanx. IV: duplicated proximal phalanx (most common). V: bifid metacarpal. VI: duplicated metacarpal. VII: triphalangeal thumb. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.wasselThumb,
    fields: [
      { dom: 'wa-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'], label: 'Wassel type' },
    ],
  },
];
