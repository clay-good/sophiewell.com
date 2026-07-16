// spec-v342 MCP wave: adapter for the Hawkins classification of a talar neck fracture in
// lib/hawkins-talar-v342.js. The dom key mirrors the browser renderer (views/group-v342.js) and
// META['hawkins-talar'].example. `type` is an enum (I / II / III / IV). The compute reports the
// Hawkins type, its fracture-pattern description, and the classically reported AVN-risk range. The
// example sets type III; its expected AVN range (~70-100%) round-trips through the default makeToArgs
// with no custom toArgs (the result echoes the range in `avnRisk` and the band text).

import * as C from '../../lib/hawkins-talar-v342.js';

export default [
  {
    id: 'hawkins-talar',
    summary: 'Hawkins classification (Hawkins 1970; type IV added Canale-Kelly 1978) of a talar neck fracture — the fracture pattern of a fracture of the neck of the talus, which correlates with the risk of avascular necrosis (AVN) of the talar body. I: nondisplaced, no dislocation (AVN ~0-15%). II: displaced with subtalar joint subluxation or dislocation (~20-50%). III: displaced with dislocation of the talar body from both the subtalar and the ankle (tibiotalar) joints (~70-100%). IV: type III plus talonavicular joint dislocation of the head fragment (highest). The AVN-risk ranges are classically reported case-series figures, not a per-patient prediction. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.hawkinsTalar,
    fields: [
      { dom: 'hawkins-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Hawkins type' },
    ],
  },
];
