// spec-v1061 MCP adapter: the Short Opiate Withdrawal Scale in lib/sows-v1061.js. The dom keys
// mirror the browser renderer (views/group-v1061.js) and META['sows'].example.
//
// Every item is `required`. That is not boilerplate here: the scale is monotone, so an agent that
// omits a symptom would otherwise receive a total that is a lower bound presented as a score. The
// library refuses that case on its own (it returns `incomplete` with what is outstanding), and the
// declaration makes the refusal happen a step earlier, with the field named -- which is what
// spec-v1037's sweep asks of every calculator.

import { sows, SOWS_ITEMS } from '../../lib/sows-v1061.js';

const SEVERITY = ['0', '1', '2', '3'];

export default [
  {
    id: 'sows',
    summary: 'Short Opiate Withdrawal Scale (Gossop 1990): the PATIENT rates ten withdrawal symptoms 0-3 (none to severe) for a total of 0-30. Higher is a more severe withdrawal and a change of 2-4 points is the smallest usually treated as meaningful. The scale publishes no severity bands -- unlike the clinician-rated COWS it names no score at which withdrawal is mild or moderate, and this tool does not invent one.',
    compute: sows,
    fields: SOWS_ITEMS.map((item) => ({
      dom: `sw-${item.key}`,
      arg: item.key,
      kind: 'number',
      required: true,
      label: item.label,
      values: SEVERITY,
    })),
  },
];
