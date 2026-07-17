// spec-v392 MCP wave: adapter for the Hill classification of the gastroesophageal flap valve in
// lib/hill-flap-valve-v392.js. The dom key mirrors the browser renderer (views/group-v392.js) and
// META['hill-flap-valve'].example. `grade` is an enum (I/II/III/IV). The compute reports the grade and
// its ridge/valve description. The example sets grade III; its expected text is the grade description (a
// roman numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/hill-flap-valve-v392.js';

export default [
  {
    id: 'hill-flap-valve',
    summary: 'Hill classification (Hill 1996) of the gastroesophageal flap valve (grades I-IV), graded endoscopically from a retroflexed view of the cardia - the only endoscopic grading of the flap-valve / esophagogastric-junction competence, which correlates with hiatal hernia and GERD. I: a prominent ridge of tissue closely approximated to the retroflexed scope, extending 3-4 cm along the lesser curvature (normal). II: a less pronounced ridge that may open with respiration but closes. III: a diminished ridge that fails to close around the endoscope; often with a hiatal hernia. IV: no ridge; the esophagogastric junction stays open, with the esophageal lumen seen in retroflexion; hiatal hernia. Grades III-IV are abnormal. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.hillFlapValve,
    fields: [
      { dom: 'hill-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Hill grade' },
    ],
  },
];
