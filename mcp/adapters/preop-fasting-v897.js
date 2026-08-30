// spec-v897 MCP adapter: the preoperative fasting intervals in lib/preop-fasting-v897.js. The dom
// keys mirror the browser renderer (views/group-v897.js) and META['preop-fasting'].example.
//
// The intervals are MINIMUMS measured to induction. Clinical domain.

import { preopFasting } from '../../lib/preop-fasting-v897.js';

export default [
  {
    id: 'preop-fasting',
    summary: 'Compares an elapsed fasting interval against the minimum for what was last taken, from the 2023 practice guidelines. Clear liquids two hours; breast milk four; infant formula six; nonhuman milk or a light meal six; fried or fatty food or meat eight or more. THESE ARE MINIMUMS, NOT TARGETS, and nothing by mouth after midnight is the practice the guideline was written against, since prolonged fasting is not safer and causes thirst, hypoglycemia, irritability and hypovolemia. THE CLOCK RUNS TO INDUCTION, not to the scheduled time, so a delayed case lengthens a fast rather than extending one already served. CLEAR MEANS CLEAR: anything with milk in it does not qualify. The table is for an elective procedure without impaired gastric emptying and never guarantees an empty stomach.',
    compute: preopFasting,
    fields: [
      { dom: 'pf-lastintake', arg: 'lastIntake', kind: 'enum', required: false, label: 'What was last taken', values: ['clear-liquid', 'breast-milk', 'formula', 'light-meal', 'heavy-meal'] },
      { dom: 'pf-hourssinceintake', arg: 'hoursSinceIntake', kind: 'number', required: false, label: 'Hours since then, counted to induction rather than to the scheduled time', unit: 'h' },
    ],
  },
];
