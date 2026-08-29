// spec-v856 MCP adapter: the five essential IRLSSG criteria in lib/rls-criteria-v856.js. The
// dom keys mirror the browser renderer (views/group-v856.js) and META['rls-criteria'].example.
//
// All five are essential. Do not treat a partial set as a partial diagnosis, and do not pass
// notOtherCondition as true unless the mimics have actually been considered. Clinical domain.

import { rlsCriteria } from '../../lib/rls-criteria-v856.js';

export default [
  {
    id: 'rls-criteria',
    summary: 'Applies the five essential criteria for restless legs syndrome. There must be an urge to move the legs usually with an uncomfortable sensation, beginning or worsening during rest, relieved by movement for as long as it continues, worse in the evening or at night than during the day, and not better accounted for by another condition. ALL FIVE ARE ESSENTIAL, so this is not a score and four of five is not a partial diagnosis. THE FIFTH CARRIES THE SPECIFICITY: leg cramps, positional discomfort, muscle pain, venous stasis, swollen legs, arthritis and habitual foot tapping all satisfy the first four, which is why it was added in 2014. Clinical significance and the course are specifiers rather than criteria. It does not select treatment or assess iron status.',
    compute: rlsCriteria,
    fields: [
      { dom: 'rlsc-urge', arg: 'urge', kind: 'boolean', required: false, label: 'An urge to move the legs, usually with an uncomfortable sensation in them' },
      { dom: 'rlsc-rest', arg: 'atRest', kind: 'boolean', required: false, label: 'It begins or worsens during rest or inactivity' },
      { dom: 'rlsc-move', arg: 'relievedByMovement', kind: 'boolean', required: false, label: 'It is relieved by movement, for as long as the movement continues' },
      { dom: 'rlsc-night', arg: 'worseAtNight', kind: 'boolean', required: false, label: 'It is worse in the evening or at night than during the day' },
      { dom: 'rlsc-other', arg: 'notOtherCondition', kind: 'boolean', required: false, label: 'It is not better accounted for by another condition such as leg cramps' },
      { dom: 'rlsc-sig', arg: 'clinicallySignificant', kind: 'boolean', required: false, label: 'The symptoms cause distress or interfere with sleep or functioning' },
      { dom: 'rlsc-freq', arg: 'twiceWeeklyPastYear', kind: 'boolean', required: false, label: 'On average at least twice a week over the past year' },
      { dom: 'rlsc-five', arg: 'fiveLifetimeEvents', kind: 'boolean', required: false, label: 'Otherwise, at least five events in a lifetime' },
    ],
  },
];
