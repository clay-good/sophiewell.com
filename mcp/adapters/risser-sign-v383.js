// spec-v383 MCP wave: adapter for the Risser sign (US grading, 0-5) in lib/risser-sign-v383.js. The dom
// key mirrors the browser renderer (views/group-v383.js) and META['risser-sign'].example. `grade` is an
// enum (0-5). The compute reports the grade and its ossification description. The example sets grade 5;
// its expected text is the grade description (a small integer already echoed in the band), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/risser-sign-v383.js';

export default [
  {
    id: 'risser-sign',
    summary: 'Risser sign (US grading, 0-5; Risser 1958) - skeletal-maturity staging by the ossification and fusion of the iliac crest apophysis, used in scoliosis to gauge the remaining growth potential (and the likelihood of curve progression). 0: no ossification; skeletally immature, maximum growth remaining. 1-3: about 25% / 50% / 75% ossification. 4: 100% ossification of the apophysis, but not yet fused; little growth remains. 5: complete ossification and fusion to the iliac crest; full skeletal maturity. A maturity indicator, not a measure of pathology. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.risserSign,
    fields: [
      { dom: 'risser-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Risser grade' },
    ],
  },
];
