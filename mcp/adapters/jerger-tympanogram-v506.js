// spec-v506 MCP wave: adapter for the Jerger tympanogram classification in lib/jerger-tympanogram-v506.js.
// The dom key mirrors the browser renderer (views/group-v506.js) and META['jerger-tympanogram'].example.
// `type` is an enum (A/As/Ad/B/C - the mixed-case two-letter values are what the renderer emits; the lib
// uppercases before lookup, so 'as'/'AD' also resolve). The compute reports the type and its shape
// description. The example sets type B; its expected text carries no numeric facts (the description is
// word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/jerger-tympanogram-v506.js';

export default [
  {
    id: 'jerger-tympanogram',
    summary: 'The Jerger classification of tympanogram shapes, by the peak pressure and peak compliance of the tracing, types A / As / Ad / B / C. A: normal peak, at normal pressure with normal compliance. As: shallow peak at normal pressure, reduced compliance (a stiff system). Ad: deep peak at normal pressure, abnormally high compliance. B: flat with no identifiable peak - classically effusion at a normal ear-canal volume, or a perforation or patent tube at a large canal volume. C: peak at significantly negative pressure, classically eustachian tube dysfunction. The cause associations are the classic ones, stated descriptively; a type never establishes a cause on its own. Reports the type read from the tracing, not a diagnosis, a hearing-loss severity, or a decision about tubes.',
    compute: C.jergerTympanogram,
    fields: [
      { dom: 'jerger-type', arg: 'type', kind: 'enum', values: ['A', 'As', 'Ad', 'B', 'C'], label: 'Tympanogram type' },
    ],
  },
];
