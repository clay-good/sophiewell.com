// spec-v919 MCP adapter: the Just Culture behaviors and responses in lib/just-culture-v919.js.
// The dom keys mirror the browser renderer (views/group-v919.js) and META['just-culture'].example.
//
// The outcome is accepted and then reported as having changed nothing. Administrative domain.

import { justCulture } from '../../lib/just-culture-v919.js';

export default [
  {
    id: 'just-culture',
    summary: 'Reports the Just Culture response for a behavior that has already been characterized. Human error is an inadvertent slip, lapse or mistake: console the person and examine the system around them. At-risk behavior is a choice whose risk was not seen or was believed justified: coach, by removing the incentives that made the risky choice attractive and increasing situational awareness. Reckless behavior is conscious disregard of a substantial, unjustifiable risk: disciplinary action. THE RESPONSE FOLLOWS THE BEHAVIOR, NOT THE OUTCOME -- two people who do exactly the same thing get exactly the same response whether the patient was unharmed or died, so the outcome is accepted here and then reported as having changed nothing, which is what this model exists to replace. CONSOLE IS A RESPONSE, NOT THE ABSENCE OF ONE: human error is where the system gets examined. A repeat of the same at-risk choice after coaching is a reason to ask whether the coaching changed anything before escalating.',
    compute: justCulture,
    fields: [
      { dom: 'jc-behavior', arg: 'behavior', kind: 'enum', required: true, label: 'The behavior, as already characterized', values: ['unset', 'human-error', 'at-risk', 'reckless', 'knowing-harm'] },
      { dom: 'jc-outcome', arg: 'outcome', kind: 'enum', required: false, label: 'What happened to the patient (does not change the response)', values: ['unset', 'none', 'minor', 'serious', 'death'] },
      { dom: 'jc-repeated', arg: 'repeatedAfterCoaching', kind: 'boolean', required: false, label: 'The same at-risk choice has repeated after coaching' },
    ],
  },
];
