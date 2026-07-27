// spec-v525 MCP wave: adapter for the Cornell Assessment of Pediatric Delirium in lib/capd-v525.js.
// The dom keys mirror the browser renderer (views/group-v525.js) and META['capd'].example: capd-q1 ..
// capd-q8 map to the lib args q1 .. q8. Every item is an enum '0'-'4', but the ANCHOR TEXTS differ by half
// and each field label embeds its own - items 1-4 score never=4/always=0 and items 5-8 score never=0/always=4.
// A caller reading a generic "0 to 4" schema would invert half the instrument and turn a well child into a
// positive screen, so the label is doing real safety work here, not documentation. All eight are in
// META.example, so all eight are required for every caller: a partial CAPD has no total, and an unanswered
// item is not a zero on either half. The example totals 12; that number is carried by the result band, so it
// flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/capd-v525.js';

export default [
  {
    id: 'capd',
    summary: 'The Cornell Assessment of Pediatric Delirium, eight observations over a nursing shift, each 0 to 4, total 0 to 32, with 9 or more the validated positive screen. The anchors are REVERSED between the two halves: items 1 to 4 ask about preserved function (eye contact, purposeful actions, awareness, communication) so never scores 4 and always scores 0, while items 5 to 8 ask about abnormal behavior (restless, inconsolable, underactive, slow to respond) so never scores 0 and always scores 4. Every item is rated against the child developmental baseline. It sums what an observer rates. It is not a diagnosis of delirium, not a cause, and not an indication for antipsychotics, a sedation change, or restraint. A positive screen is a prompt to look for treatable causes: pain, withdrawal, hypoxia, hypoglycemia, sepsis, seizure, and the sedatives already running.',
    compute: C.capd,
    fields: C.CAPD_ITEMS.map((item, i) => ({
      dom: `capd-${item.key}`,
      arg: item.key,
      kind: 'enum',
      values: item.options.map((o) => o.value),
      label: `${i + 1}. ${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
