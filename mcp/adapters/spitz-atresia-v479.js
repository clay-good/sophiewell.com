// spec-v479 MCP wave: adapter for the Spitz esophageal atresia risk grouping in lib/spitz-atresia-v479.js. The
// dom key mirrors the browser renderer (views/group-v479.js) and META['spitz-atresia'].example. `group` is an
// enum (I/II/III). The compute reports the group and its birth-weight / cardiac criteria. The example sets
// group II; its expected text carries the "1500 g" fact, so the default makeToArgs flows through with no custom
// toArgs.

import * as C from '../../lib/spitz-atresia-v479.js';

export default [
  {
    id: 'spitz-atresia',
    summary: 'The Spitz classification of esophageal atresia, by birth weight and major congenital cardiac disease, groups I/II/III. I: birth weight 1500 g or more and no major cardiac disease. II: birth weight less than 1500 g, or major cardiac disease. III: birth weight less than 1500 g and major cardiac disease. Reports the risk group, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.spitzAtresia,
    fields: [
      { dom: 'spitz-group', arg: 'group', kind: 'enum', values: ['I', 'II', 'III'], label: 'Spitz group' },
    ],
  },
];
