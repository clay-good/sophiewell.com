// spec-v407 MCP wave: adapter for the Steinberg staging of femoral-head AVN in lib/steinberg-avn-v407.js.
// The dom key mirrors the browser renderer (views/group-v407.js) and META['steinberg-avn'].example.
// `stage` is an enum (0/I/II/III/IV/V/VI). The compute reports the stage and its radiographic description.
// The example sets stage III; its expected text's digits are the A/B/C extent thresholds (15, 30) that the
// result echoes verbatim, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/steinberg-avn-v407.js';

export default [
  {
    id: 'steinberg-avn',
    summary: 'Steinberg (University of Pennsylvania) staging of femoral-head osteonecrosis (avascular necrosis), stages 0-VI, by imaging - the more granular companion to the Ficat-Arlet staging, adding A/B/C extent grading. 0: normal imaging. I: normal radiograph, abnormal MRI / bone scan. II: lucent and sclerotic (cystic) changes without collapse. III: subchondral collapse (crescent sign) without flattening. IV: flattening of the femoral head. V: joint-space narrowing / acetabular changes. VI: advanced degenerative changes. Stages I-V are quantified A (<15%), B (15-30%), C (>30%) by extent. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.steinbergAvn,
    fields: [
      { dom: 'stb-stage', arg: 'stage', kind: 'enum', values: ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Steinberg stage' },
    ],
  },
];
