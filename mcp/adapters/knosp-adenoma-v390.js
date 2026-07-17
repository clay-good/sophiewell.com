// spec-v390 MCP wave: adapter for the Knosp grading of a pituitary adenoma in lib/knosp-adenoma-v390.js.
// The dom key mirrors the browser renderer (views/group-v390.js) and META['knosp-adenoma'].example.
// `grade` is an enum (0-4). The compute reports the grade and its ICA-landmark description. The example
// sets grade 4; its expected text is the grade description (a small integer echoed in the result), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/knosp-adenoma-v390.js';

export default [
  {
    id: 'knosp-adenoma',
    summary: 'Knosp classification (Knosp 1993) of cavernous sinus invasion by a pituitary adenoma (grades 0-4), on coronal MRI, using the internal carotid artery (ICA) as the landmark - predictive of surgical remission. 0: no cavernous sinus involvement; medial to the medial tangent of the ICA. 1: past the medial tangent but not past the intercarotid line. 2: past the intercarotid line but not past the lateral tangent. 3: lateral to the lateral tangent of the ICA (revised: 3A superior / 3B inferior); invasion likely. 4: total encasement of the intracavernous ICA. Grades 3-4 predict true invasion. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.knospAdenoma,
    fields: [
      { dom: 'knosp-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Knosp grade' },
    ],
  },
];
