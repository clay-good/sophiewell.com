// spec-v780 MCP adapter: Copenhagen Burnout Inventory in lib/cbi-v780.js.
// The dom keys mirror the browser renderer (views/group-v780.js) and META['cbi'].example.
// Nineteen 0/25/50/75/100 enums across three independent scales; w7 is reverse scored by
// the lib, so pass the raw answer. Clinical domain.

import { cbi } from '../../lib/cbi-v780.js';

const RATE = ['0', '25', '50', '75', '100'];
const ROWS = [
  ['p1', 'Personal - feeling tired'],
  ['p2', 'Personal - physically exhausted'],
  ['p3', 'Personal - emotionally exhausted'],
  ['p4', 'Personal - cannot take any more'],
  ['p5', 'Personal - worn out'],
  ['p6', 'Personal - weak, prone to illness'],
  ['w1', 'Work - emotionally exhausting'],
  ['w2', 'Work - feeling burnt out'],
  ['w3', 'Work - work frustrates you'],
  ['w4', 'Work - worn out at day end'],
  ['w5', 'Work - exhausted in the morning'],
  ['w6', 'Work - every hour tiring'],
  ['w7', 'Work - energy left (reverse)'],
  ['c1', 'Client - hard to work with'],
  ['c2', 'Client - frustrating to work with'],
  ['c3', 'Client - drains your energy'],
  ['c4', 'Client - give more than you get'],
  ['c5', 'Client - tired of the work'],
  ['c6', 'Client - how long you can go on'],
];

export default [
  {
    id: 'cbi',
    summary: 'Copenhagen Burnout Inventory (CBI; Kristensen 2005): three independent burnout scales - personal (6 items), work-related (7 items), client-related (6 items). Every item scores 100/75/50/25/0 from the most to the least burnt-out answer and each scale is the average of the items answered, so each runs 0-100 with higher meaning more burnt out. Item w7 is reverse scored (pass the raw answer). The scales are never summed. A scale is reported only once at least 3 items are answered, or 4 on the work scale.',
    compute: cbi,
    fields: ROWS.map(([arg, label]) => ({ dom: `cbi-${arg}`, arg, kind: 'enum', values: RATE, required: false, label })),
  },
];
