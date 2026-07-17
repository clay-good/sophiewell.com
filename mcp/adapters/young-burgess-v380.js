// spec-v380 MCP wave: adapter for the Young-Burgess classification of a pelvic ring injury in
// lib/young-burgess-v380.js. The dom key mirrors the browser renderer (views/group-v380.js) and
// META['young-burgess'].example. `pattern` is an enum (LC-I..LC-III, APC-I..APC-III, VS, CM). The
// compute reports the pattern and its mechanism/stability description. The example sets APC-III; its
// expected text is the pattern description (roman numerals in the label, no free numeric facts to
// round-trip), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/young-burgess-v380.js';

export default [
  {
    id: 'young-burgess',
    summary: 'Young-Burgess classification (Young 1986) of a PELVIC RING injury - a mechanism-based grouping by the force vector. LC (lateral compression) I-III: ipsilateral sacral compression (I) -> crescent / posterior iliac-wing fracture (II) -> "windswept" bilateral pelvis (III). APC (anteroposterior compression) I-III: symphysis widening under 2.5 cm with anterior SI intact (I) -> open-book, anterior SI disrupted, rotationally unstable (II) -> complete SI disruption, rotationally and vertically unstable (III). VS: vertical shear (superior/posterior hemipelvis migration). CM: combined mechanism. Lateral-compression patterns are the most common and often stable; APC-II/III, LC-III, VS, and CM are the typically-unstable patterns. Companion to the Tile stability-based grouping. Reports the pattern, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.youngBurgess,
    fields: [
      { dom: 'yb-pattern', arg: 'pattern', kind: 'enum', values: ['LC-I', 'LC-II', 'LC-III', 'APC-I', 'APC-II', 'APC-III', 'VS', 'CM'], label: 'Young-Burgess pattern' },
    ],
  },
];
