// spec-v446 MCP wave: adapter for the ROP stage in lib/rop-stage-v446.js. The dom key mirrors the browser
// renderer (views/group-v446.js) and META['rop-stage'].example. `stage` is an enum (1-5). The compute reports
// the stage and its retinal description. The example sets stage 3; its expected text carries no numeric facts
// beyond the stage label (the description is word-only), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/rop-stage-v446.js';

export default [
  {
    id: 'rop-stage',
    summary: 'The International Classification of Retinopathy of Prematurity (ICROP) stage of acute ROP at the vascular/avascular junction, stages 1/2/3/4/5. 1: demarcation line. 2: ridge. 3: ridge with extraretinal fibrovascular proliferation. 4: partial retinal detachment (4A extrafoveal, 4B foveal). 5: total retinal detachment. Zone and plus disease are separate axes. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.ropStage,
    fields: [
      { dom: 'rop-stage', arg: 'stage', kind: 'enum', values: ['1', '2', '3', '4', '5'], label: 'ROP stage' },
    ],
  },
];
