// spec-v785 MCP adapter: OLBI in lib/olbi-v785.js.
// The dom keys mirror the browser renderer (views/group-v785.js) and META['olbi'].example.
// Sixteen agree-to-disagree enums; pass the RAW answer, the lib applies the direction.
// Clinical domain.

import { olbi } from '../../lib/olbi-v785.js';

const ANSWER = ['strongly-agree', 'agree', 'disagree', 'strongly-disagree'];
const ROWS = [
  ['q1', 'Item 1 (disengagement, as worded)'],
  ['q2', 'Item 2 (exhaustion, reverse)'],
  ['q3', 'Item 3 (disengagement, reverse)'],
  ['q4', 'Item 4 (exhaustion, reverse)'],
  ['q5', 'Item 5 (exhaustion, as worded)'],
  ['q6', 'Item 6 (disengagement, reverse)'],
  ['q7', 'Item 7 (disengagement, as worded)'],
  ['q8', 'Item 8 (exhaustion, reverse)'],
  ['q9', 'Item 9 (disengagement, reverse)'],
  ['q10', 'Item 10 (exhaustion, as worded)'],
  ['q11', 'Item 11 (disengagement, reverse)'],
  ['q12', 'Item 12 (exhaustion, reverse)'],
  ['q13', 'Item 13 (disengagement, as worded)'],
  ['q14', 'Item 14 (exhaustion, as worded)'],
  ['q15', 'Item 15 (disengagement, as worded)'],
  ['q16', 'Item 16 (exhaustion, as worded)'],
];

export default [
  {
    id: 'olbi',
    summary: 'Oldenburg Burnout Inventory (OLBI; Demerouti 2003): burnout as exhaustion plus disengagement from the work. Sixteen statements answered strongly-agree to strongly-disagree; exhaustion sums items 2,4,5,8,10,12,14,16 and disengagement sums items 1,3,6,7,9,11,13,15, each 8-32, total 16-64, higher is more burnout. Items 2,3,4,6,8,9,11,12 are REVERSE scored and both subscales mix directions, so pass the raw answer and let the tool apply the direction. No consensus cutoff exists, so none is asserted.',
    compute: olbi,
    fields: ROWS.map(([arg, label]) => ({ dom: `olbi-${arg}`, arg, kind: 'enum', values: ANSWER, required: true, label })),
  },
];
