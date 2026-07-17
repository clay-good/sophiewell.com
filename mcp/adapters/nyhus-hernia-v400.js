// spec-v400 MCP wave: adapter for the Nyhus classification of groin hernias in lib/nyhus-hernia-v400.js.
// The dom key mirrors the browser renderer (views/group-v400.js) and META['nyhus-hernia'].example. `type`
// is an enum (I/II/IIIa/IIIb/IIIc/IVa/IVb/IVc/IVd). The compute reports the type and its anatomic
// description. The example sets type IIIa; its expected text is the type description (a roman numeral, no
// free numeric facts to round-trip), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/nyhus-hernia-v400.js';

export default [
  {
    id: 'nyhus-hernia',
    summary: 'Nyhus classification of a groin (inguinal / femoral) hernia, by the anatomy of the defect - types I/II/IIIa/IIIb/IIIc/IVa/IVb/IVc/IVd. I: indirect with a normal internal ring, posterior wall intact. II: indirect with a dilated internal ring, posterior wall intact. IIIa: direct (a posterior-wall / transversalis-fascia defect). IIIb: large indirect encroaching on the posterior wall (sliding / pantaloon). IIIc: femoral. IVa-d: recurrent (a direct, b indirect, c femoral, d combined). Reports the type, not a diagnosis, a repair recommendation, or a prognosis.',
    compute: C.nyhusHernia,
    fields: [
      { dom: 'nyhus-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'IIIa', 'IIIb', 'IIIc', 'IVa', 'IVb', 'IVc', 'IVd'], label: 'Nyhus type' },
    ],
  },
];
