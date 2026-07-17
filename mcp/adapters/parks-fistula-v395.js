// spec-v395 MCP wave: adapter for the Parks classification of an anal fistula in
// lib/parks-fistula-v395.js. The dom key mirrors the browser renderer (views/group-v395.js) and
// META['parks-fistula'].example. `type` is an enum (the four sphincter-relationship types). The compute
// reports the type and its description. The example sets transsphincteric; its expected text is the type
// description (no numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/parks-fistula-v395.js';

export default [
  {
    id: 'parks-fistula',
    summary: 'Parks classification (Parks 1976) of an anal fistula (fistula-in-ano), by the tract\'s relationship to the anal sphincter complex - guides surgical planning and the continence risk. intersphincteric: the tract penetrates the internal sphincter and runs in the intersphincteric plane, sparing the external sphincter (the most common type). transsphincteric: the tract passes through both the internal and external sphincters into the ischioanal fossa. suprasphincteric: the tract begins in the intersphincteric plane, extends above the puborectalis, then down through the ischioanal fossa (complex). extrasphincteric: the tract runs outside the external sphincter, through the levator ani into the rectum, bypassing the sphincter complex (complex). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.parksFistula,
    fields: [
      { dom: 'parks-type', arg: 'type', kind: 'enum', values: ['intersphincteric', 'transsphincteric', 'suprasphincteric', 'extrasphincteric'], label: 'Parks type' },
    ],
  },
];
