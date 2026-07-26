// spec-v486 MCP wave: adapter for the Samilson-Prieto shoulder dislocation-arthropathy grading in
// lib/samilson-prieto-v486.js. The dom key mirrors the browser renderer (views/group-v486.js) and
// META['samilson-prieto'].example. `grade` is an enum (mild/moderate/severe). The compute reports the grade and
// its osteophyte-size description. The example sets moderate; its expected text carries the "3 to 7 mm" fact, so
// the default makeToArgs flows through with no custom toArgs.

import * as C from '../../lib/samilson-prieto-v486.js';

export default [
  {
    id: 'samilson-prieto',
    summary: 'The Samilson-Prieto classification of dislocation arthropathy of the shoulder, by the size of the inferior humeral / glenoid osteophyte, mild/moderate/severe. Mild: osteophyte less than 3 mm. Moderate: 3 to 7 mm, with slight joint irregularity. Severe: greater than 7 mm, with joint-space narrowing and sclerosis. Reports the radiographic grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.samilsonPrieto,
    fields: [
      { dom: 'samilson-grade', arg: 'grade', kind: 'enum', values: ['mild', 'moderate', 'severe'], label: 'Samilson-Prieto grade' },
    ],
  },
];
