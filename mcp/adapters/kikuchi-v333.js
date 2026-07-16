// spec-v333 MCP wave: adapter for the Kikuchi classification in lib/kikuchi-v333.js. The dom key
// mirrors the browser renderer (views/group-v333.js) and META['kikuchi-level'].example. `level` is
// an enum (Sm1 / Sm2 / Sm3). The compute reports the submucosal-invasion level and its description.
// The example sets level Sm3; its expected text is the level description whose only numeric fact
// (~25%) already appears verbatim in the compute's band string, so it round-trips through the
// default makeToArgs with no custom toArgs.

import * as K from '../../lib/kikuchi-v333.js';

export default [
  {
    id: 'kikuchi-level',
    summary: 'Kikuchi classification (Kikuchi 1995) of submucosal invasion in a sessile malignant colorectal lesion. Sm1: upper (superficial) third of the submucosa (~0-3% node metastasis, low risk). Sm2: middle third (~10%). Sm3: lower third, adjacent to the muscularis propria (~25%). Sm1 with favorable histology is often managed by endoscopic resection alone; Sm2 / Sm3 (deep invasion) carry a higher lymph-node-metastasis risk and generally prompt consideration of surgical resection. The sessile-lesion counterpart to the Haggitt classification. Reports the invasion level, not a diagnosis, a resection recommendation, or a metastasis prediction.',
    compute: K.kikuchi,
    fields: [
      { dom: 'kik-level', arg: 'level', kind: 'enum', values: ['Sm1', 'Sm2', 'Sm3'], label: 'Kikuchi level' },
    ],
  },
];
