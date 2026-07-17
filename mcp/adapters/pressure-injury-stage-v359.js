// spec-v359 MCP wave: adapter for the NPIAP pressure injury staging in
// lib/pressure-injury-stage-v359.js. The dom key mirrors the browser renderer (views/group-v359.js) and
// META['pressure-injury-stage'].example. `stage` is an enum (1-4, unstageable, dtpi). The compute
// reports the NPIAP stage and its depth-of-tissue-loss description. The example sets Stage 3; its
// expected number (3) round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/pressure-injury-stage-v359.js';

export default [
  {
    id: 'pressure-injury-stage',
    summary: 'NPIAP pressure injury staging (2016 revision) — the standard classification of a pressure injury by depth of tissue loss. 1: non-blanchable erythema of intact skin. 2: partial-thickness skin loss with exposed dermis. 3: full-thickness skin loss (subcutaneous fat may be visible). 4: full-thickness skin and tissue loss with exposed fascia, muscle, tendon, or bone. Unstageable: full-thickness loss obscured by slough or eschar. Deep Tissue Pressure Injury: persistent non-blanchable deep red, maroon, or purple discoloration. Staging describes tissue loss, not healing. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.pressureInjuryStage,
    fields: [
      { dom: 'pi-stage', arg: 'stage', kind: 'enum', values: ['1', '2', '3', '4', 'unstageable', 'dtpi'], label: 'Pressure injury stage' },
    ],
  },
];
