// spec-v516 MCP wave: adapter for the Asthma Control Test in lib/asthma-control-test-v516.js.
// The dom keys mirror the browser renderer (views/group-v516.js) and META['asthma-control-test'].example:
// act-q1 .. act-q5 map to the lib args q1 .. q5. Each item is an enum '1'-'5' - note the range starts at 1,
// not 0, which is the one thing a caller used to 0-based instruments gets wrong; the enum makes 0 an invalid
// value rather than a silently accepted floor. Each field label carries that item's own anchor wording,
// generated from the lib's exported ACT_ITEMS, because "5" means "none of the time" on item 1 and "not at
// all" on item 2. All five are in META.example, so all five are required for every caller: a partial ACT has
// no total. The example scores 17; that number and the band are carried by the result band, so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/asthma-control-test-v516.js';

export default [
  {
    id: 'asthma-control-test',
    summary: 'The Asthma Control Test, five patient-rated items about the past four weeks. Each item scores 1 to 5 with its own anchor wording and 5 is always the best answer; there is no zero on the scale. Total 5 to 25: 25 is totally controlled, 20 to 24 is well controlled, and 19 or less is not well controlled. It sums what the patient reports. It is not a diagnosis of asthma, not a measure of lung function, and not an indication to step therapy up or down or to prescribe oral steroids. It does not assess inhaler technique, adherence, trigger exposure, or comorbidities, and it is a control measure rather than a risk measure: it does not estimate the risk of a future exacerbation.',
    compute: C.asthmaControlTest,
    fields: C.ACT_ITEMS.map((item, i) => ({
      dom: `act-q${i + 1}`,
      arg: `q${i + 1}`,
      kind: 'enum',
      values: item.options.map((o) => o.value),
      label: `${i + 1}. ${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
