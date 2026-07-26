// spec-v487 MCP wave: adapter for the Rockwood acromioclavicular joint injury classification in
// lib/rockwood-ac-v487.js. The dom key mirrors the browser renderer (views/group-v487.js) and
// META['rockwood-ac'].example. `type` is an enum (I..VI). The compute reports the type and its
// ligament-injury / displacement description. The example sets type III; its expected text carries the
// "25% to 100%" fact, so the default makeToArgs flows through with no custom toArgs.

import * as C from '../../lib/rockwood-ac-v487.js';

export default [
  {
    id: 'rockwood-ac',
    summary: 'The Rockwood classification of acromioclavicular (AC) joint injuries, by AC and coracoclavicular (CC) ligament integrity and clavicular displacement, types I/II/III/IV/V/VI. I: AC sprain, ligaments intact. II: AC torn, CC intact, slight widening. III: both torn, CC distance 25-100% increased. IV: posterior displacement. V: gross superior displacement (CC 100-300%). VI: inferior displacement. Reports the injury type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.rockwoodAc,
    fields: [
      { dom: 'rockwood-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Rockwood type' },
    ],
  },
];
