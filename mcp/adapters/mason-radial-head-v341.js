// spec-v341 MCP wave: adapter for the Mason-Johnston radial head fracture classification in
// lib/mason-radial-head-v341.js. The dom key mirrors the browser renderer (views/group-v341.js) and
// META['mason-radial-head'].example. `type` is an enum (I / II / III / IV). The compute reports the
// Mason type and its fracture-pattern description. The example sets type III; its expected text is
// the type description (no numeric facts), so it round-trips through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/mason-radial-head-v341.js';

export default [
  {
    id: 'mason-radial-head',
    summary: 'Mason-Johnston classification (Mason 1954; type IV added Johnston 1962) of a radial head fracture — the fracture pattern of a fracture of the head of the radius. I: nondisplaced or minimally displaced (< 2 mm), no mechanical block to forearm rotation. II: displaced (> 2 mm) partial-articular (marginal) fracture, may create a mechanical block. III: comminuted fracture of the entire radial head, usually not reconstructable. IV: radial head fracture with an associated elbow (ulnohumeral) dislocation. The management shorthand each type carries (early motion / fixation / excision or replacement) is the classically taught association, not an order. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.masonRadialHead,
    fields: [
      { dom: 'mason-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Mason type' },
    ],
  },
];
