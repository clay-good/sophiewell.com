// spec-v339 MCP wave: adapter for the Cormack-Lehane laryngeal-view classification in
// lib/cormack-lehane-v339.js. The dom key mirrors the browser renderer (views/group-v339.js) and
// META['cormack-lehane'].example. `grade` is an enum (1 / 2 / 3 / 4). The compute reports the
// laryngeal-view grade and its description. The example sets grade 3; its expected text is the grade
// description (the grade number already appears in the field value, no other numeric facts), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/cormack-lehane-v339.js';

export default [
  {
    id: 'cormack-lehane',
    summary: 'Cormack-Lehane classification (Cormack & Lehane 1984) of the laryngeal view at direct laryngoscopy. 1: most of the glottis (vocal cords) visible. 2: only the posterior glottis or arytenoids visible (modified 2a part of cords / 2b only arytenoids). 3: only the epiglottis, no glottis (modified 3a liftable / 3b adherent). 4: neither glottis nor epiglottis (only soft palate). Grades 1-2 are usually straightforward; grades 3-4 indicate a difficult laryngoscopy and predict difficult intubation. Reports the laryngeal view observed, not a diagnosis, an airway-management plan, or an intubation-success prediction.',
    compute: C.cormackLehane,
    fields: [
      { dom: 'cl-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3', '4'], label: 'Cormack-Lehane grade' },
    ],
  },
];
