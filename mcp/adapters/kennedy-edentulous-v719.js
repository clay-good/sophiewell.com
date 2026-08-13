// spec-v719 MCP adapter: Kennedy classification in lib/kennedy-edentulous-v719.js.
// The dom keys mirror the browser renderer (views/group-v719.js) and
// META['kennedy-edentulous'].example. A class enum + a modification-count enum; decision
// logic returns the Kennedy class and modification number. Clinical domain.

import { kennedyEdentulous } from '../../lib/kennedy-edentulous-v719.js';

export default [
  {
    id: 'kennedy-edentulous',
    summary: 'Kennedy classification of the partially edentulous arch (Kennedy 1925; Applegate rules): the class is set by the most-posterior edentulous area. Class I = bilateral areas posterior to remaining teeth; II = unilateral posterior; III = unilateral bounded by teeth; IV = single anterior area crossing the midline. Additional areas are modification spaces numbered by count; Class IV admits no modifications.',
    compute: kennedyEdentulous,
    fields: [
      { dom: 'ken-class', arg: 'primaryClass', kind: 'enum', values: ['I', 'II', 'III', 'IV'], required: true, label: 'Class-determining edentulous area' },
      { dom: 'ken-mods', arg: 'modifications', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: false, label: 'Additional edentulous areas (modifications)' },
    ],
  },
];
