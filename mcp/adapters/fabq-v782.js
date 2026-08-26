// spec-v782 MCP adapter: FABQ in lib/fabq-v782.js.
// The dom keys mirror the browser renderer (views/group-v782.js) and META['fabq'].example.
// Sixteen 0-6 enums, of which only eleven are scored. Clinical domain.

import { fabq } from '../../lib/fabq-v782.js';

const RATE = ['0', '1', '2', '3', '4', '5', '6'];
const ROWS = [
  ['q1', 'Item 1 - Pain caused by physical activity (not scored)'],
  ['q2', 'Item 2 - Activity makes pain worse (PA)'],
  ['q3', 'Item 3 - Activity might harm the back (PA)'],
  ['q4', 'Item 4 - Should avoid painful activity (PA)'],
  ['q5', 'Item 5 - Cannot do painful activity (PA)'],
  ['q6', 'Item 6 - Pain caused by work (Work)'],
  ['q7', 'Item 7 - Work made the pain worse (Work)'],
  ['q8', 'Item 8 - Has a compensation claim (not scored)'],
  ['q9', 'Item 9 - The work is too heavy (Work)'],
  ['q10', 'Item 10 - Work makes the pain worse (Work)'],
  ['q11', 'Item 11 - Work might harm the back (Work)'],
  ['q12', 'Item 12 - Should not do normal work now (Work)'],
  ['q13', 'Item 13 - Cannot do normal work now (not scored)'],
  ['q14', 'Item 14 - Cannot work until treated (not scored)'],
  ['q15', 'Item 15 - Not back at work in 3 months (Work)'],
  ['q16', 'Item 16 - Never returning to that work (not scored)'],
];

export default [
  {
    id: 'fabq',
    summary: 'Fear-Avoidance Beliefs Questionnaire (FABQ; Waddell 1993): how far someone believes activity or work will harm their back. Sixteen statements rated 0 (completely disagree) to 6 (completely agree), of which only eleven are scored - physical activity sums items 2,3,4,5 (0-24) and work sums items 6,7,9,10,11,12,15 (0-42). Items 1,8,13,14,16 are asked but scored in neither. The two subscales are reported separately and never added; higher is stronger fear-avoidance belief.',
    compute: fabq,
    fields: ROWS.map(([arg, label]) => ({ dom: `fabq-${arg}`, arg, kind: 'enum', values: RATE, required: false, label })),
  },
];
