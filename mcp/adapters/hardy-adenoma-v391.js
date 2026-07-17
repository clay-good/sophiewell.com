// spec-v391 MCP wave: adapter for the Hardy (Hardy-Wilson) classification of a pituitary adenoma in
// lib/hardy-adenoma-v391.js. The dom keys mirror the browser renderer (views/group-v391.js) and
// META['hardy-adenoma'].example. `grade` (0-IV) and `stage` (0/A-E) are both enums. The example (grade
// III, stage C) has both fields, so both adapter fields are required; its expected text is the grade/stage
// description (roman numeral + letter, no free numeric facts to round-trip), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/hardy-adenoma-v391.js';

export default [
  {
    id: 'hardy-adenoma',
    summary: 'Hardy (Hardy-Wilson) classification (Hardy 1969) of a pituitary adenoma - a two-axis system. Sellar-floor / sphenoid-invasion GRADE: 0 enclosed within the sella; I sella normal/focally expanded, tumor < 10 mm; II tumor >= 10 mm, sella enlarged, floor intact; III localized erosion of the sellar floor (invasive); IV diffuse destruction (invasive). Suprasellar-extension STAGE: 0 none; A suprasellar cistern; B recess of the third ventricle; C third ventricle grossly displaced; D intracranial (intradural); E into or beneath the cavernous sinus. Grades III-IV are invasive. Complements the Knosp grade (parasellar axis). Reports the grade and stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.hardyAdenoma,
    fields: [
      { dom: 'hardy-grade', arg: 'grade', kind: 'enum', values: ['0', 'I', 'II', 'III', 'IV'], required: true, label: 'Sellar-floor grade' },
      { dom: 'hardy-stage', arg: 'stage', kind: 'enum', values: ['0', 'A', 'B', 'C', 'D', 'E'], required: true, label: 'Suprasellar stage' },
    ],
  },
];
