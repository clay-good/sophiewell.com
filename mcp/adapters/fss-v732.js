// spec-v732 MCP adapter: Fatigue Severity Scale in lib/fss-v732.js.
// The dom keys mirror the browser renderer (views/group-v732.js) and META['fss'].example.
// Nine 1-7 enums; the mean 1-7 maps to a fatigue-significance band. Clinical domain.

import { fss } from '../../lib/fss-v732.js';

const RATE = ['1', '2', '3', '4', '5', '6', '7'];

export default [
  {
    id: 'fss',
    summary: "Fatigue Severity Scale (FSS; Krupp 1989): 9-item self-report of fatigue impact on motivation, exercise, functioning, and daily life. Each statement rated 1 (strongly disagree) to 7 (strongly agree); the score is the mean of the 9 ratings (1-7). Higher = more fatigue; a mean of 4 or greater indicates clinically significant fatigue.",
    compute: fss,
    fields: [
      { dom: 'fss-q1', arg: 'q1', kind: 'enum', values: RATE, required: true, label: 'Item 1 - motivation (1-7)' },
      { dom: 'fss-q2', arg: 'q2', kind: 'enum', values: RATE, required: true, label: 'Item 2 - exercise (1-7)' },
      { dom: 'fss-q3', arg: 'q3', kind: 'enum', values: RATE, required: true, label: 'Item 3 - easily fatigued (1-7)' },
      { dom: 'fss-q4', arg: 'q4', kind: 'enum', values: RATE, required: true, label: 'Item 4 - physical functioning (1-7)' },
      { dom: 'fss-q5', arg: 'q5', kind: 'enum', values: RATE, required: true, label: 'Item 5 - frequent problems (1-7)' },
      { dom: 'fss-q6', arg: 'q6', kind: 'enum', values: RATE, required: true, label: 'Item 6 - sustained functioning (1-7)' },
      { dom: 'fss-q7', arg: 'q7', kind: 'enum', values: RATE, required: true, label: 'Item 7 - duties (1-7)' },
      { dom: 'fss-q8', arg: 'q8', kind: 'enum', values: RATE, required: true, label: 'Item 8 - disabling symptom (1-7)' },
      { dom: 'fss-q9', arg: 'q9', kind: 'enum', values: RATE, required: true, label: 'Item 9 - work, family, social (1-7)' },
    ],
  },
];
