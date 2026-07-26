// spec-v438 MCP wave: adapter for the Eaton-Littler thumb CMC arthritis stage in lib/eaton-littler-v438.js.
// The dom key mirrors the browser renderer (views/group-v438.js) and META['eaton-littler'].example. `stage`
// is an enum (I..IV). The compute reports the stage and its radiographic description. The example sets stage
// II; its expected number (2 mm) appears in the result band, so it flows through the default makeToArgs with
// no custom toArgs.

import * as C from '../../lib/eaton-littler-v438.js';

export default [
  {
    id: 'eaton-littler',
    summary: 'The Eaton-Littler classification of thumb carpometacarpal (basal-joint) osteoarthritis, by the radiographic joint findings, stages I/II/III/IV. I: normal or slightly widened TM joint (synovitis). II: slight narrowing, osteophytes <2 mm, subluxation up to one-third. III: marked narrowing, osteophytes >=2 mm, subluxation >one-third, scaphotrapezial joint spared. IV: pantrapezial arthritis. Reports the radiographic stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.eatonLittler,
    fields: [
      { dom: 'eaton-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Eaton-Littler stage' },
    ],
  },
];
