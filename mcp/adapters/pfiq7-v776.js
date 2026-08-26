// spec-v776 MCP adapter: PFIQ-7 in lib/pfiq7-v776.js.
// The dom keys mirror the browser renderer (views/group-v776.js) and META['pfiq7'].example.
// The same seven life-impact questions in three scales, each the mean of its answered items
// times 100/3. Clinical domain.

import { pfiq7 } from '../../lib/pfiq7-v776.js';

const RATE = ['0', '1', '2', '3'];
const ROWS = [
  ['u1', 'Bladder effect on chores (0-3)'],
  ['u2', 'Bladder effect on exercise (0-3)'],
  ['u3', 'Bladder effect on entertainment (0-3)'],
  ['u4', 'Bladder effect on travel (0-3)'],
  ['u5', 'Bladder effect on social life (0-3)'],
  ['u6', 'Bladder effect on emotional health (0-3)'],
  ['u7', 'Bladder effect on frustration (0-3)'],
  ['c1', 'Bowel effect on chores (0-3)'],
  ['c2', 'Bowel effect on exercise (0-3)'],
  ['c3', 'Bowel effect on entertainment (0-3)'],
  ['c4', 'Bowel effect on travel (0-3)'],
  ['c5', 'Bowel effect on social life (0-3)'],
  ['c6', 'Bowel effect on emotional health (0-3)'],
  ['c7', 'Bowel effect on frustration (0-3)'],
  ['p1', 'Pelvis effect on chores (0-3)'],
  ['p2', 'Pelvis effect on exercise (0-3)'],
  ['p3', 'Pelvis effect on entertainment (0-3)'],
  ['p4', 'Pelvis effect on travel (0-3)'],
  ['p5', 'Pelvis effect on social life (0-3)'],
  ['p6', 'Pelvis effect on emotional health (0-3)'],
  ['p7', 'Pelvis effect on frustration (0-3)'],
];

export default [
  {
    id: 'pfiq7',
    summary: 'PFIQ-7 (Barber 2005): short-form Pelvic Floor Impact Questionnaire. The same seven questions about everyday life are asked three times, once about bladder symptoms (UIQ-7), once about bowel symptoms (CRAIQ-7) and once about vaginal or pelvic symptoms (POPIQ-7). Items are rated 0 (not at all) to 3 (quite a bit); each scale is the mean of its answered items times 100/3 (0-100) and the summary adds the three (0-300). Higher means more interference with daily life.',
    compute: pfiq7,
    fields: ROWS.map(([arg, label]) => ({ dom: `pfiq-${arg}`, arg, kind: 'enum', values: RATE, required: false, label })),
  },
];
