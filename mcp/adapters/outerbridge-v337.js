// spec-v337 MCP wave: adapter for the Outerbridge cartilage classification in
// lib/outerbridge-v337.js. The dom key mirrors the browser renderer (views/group-v337.js) and
// META['outerbridge-cartilage'].example. `grade` is an enum (0 / I / II / III / IV). The compute
// reports the cartilage grade and its description. The example sets grade IV; its expected text is
// the grade description (no numeric facts — the 1.5 cm threshold appears only in grades II/III), so
// it round-trips through the default makeToArgs with no custom toArgs.

import * as O from '../../lib/outerbridge-v337.js';

export default [
  {
    id: 'outerbridge-cartilage',
    summary: 'Outerbridge classification (Outerbridge 1961) of articular cartilage damage graded at arthroscopy. 0: normal. I: softening/swelling (surface intact). II: partial-thickness fissures not reaching subchondral bone and <=1.5 cm in diameter. III: fissuring to subchondral bone in an area >1.5 cm. IV: cartilage worn through to exposed subchondral bone (full-thickness loss). The original II/III split is by lesion diameter (1.5 cm); a modified version splits by depth. Complements the Kellgren-Lawrence radiographic osteoarthritis grade. Reports the cartilage grade, not a diagnosis, a surgical recommendation, or an outcome prediction.',
    compute: O.outerbridge,
    fields: [
      { dom: 'outer-grade', arg: 'grade', kind: 'enum', values: ['0', 'I', 'II', 'III', 'IV'], label: 'Outerbridge grade' },
    ],
  },
];
