// spec-v800 MCP adapter: Hughes Functional Grading Scale in lib/hughes-gbs-v800.js.
// The dom keys mirror the browser renderer (views/group-v800.js) and
// META['hughes-gbs'].example. One 0-6 enum. Clinical domain.

import { hughesGbs } from '../../lib/hughes-gbs-v800.js';

export default [
  {
    id: 'hughes-gbs',
    summary: 'Records disability in Guillain-Barre syndrome on the standard 0-6 functional grading scale (Hughes 1978): 0 healthy; 1 minor symptoms, able to run; 2 walks 10 m unaided but cannot run; 3 walks 10 m only with help; 4 bedridden or wheelchair-bound; 5 needs assisted ventilation; 6 death. Grade 3 or above is what the literature counts as disability, being where independent walking is lost. This is the scale mEGOS predicts at six months and the one EGRIS predicts the step to grade 5 of.',
    compute: hughesGbs,
    fields: [
      { dom: 'hughes-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4', '5', '6'], required: true, label: 'Functional grade (0-6)' },
    ],
  },
];
