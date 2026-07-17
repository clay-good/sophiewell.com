// spec-v357 MCP wave: adapter for the NYHA functional classification of heart failure in
// lib/nyha-class-v357.js. The dom key mirrors the browser renderer (views/group-v357.js) and
// META['nyha-class'].example. `cls` is an enum (I / II / III / IV). The compute reports the NYHA class
// and its symptom-limitation description. The example sets class III; its expected text is the class
// description (the class is a roman numeral), so it round-trips through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/nyha-class-v357.js';

export default [
  {
    id: 'nyha-class',
    summary: 'NYHA (New York Heart Association) functional classification of heart failure (classes I-IV) — the most widely used symptom-based functional classification in cardiology. I: no limitation of physical activity; ordinary activity causes no undue fatigue, palpitation, or dyspnea. II: slight limitation; comfortable at rest, ordinary activity causes symptoms. III: marked limitation; comfortable at rest, less-than-ordinary activity causes symptoms. IV: unable to carry on any physical activity without discomfort; symptoms of heart failure at rest. Reports the class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.nyhaClass,
    fields: [
      { dom: 'nyha-class', arg: 'cls', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'NYHA class' },
    ],
  },
];
