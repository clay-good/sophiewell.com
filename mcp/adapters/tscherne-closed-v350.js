// spec-v350 MCP wave: adapter for the Oestern-Tscherne closed-fracture soft-tissue classification in
// lib/tscherne-closed-v350.js. The dom key mirrors the browser renderer (views/group-v350.js) and
// META['tscherne-closed'].example. `grade` is an enum (0 / I / II / III, i.e. C0-C3). The compute
// reports the Tscherne grade and its soft-tissue description. The example sets grade II; its expected
// text is the grade description with no numeric facts (the grade is a roman numeral / C-label), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/tscherne-closed-v350.js';

export default [
  {
    id: 'tscherne-closed',
    summary: 'Oestern-Tscherne classification (Tscherne & Oestern 1982) of the soft-tissue injury of a CLOSED fracture (grades 0-III, i.e. C0-C3) — the closed-fracture counterpart to the Gustilo-Anderson open-fracture classification. 0/C0: little or no soft-tissue injury; indirect (low-energy) trauma; a simple fracture. I/C1: superficial abrasion or skin contusion from fragment pressure; a mild to moderate fracture. II/C2: deep, contaminated abrasion with local skin or muscle contusion from direct trauma; an impending compartment syndrome belongs here. III/C3: extensive skin contusion or crush, severe muscle damage, subcutaneous degloving, an overt compartment syndrome, or an associated major vascular injury. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.tscherneClosed,
    fields: [
      { dom: 'tscherne-grade', arg: 'grade', kind: 'enum', values: ['0', 'I', 'II', 'III'], label: 'Tscherne grade' },
    ],
  },
];
