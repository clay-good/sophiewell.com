// spec-v493 MCP wave: adapter for the Lown ventricular-ectopy grading in lib/lown-ectopy-v493.js.
// The dom key mirrors the browser renderer (views/group-v493.js) and META['lown-ectopy'].example. `grade`
// is an enum (0/1/2/3/4A/4B/5 - bare '4' is deliberately absent so the 4A/4B split stays explicit). The
// compute reports the grade and its frequency/form description. The example sets grade 4B; the numbers in its
// expected text ("4B", "three") are carried by the result band, so it flows through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/lown-ectopy-v493.js';

export default [
  {
    id: 'lown-ectopy',
    summary: 'The Lown grading system for ventricular ectopy on an ambulatory ECG (Holter) recording, by the frequency and form of the ventricular ectopic beats, grades 0-5 with a 4A/4B split. 0: none. 1: occasional isolated beats (fewer than 30 per hour). 2: frequent beats (30 or more per hour). 3: multiform. 4A: couplets. 4B: salvos of three or more consecutive beats. 5: the R-on-T phenomenon. Reports the ectopy grade, not a diagnosis, an antiarrhythmic decision, or a risk prediction.',
    compute: C.lownEctopy,
    fields: [
      { dom: 'lown-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4A', '4B', '5'], label: 'Lown grade' },
    ],
  },
];
