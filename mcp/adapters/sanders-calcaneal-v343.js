// spec-v343 MCP wave: adapter for the Sanders classification of an intra-articular calcaneal fracture
// in lib/sanders-calcaneal-v343.js. The dom key mirrors the browser renderer (views/group-v343.js)
// and META['sanders-calcaneal'].example. `type` is an enum (I / II / III / IV). The compute reports
// the Sanders type and its CT-fragmentation description. The example sets type III; its expected text
// is the type description with no numeric facts (the part / fracture-line counts are spelled as
// words), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/sanders-calcaneal-v343.js';

export default [
  {
    id: 'sanders-calcaneal',
    summary: 'Sanders classification (Sanders 1993) of an intra-articular calcaneal fracture — the CT-based grade of posterior-facet fragmentation of a fracture of the heel bone, on the coronal CT image at the widest undersurface of the posterior facet of the talus. I: nondisplaced (< 2 mm), regardless of the number of fracture lines. II: two-part (one fracture line) fracture of the posterior facet (subtypes IIA/IIB/IIC). III: three-part (two fracture lines) with a centrally depressed middle fragment (subtypes IIIAB/IIIAC/IIIBC). IV: four or more parts (three or more fracture lines), highly comminuted. Higher types are more comminuted and classically carry a worse prognosis. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sandersCalcaneal,
    fields: [
      { dom: 'sanders-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Sanders type' },
    ],
  },
];
