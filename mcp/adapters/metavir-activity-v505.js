// spec-v505 MCP wave: adapter for the METAVIR activity grading in lib/metavir-activity-v505.js.
// The dom key mirrors the browser renderer (views/group-v505.js) and META['metavir-activity'].example, and is
// deliberately distinct from the sibling fibrosis tile's `metavir-stage`. `grade` is an enum (A0..A3). The
// compute reports the grade and its description. The example sets grade A2; the only numbers in its expected
// text are the grade labels themselves, which the result band carries, so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/metavir-activity-v505.js';

export default [
  {
    id: 'metavir-activity',
    summary: 'The METAVIR necroinflammatory activity grade on liver biopsy, the second axis of the METAVIR system, grades A0-A3, derived from the combination of piecemeal (interface) necrosis and lobular necrosis. A0: none. A1: mild. A2: moderate. A3: severe. A METAVIR read is reported as an activity grade and a fibrosis stage together (for example A2F3); activity describes ongoing necroinflammation, fibrosis describes accumulated scarring. Reports the grade the pathologist has assigned, not a diagnosis, a non-invasive substitute for biopsy, or a treatment decision. For the fibrosis stage see metavir-fibrosis.',
    compute: C.metavirActivity,
    fields: [
      { dom: 'metavir-activity-grade', arg: 'grade', kind: 'enum', values: ['A0', 'A1', 'A2', 'A3'], label: 'METAVIR activity grade' },
    ],
  },
];
