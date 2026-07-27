// spec-v518 MCP wave: adapter for the Childhood Asthma Control Test in lib/childhood-act-v518.js.
// The dom keys mirror the browser renderer (views/group-v518.js) and META['childhood-act'].example: cact-c1
// .. cact-c4 and cact-p1 .. cact-p3 map to the lib args c1 .. c4 and p1 .. p3. The two groups get DIFFERENT
// enum value lists ('0'-'3' for the child items, '0'-'5' for the caregiver items), generated from the lib's
// exported CHILD_ITEMS and PARENT_ITEMS - a single shared enum would let a 4 or 5 through on a child item and
// silently inflate the total. Each field label names WHO answers it, because the same tool call mixes a
// child-reported and a caregiver-reported instrument. All seven are in META.example, so all seven are
// required for every caller: a partial c-ACT has no total. The example scores 17; that number and both
// subtotals are carried by the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/childhood-act-v518.js';

export default [
  {
    id: 'childhood-act',
    summary: 'The Childhood Asthma Control Test, for children roughly 4 to 11 years old. It is a different instrument from the adult ACT, not a simplified version: four items answered by the child score 0 to 3 and three items answered by the caregiver about the past four weeks score 0 to 5, for a total of 0 to 27. A total of 19 or less is not well controlled and 20 or more is well controlled - the same cut number as the adult ACT but on a different scale, so scoring a childhood ACT out of 25 misreads it. It sums what a child and a caregiver report. It is not a diagnosis of asthma, not a measure of lung function, and not an indication to step therapy up or down or to prescribe oral steroids. It does not assess inhaler technique, spacer use, adherence, trigger exposure, or comorbidities, and it is a control measure rather than a risk measure.',
    compute: C.childhoodAct,
    fields: [
      ...C.CHILD_ITEMS.map((item) => ({
        dom: `cact-${item.key}`,
        arg: item.key,
        kind: 'enum',
        values: item.options.map((o) => o.value),
        label: `Child answers: ${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
      })),
      ...C.PARENT_ITEMS.map((item) => ({
        dom: `cact-${item.key}`,
        arg: item.key,
        kind: 'enum',
        values: item.options.map((o) => o.value),
        label: `Caregiver answers: ${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
      })),
    ],
  },
];
