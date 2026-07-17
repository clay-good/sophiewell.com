// spec-v389 MCP wave: adapter for the Koos grading of a vestibular schwannoma in
// lib/koos-schwannoma-v389.js. The dom key mirrors the browser renderer (views/group-v389.js) and
// META['koos-schwannoma'].example. `grade` is an enum (I/II/III/IV). The compute reports the grade and
// its extension/brainstem description. The example sets grade IV; its expected text is the grade
// description (a roman numeral + "fourth ventricle"; the numeric fact 4 appears in the result), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/koos-schwannoma-v389.js';

export default [
  {
    id: 'koos-schwannoma',
    summary: 'Koos classification (Koos 1998) of a vestibular schwannoma (acoustic neuroma), grades I-IV, by extrameatal extension and brainstem involvement - used to stratify these tumors for radiosurgery-vs-microsurgery planning. I: intracanalicular; limited to the internal auditory canal, no extrameatal extension. II: extends into the cerebellopontine angle (intra- and extra-meatal) but does not contact the brainstem. III: occupies the cerebellopontine cistern and contacts the brainstem but does not displace it. IV: a large tumor that compresses the brainstem and displaces the fourth ventricle. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.koosSchwannoma,
    fields: [
      { dom: 'koos-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Koos grade' },
    ],
  },
];
