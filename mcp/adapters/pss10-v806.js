// spec-v806 MCP adapter: PSS-10 in lib/pss10-v806.js.
// The dom keys mirror the browser renderer (views/group-v806.js) and META['pss10'].example.
// Pass the RAW answer; the lib applies the reversal for items 4, 5, 7 and 8. Clinical domain.

import { pss10 } from '../../lib/pss10-v806.js';

const RATE = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'pss10',
    summary: 'Scores the ten-item Perceived Stress Scale (Cohen 1983). Items run 0 (never) to 4 (very often) and the total is 0-40, higher meaning more perceived stress over the past month. Items 4, 5, 7 and 8 are REVERSE scored, so pass the raw answer and let the tool apply the direction. No cutoff is published for this scale and none is applied.',
    compute: pss10,
    fields: [
      { dom: 'pss-q1', arg: 'q1', kind: 'enum', values: RATE, required: true, label: 'Item 1 (as worded)' },
      { dom: 'pss-q2', arg: 'q2', kind: 'enum', values: RATE, required: true, label: 'Item 2 (as worded)' },
      { dom: 'pss-q3', arg: 'q3', kind: 'enum', values: RATE, required: true, label: 'Item 3 (as worded)' },
      { dom: 'pss-q4', arg: 'q4', kind: 'enum', values: RATE, required: true, label: 'Item 4 (reverse)' },
      { dom: 'pss-q5', arg: 'q5', kind: 'enum', values: RATE, required: true, label: 'Item 5 (reverse)' },
      { dom: 'pss-q6', arg: 'q6', kind: 'enum', values: RATE, required: true, label: 'Item 6 (as worded)' },
      { dom: 'pss-q7', arg: 'q7', kind: 'enum', values: RATE, required: true, label: 'Item 7 (reverse)' },
      { dom: 'pss-q8', arg: 'q8', kind: 'enum', values: RATE, required: true, label: 'Item 8 (reverse)' },
      { dom: 'pss-q9', arg: 'q9', kind: 'enum', values: RATE, required: true, label: 'Item 9 (as worded)' },
      { dom: 'pss-q10', arg: 'q10', kind: 'enum', values: RATE, required: true, label: 'Item 10 (as worded)' },
    ],
  },
];
