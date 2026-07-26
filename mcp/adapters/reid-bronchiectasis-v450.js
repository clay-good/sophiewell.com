// spec-v450 MCP wave: adapter for the Reid bronchiectasis classification in lib/reid-bronchiectasis-v450.js.
// The dom key mirrors the browser renderer (views/group-v450.js) and META['reid-bronchiectasis'].example.
// `type` is an enum (cylindrical/varicose/cystic). The compute reports the type and its morphology. The
// example sets varicose; its expected text carries no numeric facts (the description is word-only), so it
// flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/reid-bronchiectasis-v450.js';

export default [
  {
    id: 'reid-bronchiectasis',
    summary: 'The Reid classification of bronchiectasis by bronchial morphology on imaging, cylindrical / varicose / cystic. Cylindrical (tubular): uniformly dilated, regular outline (least severe). Varicose: irregular, beaded outline. Cystic (saccular): large cyst-like dilatations (most severe). Reports the imaging morphology, not a diagnosis, a severity determination, a treatment decision, or a prognosis.',
    compute: C.reidBronchiectasis,
    fields: [
      { dom: 'reid-type', arg: 'type', kind: 'enum', values: ['cylindrical', 'varicose', 'cystic'], label: 'Reid type' },
    ],
  },
];
