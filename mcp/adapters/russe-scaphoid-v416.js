// spec-v416 MCP wave: adapter for the Russe classification of scaphoid fractures in
// lib/russe-scaphoid-v416.js. The dom key mirrors the browser renderer (views/group-v416.js) and
// META['russe-scaphoid'].example. `type` is an enum (horizontal oblique / transverse / vertical oblique).
// The compute reports the orientation and its stability description. The example sets type transverse; its
// expected text carries no numeric facts (the descriptions are word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/russe-scaphoid-v416.js';

export default [
  {
    id: 'russe-scaphoid',
    summary: 'Russe classification of scaphoid (carpal navicular) fractures by the orientation of the fracture line relative to the scaphoid long axis - horizontal oblique / transverse / vertical oblique - which sets whether compressive or shear forces predominate. Horizontal oblique: compressive forces predominate (most stable). Transverse: both compressive and shear (intermediate). Vertical oblique: shear predominates (least stable). Reports the orientation, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.russeScaphoid,
    fields: [
      { dom: 'ru-type', arg: 'type', kind: 'enum', values: ['horizontal oblique', 'transverse', 'vertical oblique'], label: 'Russe orientation' },
    ],
  },
];
