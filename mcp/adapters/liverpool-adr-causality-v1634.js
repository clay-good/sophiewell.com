// spec-v1634 MCP adapter: liverpool-adr-causality in lib/liverpool-adr-causality-v1634.js. The dom
// keys mirror views/group-v1634.js and META['liverpool-adr-causality'].example. Clinical domain.
// Only the first question is always needed; each later one is asked when the path reaches it.

import * as LV from '../../lib/liverpool-adr-causality-v1634.js';

// The figure's wording for this one is too long for an example row, so the agent label drops its
// parenthesis; the on-screen question keeps it.
const LABELS = { improved: 'Did the event improve when the drug was stopped or dose reduced?' };

export default [
  {
    id: 'liverpool-adr-causality',
    summary: 'The Liverpool causality category for a suspected adverse drug reaction. It walks the published flowchart in order (timing, dechallenge, underlying disease, rechallenge, objective evidence, past history, earlier reports) and returns unlikely, possible, probable or definite with the path taken. It is a structured assessment, not proof of cause.',
    compute: LV.liverpoolAdrCausality,
    fields: LV.QUESTIONS.map((q, i) => ({ dom: `lac-${q.dom}`, arg: q.arg, kind: 'enum', values: q.options.map((x) => x.value), ...(i === 0 ? { required: true } : {}), label: LABELS[q.arg] || q.text })),
  },
];
