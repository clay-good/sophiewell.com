// spec-v439 MCP wave: adapter for the Hamada grade in lib/hamada-v439.js. The dom key mirrors the browser
// renderer (views/group-v439.js) and META['hamada'].example. `grade` is an enum (1-5). The compute reports
// the grade and its radiographic description. The example sets grade 1; its expected number (6 mm) appears in
// the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/hamada-v439.js';

export default [
  {
    id: 'hamada',
    summary: 'The Hamada classification of rotator cuff tear arthropathy on shoulder radiographs, by the acromiohumeral interval (AHI) and glenohumeral / acromial changes, grades 1/2/3/4/5. 1: AHI >= 6 mm. 2: AHI <= 5 mm. 3: AHI <= 5 mm with acetabularization of the acromion. 4: glenohumeral arthritis. 5: humeral head collapse. Reports the radiographic grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.hamada,
    fields: [
      { dom: 'hamada-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3', '4', '5'], label: 'Hamada grade' },
    ],
  },
];
