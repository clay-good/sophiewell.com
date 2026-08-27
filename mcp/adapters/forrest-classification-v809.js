// spec-v809 MCP adapter: Forrest classification in lib/forrest-classification-v809.js.
// The dom key mirrors the browser renderer (views/group-v809.js) and
// META['forrest-classification'].example. One enum in, one class code out. Clinical domain.

import { forrestClassification } from '../../lib/forrest-classification-v809.js';

export default [
  {
    id: 'forrest-classification',
    summary: 'Grades a bleeding peptic ulcer from what endoscopy shows. Returns the Forrest class, its rebleeding risk, and whether endoscopic therapy is indicated. Ia spurting and Ib oozing are active bleeding; IIa visible vessel, IIb adherent clot and IIc flat spot are stigmata of recent bleeding; III is a clean base. The classes are not an ordered ladder - a non-bleeding visible vessel rebleeds more often than an oozing ulcer.',
    compute: forrestClassification,
    fields: [
      {
        dom: 'forrest-stigma',
        arg: 'stigma',
        kind: 'enum',
        required: true,
        label: 'Endoscopic finding at the ulcer base',
        values: ['ia', 'ib', 'iia', 'iib', 'iic', 'iii'],
      },
    ],
  },
];
