// spec-v394 MCP wave: adapter for the Borrmann classification of advanced gastric cancer in
// lib/borrmann-gastric-v394.js. The dom key mirrors the browser renderer (views/group-v394.js) and
// META['borrmann-gastric'].example. `type` is an enum (I/II/III/IV). The compute reports the type and its
// gross-appearance description. The example sets type IV; its expected text is the type description (a
// roman numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/borrmann-gastric-v394.js';

export default [
  {
    id: 'borrmann-gastric',
    summary: 'Borrmann classification (Borrmann 1926) of ADVANCED gastric cancer (types I-IV), by the gross (macroscopic) tumor appearance - complements the Lauren histological typing. I: polypoid - a protruding mass, clearly demarcated from the surrounding mucosa, without ulceration. II: fungating / ulcerated - an ulcerated mass with sharply raised, well-demarcated margins. III: ulcerated and infiltrative - an ulcer with raised but partly infiltrative, ill-defined margins. IV: diffusely infiltrative (linitis plastica) - diffuse infiltration with no obvious mass or ulcer and no clear margins; classically the worst prognosis. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.borrmannGastric,
    fields: [
      { dom: 'borrmann-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Borrmann type' },
    ],
  },
];
