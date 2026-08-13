// spec-v726 MCP adapter: Insomnia Severity Index in lib/isi-v726.js.
// The dom keys mirror the browser renderer (views/group-v726.js) and META['isi'].example.
// Seven 0-4 enums; the sum 0-28 maps to an insomnia-severity band. Clinical domain.

import { isi } from '../../lib/isi-v726.js';

export default [
  {
    id: 'isi',
    summary: 'Insomnia Severity Index (ISI; Bastien 2001): seven items each 0-4, summed to 0-28. Items: difficulty falling asleep, staying asleep, waking too early, dissatisfaction with sleep, how noticeable to others, worry/distress, interference with functioning. Bands: 0-7 none, 8-14 subthreshold, 15-21 moderate, 22-28 severe; >=15 correlates with clinical insomnia.',
    compute: isi,
    fields: [
      { dom: 'isi-fall', arg: 'fallingAsleep', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Difficulty falling asleep (0-4)' },
      { dom: 'isi-stay', arg: 'stayingAsleep', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Difficulty staying asleep (0-4)' },
      { dom: 'isi-early', arg: 'wakingEarly', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Waking up too early (0-4)' },
      { dom: 'isi-dissat', arg: 'dissatisfaction', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Dissatisfaction with sleep pattern (0-4)' },
      { dom: 'isi-notice', arg: 'noticeable', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'How noticeable to others (0-4)' },
      { dom: 'isi-worry', arg: 'worried', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Worry / distress about sleep (0-4)' },
      { dom: 'isi-interfere', arg: 'interference', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Interference with daily functioning (0-4)' },
    ],
  },
];
