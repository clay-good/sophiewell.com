// spec-v513 MCP wave: adapter for the ASRS v1.1 Part A adult ADHD screener in lib/asrs-v513.js.
// The dom keys mirror the browser renderer (views/group-v513.js) and META['asrs'].example: as-q1 .. as-q6 map
// to the lib args q1 .. q6. Every item is an enum '0'-'4' and all six are in the example, so all six are
// required for every caller - correct for a screen, and here specifically because the counting rule is
// per-item: an omitted item cannot be defaulted, since the same answer counts on items 1-3 and does not on
// items 4-6. Each field label carries that item's own threshold, so a caller reading only the tool schema
// still cannot mistake the screen for a sum. The example counts 5 of 6; that number and the raw total are
// carried by the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/asrs-v513.js';

const SCALE = C.FREQUENCY_SCALE.map((o) => o.value);

export default [
  {
    id: 'asrs',
    summary: 'The ASRS v1.1 Part A screener for adult ADHD, six items over the past six months. The answers are NOT summed: each item is rated 0 (never) to 4 (very often), but items 1 to 3 count toward the screen at sometimes or more while items 4 to 6 count only at often or more, and 4 or more counting answers is a positive screen. Answering sometimes to all six is a raw total of 12 of 24 and a negative screen. A positive screen means symptoms are consistent with adult ADHD and further clinical evaluation is warranted; it does not establish the diagnosis, which needs symptoms across settings, onset in childhood, functional impairment, and the exclusion of other causes. A negative screen does not exclude ADHD. It is not an indication for stimulant or non-stimulant medication, for a controlled-substance prescription, or for an academic or workplace accommodation.',
    compute: C.asrs,
    fields: C.ASRS_ITEMS.map((item, i) => ({
      dom: `as-q${i + 1}`,
      arg: `q${i + 1}`,
      kind: 'enum',
      values: SCALE,
      label: `${i + 1}. ${item.text} (counts at ${item.countsAt === 2 ? 'sometimes' : 'often'} or more)`,
    })),
  },
];
