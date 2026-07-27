// spec-v515 MCP wave: adapter for the Simpson-Angus Scale in lib/simpson-angus-v515.js.
// The dom keys mirror the browser renderer (views/group-v515.js) and META['simpson-angus'].example: sa-q1 ..
// sa-q10 map to the lib args q1 .. q10. Every item is an enum '0'-'4' and all ten are in the example, so all
// ten are required for every caller - correct here because the reported figure is a MEAN: an omitted item
// would change the denominator silently, which is worse than refusing to answer. The example gives a mean of
// 0.80 on a total of 8; both numbers are carried by the result band, which is deliberate - quoting the total
// where a mean is expected is a ten-fold error. Flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/simpson-angus-v515.js';

const SCALE = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'simpson-angus',
    summary: 'The Simpson-Angus Scale for drug-induced parkinsonism: ten examination items (gait, arm dropping, shoulder shaking, elbow rigidity, wrist rigidity, leg pendulousness, head dropping, glabella tap, tremor, salivation), each 0 normal to 4 severe. The scale is conventionally reported as the MEAN item score, total divided by 10, not as the total, and a mean above 0.3 is the threshold in common use; this returns both and names which is which. It sums the ratings an examiner assigns. It is not a diagnosis, it does not separate drug-induced parkinsonism from idiopathic Parkinson disease, and it is not an indication to reduce, switch, or stop an antipsychotic or to start an anticholinergic. It does not rate akathisia or tardive dyskinesia, which have their own scales.',
    compute: C.simpsonAngus,
    fields: C.SAS_ITEMS.map((label, i) => ({
      dom: `sa-q${i + 1}`,
      arg: `q${i + 1}`,
      kind: 'enum',
      values: SCALE,
      label: `${i + 1}. ${label} (0 normal to 4 severe)`,
    })),
  },
];
