// spec-v733 MCP adapter: Chalder Fatigue Scale (CFQ-11) in lib/chalder-fatigue-v733.js.
// The dom keys mirror the browser renderer (views/group-v733.js) and META['chalder-fatigue'].example.
// Eleven 0-3 enums; the bimodal sum 0-11 maps to a fatigue-caseness band. Clinical domain.

import { chalderFatigue } from '../../lib/chalder-fatigue-v733.js';

const RATE = ['0', '1', '2', '3'];

export default [
  {
    id: 'chalder-fatigue',
    summary: "Chalder Fatigue Scale (CFQ-11; Chalder 1993): 11-item self-report of physical (items 1-7) and mental (items 8-11) fatigue, each rated 0-3. Likert scoring sums to 0-33; bimodal scoring (0/1->0, 2/3->1) sums to 0-11, with a bimodal total of 4 or more indicating fatigue caseness. Higher = more fatigue.",
    compute: chalderFatigue,
    fields: [
      { dom: 'cfq-q1', arg: 'q1', kind: 'enum', values: RATE, required: true, label: 'Item 1 - tiredness (0-3)' },
      { dom: 'cfq-q2', arg: 'q2', kind: 'enum', values: RATE, required: true, label: 'Item 2 - need to rest (0-3)' },
      { dom: 'cfq-q3', arg: 'q3', kind: 'enum', values: RATE, required: true, label: 'Item 3 - sleepy or drowsy (0-3)' },
      { dom: 'cfq-q4', arg: 'q4', kind: 'enum', values: RATE, required: true, label: 'Item 4 - difficulty starting things (0-3)' },
      { dom: 'cfq-q5', arg: 'q5', kind: 'enum', values: RATE, required: true, label: 'Item 5 - lacking energy (0-3)' },
      { dom: 'cfq-q6', arg: 'q6', kind: 'enum', values: RATE, required: true, label: 'Item 6 - less strength (0-3)' },
      { dom: 'cfq-q7', arg: 'q7', kind: 'enum', values: RATE, required: true, label: 'Item 7 - feeling weak (0-3)' },
      { dom: 'cfq-q8', arg: 'q8', kind: 'enum', values: RATE, required: true, label: 'Item 8 - difficulty concentrating (0-3)' },
      { dom: 'cfq-q9', arg: 'q9', kind: 'enum', values: RATE, required: true, label: 'Item 9 - slips of the tongue (0-3)' },
      { dom: 'cfq-q10', arg: 'q10', kind: 'enum', values: RATE, required: true, label: 'Item 10 - finding the right word (0-3)' },
      { dom: 'cfq-q11', arg: 'q11', kind: 'enum', values: RATE, required: true, label: 'Item 11 - memory (0-3)' },
    ],
  },
];
