// spec-v381 MCP wave: adapter for the Winquist-Hansen classification of a femoral shaft fracture in
// lib/winquist-hansen-v381.js. The dom key mirrors the browser renderer (views/group-v381.js) and
// META['winquist-hansen'].example. `type` is an enum (0/I/II/III/IV). The compute reports the type and
// its comminution/cortical-contact description. The example sets type III; its expected text quotes the
// "50%" width/contact thresholds, which the band echoes, so it round-trips through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/winquist-hansen-v381.js';

export default [
  {
    id: 'winquist-hansen',
    summary: 'Winquist-Hansen classification (Winquist 1984) of a femoral SHAFT fracture (types 0-IV), by the extent of comminution and the cortical contact between the two main fragments - the standard grading that stratifies axial/rotational stability. 0: no comminution (transverse or short oblique). I: a small butterfly fragment (under 25% of the bone width); does not affect stability. II: a larger butterfly (under 50% of the bone width); at least 50% cortical contact remains between the two main fragments. III: a large fragment (over 50% of the bone width); less than 50% cortical contact remains. IV: circumferential comminution over a segment; no cortical contact. Cortical contact and stability fall 0 to IV. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.winquistHansen,
    fields: [
      { dom: 'wh-type', arg: 'type', kind: 'enum', values: ['0', 'I', 'II', 'III', 'IV'], label: 'Winquist-Hansen type' },
    ],
  },
];
