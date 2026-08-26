// spec-v793 MCP adapter: Simple Shoulder Test in lib/simple-shoulder-test-v793.js.
// The dom keys mirror the browser renderer (views/group-v793.js) and
// META['simple-shoulder-test'].example. Twelve equally weighted yes booleans. Clinical domain.

import { simpleShoulderTest } from '../../lib/simple-shoulder-test-v793.js';

export default [
  {
    id: 'simple-shoulder-test',
    summary: 'Simple Shoulder Test (Lippitt, Harryman and Matsen 1993): twelve yes-or-no questions about what a shoulder can do - comfort at rest and in bed, reaching behind the back and head, lifting one pound, eight pounds and twenty pounds, throwing, washing the opposite shoulder, and working full-time. Each yes scores 1, giving 0-12; higher is better. No subscales and no weights - every question counts the same.',
    compute: simpleShoulderTest,
    fields: [
      { dom: 'sst-rest', arg: 'comfortAtRest', kind: 'boolean', required: false, label: 'Shoulder is comfortable with the arm at rest...' },
      { dom: 'sst-sleep', arg: 'sleepComfortably', kind: 'boolean', required: false, label: 'Shoulder allows sleeping comfortably' },
      { dom: 'sst-back', arg: 'reachSmallOfBack', kind: 'boolean', required: false, label: 'Can reach the small of the back to tuck in a...' },
      { dom: 'sst-head', arg: 'handBehindHead', kind: 'boolean', required: false, label: 'Can place the hand behind the head with the ...' },
      { dom: 'sst-coin', arg: 'coinOnShelf', kind: 'boolean', required: false, label: 'Can place a coin on a shelf at shoulder leve...' },
      { dom: 'sst-lift1', arg: 'liftOnePound', kind: 'boolean', required: false, label: 'Can lift one pound to shoulder level without...' },
      { dom: 'sst-lift8', arg: 'liftEightPounds', kind: 'boolean', required: false, label: 'Can lift eight pounds to shoulder level with...' },
      { dom: 'sst-carry20', arg: 'carryTwentyPounds', kind: 'boolean', required: false, label: 'Can carry twenty pounds at the side' },
      { dom: 'sst-under', arg: 'tossUnderhand', kind: 'boolean', required: false, label: 'Could toss a ball underhand twenty yards' },
      { dom: 'sst-over', arg: 'tossOverhand', kind: 'boolean', required: false, label: 'Could toss a ball overhand twenty yards' },
      { dom: 'sst-wash', arg: 'washOppositeShoulder', kind: 'boolean', required: false, label: 'Can wash the back of the opposite shoulder' },
      { dom: 'sst-work', arg: 'workFullTime', kind: 'boolean', required: false, label: 'Shoulder allows working full-time at the reg...' },
    ],
  },
];
