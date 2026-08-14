// spec-v735 MCP adapter: Kessler K6 psychological distress in lib/k6-v735.js.
// The dom keys mirror the browser renderer (views/group-v735.js) and META['k6'].example.
// Six 0-4 enums; the sum 0-24 maps to a distress band. Clinical domain.

import { k6 } from '../../lib/k6-v735.js';

const RATE = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'k6',
    summary: "Kessler K6 psychological distress scale (Kessler 2003): 6-item self-report of nonspecific distress over the past 30 days (nervous, hopeless, restless, depressed, everything an effort, worthless), each rated 0 (none of the time) to 4 (all of the time), summed to 0-24. A total of 13 or more indicates probable serious mental illness; higher = more distress.",
    compute: k6,
    fields: [
      { dom: 'k6-q1', arg: 'q1', kind: 'enum', values: RATE, required: true, label: 'Nervous (0-4)' },
      { dom: 'k6-q2', arg: 'q2', kind: 'enum', values: RATE, required: true, label: 'Hopeless (0-4)' },
      { dom: 'k6-q3', arg: 'q3', kind: 'enum', values: RATE, required: true, label: 'Restless or fidgety (0-4)' },
      { dom: 'k6-q4', arg: 'q4', kind: 'enum', values: RATE, required: true, label: 'So depressed nothing could cheer you up (0-4)' },
      { dom: 'k6-q5', arg: 'q5', kind: 'enum', values: RATE, required: true, label: 'Everything was an effort (0-4)' },
      { dom: 'k6-q6', arg: 'q6', kind: 'enum', values: RATE, required: true, label: 'Worthless (0-4)' },
    ],
  },
];
