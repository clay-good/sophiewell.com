// spec-v442 MCP wave: adapter for the Zabramski CCM classification in lib/zabramski-v442.js. The dom key
// mirrors the browser renderer (views/group-v442.js) and META['zabramski'].example. `type` is an enum
// (I..IV). The compute reports the type and its MRI description. The example sets type II; its expected text
// carries no numeric facts (the description is word-only), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/zabramski-v442.js';

export default [
  {
    id: 'zabramski',
    summary: 'The Zabramski classification of a cerebral cavernous malformation (CCM), by its MRI appearance (hemorrhage age and signal), types I/II/III/IV. I: subacute hemorrhage (hyperintense on T1/T2). II: classic popcorn/mulberry with a hemosiderin rim. III: chronic hemorrhage (iso- to hypointense). IV: punctate microhemorrhages seen only on GRE/SWI. Reports the imaging type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.zabramski,
    fields: [
      { dom: 'zabramski-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Zabramski type' },
    ],
  },
];
