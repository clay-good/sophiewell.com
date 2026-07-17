// spec-v382 MCP wave: adapter for the (modified) Eichenholtz classification of Charcot neuroarthropathy
// in lib/eichenholtz-charcot-v382.js. The dom key mirrors the browser renderer (views/group-v382.js) and
// META['eichenholtz-charcot'].example. `stage` is an enum (0/1/2/3). The compute reports the stage and
// its temporal/radiographic description. The example sets stage 1; its expected text is the stage
// description (a small integer already echoed in the band), so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/eichenholtz-charcot-v382.js';

export default [
  {
    id: 'eichenholtz-charcot',
    summary: '(Modified) Eichenholtz classification (Eichenholtz 1966) of Charcot neuroarthropathy (stages 0-3), the temporal/radiographic staging of the neuropathic foot. 0: prodromal / pre-radiographic - a warm, swollen, erythematous neuropathic foot with normal or near-normal radiographs (MRI shows edema); the acute, at-risk phase. 1: development / fragmentation - inflammation with radiographic osseous fragmentation, subluxation, and dislocation; the acute, unstable phase. 2: coalescence - decreased inflammation; absorption of fine debris, fusion of large fragments, and sclerosis. 3: reconstruction / consolidation - remodeling with a stable, fixed deformity; inflammation resolved. Stages 0-1 are the acutely-active, at-risk phase. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.eichenholtzCharcot,
    fields: [
      { dom: 'eich-stage', arg: 'stage', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Eichenholtz stage' },
    ],
  },
];
