// spec-v514 MCP wave: adapter for the Young Mania Rating Scale in lib/ymrs-v514.js.
// The dom keys mirror the browser renderer (views/group-v514.js) and META['ymrs'].example: ym-q1 .. ym-q11
// map to the lib args q1 .. q11. Each item is an enum, but NOT the same enum: the seven 0-4 items and the
// four 0-8 items get their own value lists, generated from the lib's exported YMRS_ITEMS. That is the whole
// point of exposing it - a caller that assumed one shared 0-4 scale would silently cap irritability, speech,
// thought content, and disruptive or aggressive behavior at half their real weight. All eleven are in
// META.example, so all eleven are required for every caller. The example totals 24; that number, the 60
// ceiling, and the double-weighted subtotal are carried by the result band, so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/ymrs-v514.js';

function valuesTo(max) {
  const out = [];
  for (let n = 0; n <= max; n += 1) out.push(String(n));
  return out;
}

export default [
  {
    id: 'ymrs',
    summary: 'The Young Mania Rating Scale, eleven clinician-rated items at one interview. The items are NOT weighted equally: seven score 0 to 4, and four - irritability, speech, thought content, and disruptive or aggressive behavior - score 0 to 8, for a total of 0 to 60. It sums the ratings a clinician assigns. It is not a diagnosis of bipolar disorder or of a manic episode, not a capacity assessment, and not an indication for admission, an involuntary hold, restraint, or any medication; substance intoxication, delirium, and agitated psychosis can all raise the score. The scale defines no severity bands of its own. Trials commonly treat a total of 12 or less as remission, which is a convention rather than a rule the scale states.',
    compute: C.ymrs,
    fields: C.YMRS_ITEMS.map((item, i) => ({
      dom: `ym-q${i + 1}`,
      arg: `q${i + 1}`,
      kind: 'enum',
      values: valuesTo(item.max),
      label: `${i + 1}. ${item.label} (0 to ${item.max})`,
    })),
  },
];
