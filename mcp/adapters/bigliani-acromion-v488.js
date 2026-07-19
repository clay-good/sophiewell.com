// spec-v488 MCP wave: adapter for the Bigliani acromion morphology classification in
// lib/bigliani-acromion-v488.js. The dom key mirrors the browser renderer (views/group-v488.js) and
// META['bigliani-acromion'].example. `type` is an enum (I/II/III). The compute reports the type and its
// acromial-undersurface description. The example sets type II; its expected text carries no numeric facts (the
// description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/bigliani-acromion-v488.js';

export default [
  {
    id: 'bigliani-acromion',
    summary: 'The Bigliani classification of acromion morphology, by the shape of the acromial undersurface on the supraspinatus-outlet view, types I/II/III. I: flat. II: curved (paralleling the humeral head). III: hooked (anterior hook), most associated with subacromial impingement and rotator cuff tears. Reports the imaging type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.biglianiAcromion,
    fields: [
      { dom: 'bigliani-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Bigliani type' },
    ],
  },
];
