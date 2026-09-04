// spec-v1062 MCP adapter: the Subjective Opiate Withdrawal Scale in lib/sows-subjective-v1062.js.
// The dom keys mirror views/group-v1062.js and META['sows-subjective'].example.
//
// Every item is required, for the reason spec-v1061's adapter gives: the scale is monotone, so an
// omitted symptom would otherwise return a lower bound presented as a score.

import { sowsSubjective, SOWS_SUBJECTIVE_ITEMS } from '../../lib/sows-subjective-v1062.js';

const SEVERITY = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'sows-subjective',
    summary: 'Subjective Opiate Withdrawal Scale (Handelsman 1987): the PATIENT rates sixteen withdrawal symptoms from "not at all" to "extremely", 0-4 each, for a total of 0-64. Higher is a more severe withdrawal. It publishes no severity bands for the sixteen-item scale -- bands that circulate belong to a fifteen-item modified version scored out of 60 -- and this tool does not borrow them. Not the same instrument as the ten-item SHORT Opiate Withdrawal Scale (Gossop 1990), which is `sows`.',
    compute: sowsSubjective,
    fields: SOWS_SUBJECTIVE_ITEMS.map((item) => ({
      dom: `ssw-${item.key}`,
      arg: item.key,
      kind: 'number',
      required: true,
      label: item.label,
      values: SEVERITY,
    })),
  },
];
