// spec-v354 MCP wave: adapter for the Tonnis classification (grade) of hip osteoarthritis in
// lib/tonnis-hip-oa-v354.js. The dom key mirrors the browser renderer (views/group-v354.js) and
// META['tonnis-hip-oa'].example. `grade` is an enum (0 / 1 / 2 / 3). The compute reports the Tonnis
// grade and its radiographic hip-OA description. The example sets grade 2; its expected number (2)
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/tonnis-hip-oa-v354.js';

export default [
  {
    id: 'tonnis-hip-oa',
    summary: 'Tonnis classification (Tonnis 1987) of hip osteoarthritis on an AP pelvis radiograph (grades 0-3), the hip counterpart to the general Kellgren-Lawrence grade. 0: no radiographic OA. 1: increased sclerosis, slight joint-space narrowing, small osteophytes; no or slight loss of femoral-head sphericity. 2: small subchondral cysts, moderate narrowing, moderate loss of head sphericity (radiographic OA). 3: large cysts, severe narrowing or obliteration, head deformity, or avascular necrosis (end-stage). A grade of 2 or more defines radiographic hip OA. This is the OA severity grade, not the Tonnis angle. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.tonnisHipOa,
    fields: [
      { dom: 'tonnis-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Tonnis grade' },
    ],
  },
];
