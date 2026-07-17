// spec-v376 MCP wave: adapter for the Denis classification of a sacral fracture in
// lib/denis-sacral-v376.js. The dom key mirrors the browser renderer (views/group-v376.js) and
// META['denis-sacral'].example. `zone` is an enum (I/II/III). The compute reports the Denis zone and its
// description. The example sets zone III; its expected text is the zone description (a roman numeral, no
// numeric facts to round-trip), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/denis-sacral-v376.js';

export default [
  {
    id: 'denis-sacral',
    summary: 'Denis classification (Denis 1988) of a sacral fracture (zones I-III), by the relationship of the fracture line to the sacral foramina and central canal - the standard anatomic zoning that predicts neurologic-injury risk. I: the alar region, lateral to the foramina; the lowest neurologic-injury rate (about 6%, usually L5 or the sciatic nerve). II: through the foramina; an intermediate rate (about 28%, usually L5/S1/S2 radiculopathy). III: the central sacral canal, medial to the foramina; the highest rate, including bowel, bladder, and sexual dysfunction from cauda-equina involvement. Neurologic-injury risk rises I to III. Reports the zone, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.denisSacral,
    fields: [
      { dom: 'denis-zone', arg: 'zone', kind: 'enum', values: ['I', 'II', 'III'], label: 'Denis zone' },
    ],
  },
];
