// spec-v360 MCP wave: adapter for the Keith-Wagener-Barker hypertensive retinopathy classification in
// lib/kwb-retinopathy-v360.js. The dom key mirrors the browser renderer (views/group-v360.js) and
// META['kwb-retinopathy'].example. `grade` is an enum (1-4). The compute reports the KWB grade and its
// fundoscopic description. The example sets grade 3; its expected number (3) round-trips through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/kwb-retinopathy-v360.js';

export default [
  {
    id: 'kwb-retinopathy',
    summary: 'Keith-Wagener-Barker classification (Keith, Wagener & Barker 1939) of hypertensive retinopathy on fundoscopy (grades 1-4), the hypertensive counterpart to the ICDR diabetic-retinopathy scale. 1: mild generalized retinal arteriolar narrowing (and AV tortuosity). 2: focal arteriolar narrowing and arteriovenous (AV) nicking. 3: grade 2 changes plus retinal hemorrhages, cotton-wool spots, and hard exudates. 4: grade 3 changes plus optic disc swelling (papilledema), the fundoscopic hallmark of malignant hypertension. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.kwbRetinopathy,
    fields: [
      { dom: 'kwb-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3', '4'], label: 'Keith-Wagener-Barker grade' },
    ],
  },
];
