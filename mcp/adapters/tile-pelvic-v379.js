// spec-v379 MCP wave: adapter for the Tile (AO/Tile) classification of a pelvic ring injury in
// lib/tile-pelvic-v379.js. The dom key mirrors the browser renderer (views/group-v379.js) and
// META['tile-pelvic'].example. `type` is an enum (A/B/C). The compute reports the type and its stability
// description. The example sets type C; its expected text is the type description (a letter, no numeric
// facts to round-trip), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/tile-pelvic-v379.js';

export default [
  {
    id: 'tile-pelvic',
    summary: 'Tile (AO/Tile) classification (Tile 1996) of a PELVIC RING injury (types A/B/C), by the mechanical stability of the posterior pelvic ring - the standard grouping that stratifies pelvic-ring instability (and, with it, mortality). A: stable; the posterior ring is intact (e.g. avulsion, iliac-wing, or transverse sacrococcygeal fracture). B: rotationally unstable but vertically stable; the posterior ring is incompletely disrupted (e.g. open-book / anteroposterior-compression, or lateral-compression). C: rotationally and vertically unstable; the posterior ring is completely disrupted. Instability, and reported mortality, rise A to C. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.tilePelvic,
    fields: [
      { dom: 'tile-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C'], label: 'Tile type' },
    ],
  },
];
