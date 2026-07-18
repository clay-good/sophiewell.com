// spec-v413 MCP wave: adapter for the Seinsheimer classification of subtrochanteric femur fractures in
// lib/seinsheimer-subtroch-v413.js. The dom key mirrors the browser renderer (views/group-v413.js) and
// META['seinsheimer-subtroch'].example. `type` is an enum (I/IIA/IIB/IIC/IIIA/IIIB/IV/V). The compute
// reports the type and its fragment/fracture-line description. The example sets type IIB; its expected text
// carries no numeric facts (the type description is word-only), so it flows through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/seinsheimer-subtroch-v413.js';

export default [
  {
    id: 'seinsheimer-subtroch',
    summary: 'Seinsheimer classification of subtrochanteric femur fractures, types I/IIA/IIB/IIC/IIIA/IIIB/IV/V, by fragment count, fracture-line shape, and lesser-trochanter attachment. I: nondisplaced (less than 2 mm). IIA: two-part transverse. IIB/IIC: two-part spiral with the lesser trochanter attached to the proximal / distal fragment. IIIA: three-part spiral with the lesser trochanter in the third fragment (inferior spike). IIIB: three-part spiral with a butterfly fragment. IV: comminuted (four or more fragments). V: subtrochanteric-intertrochanteric (extends through the greater trochanter). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.seinsheimerSubtroch,
    fields: [
      { dom: 'ss-type', arg: 'type', kind: 'enum', values: ['I', 'IIA', 'IIB', 'IIC', 'IIIA', 'IIIB', 'IV', 'V'], label: 'Seinsheimer type' },
    ],
  },
];
