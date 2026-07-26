// spec-v471 MCP wave: adapter for the Gass macular hole staging in lib/gass-macular-hole-v471.js. The dom key
// mirrors the browser renderer (views/group-v471.js) and META['gass-macular-hole'].example. `stage` is an enum
// (1-4). The compute reports the stage and its biomicroscopic description. The example sets stage 2; its
// expected text carries the "400 micrometers" fact, so the default makeToArgs flows through with no custom
// toArgs.

import * as C from '../../lib/gass-macular-hole-v471.js';

export default [
  {
    id: 'gass-macular-hole',
    summary: 'The Gass classification of the stages of development of an idiopathic macular hole, stages 1-4. 1: impending (foveal detachment, no full-thickness defect). 2: small full-thickness hole (less than 400 micrometers). 3: larger full-thickness hole (400 micrometers or more) without a complete posterior vitreous detachment. 4: full-thickness hole with a complete posterior vitreous detachment. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.gassMacularHole,
    fields: [
      { dom: 'gass-stage', arg: 'stage', kind: 'enum', values: ['1', '2', '3', '4'], label: 'Gass stage' },
    ],
  },
];
