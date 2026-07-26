// spec-v497 MCP wave: adapter for the Schobinger peripheral-AVM staging in lib/schobinger-avm-v497.js.
// The dom key mirrors the browser renderer (views/group-v497.js) and META['schobinger-avm'].example. `stage`
// is an enum (I/II/III/IV). The compute reports the stage and its clinical description; the staging is
// cumulative, so each band names the stage below it. The example sets stage II; its expected text carries no
// numeric facts (the description is word-only), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/schobinger-avm-v497.js';

export default [
  {
    id: 'schobinger-avm',
    summary: 'The Schobinger clinical staging of a peripheral (extracranial) arteriovenous malformation, stages I-IV. The staging is cumulative - each stage carries the findings of the one below it. I: quiescence, a warm pink-bluish stain with arteriovenous shunting on Doppler. II: expansion, with enlargement, pulsation, thrill, and bruit. III: destruction, with dystrophic skin changes, ulceration, bleeding, pain, or necrosis. IV: decompensation, with high-output cardiac failure. Reports the clinical stage, not a diagnosis, an indication for embolization or resection, or a prognosis. For an intracranial AVM see spetzler-martin.',
    compute: C.schobingerAvm,
    fields: [
      { dom: 'schobinger-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Schobinger stage' },
    ],
  },
];
