// spec-v1444: MCP adapter. The dom keys mirror views/group-v1444.js and this tile's META example.

import * as KA from '../../lib/kanavel-signs-v1444.js';

const PA = KA.KANAVEL_YES_NO.map((x) => x.value);

export default [
  {
    id: 'kanavel-signs',
    summary: 'Counts Kanavel\'s four cardinal signs of pyogenic flexor tenosynovitis in an affected finger. It says that only about half of confirmed cases show all four, so a lower count does not exclude the infection.',
    compute: KA.kanavelSigns,
    fields: [
      { dom: 'kan-flexed', arg: 'flexed', kind: 'enum', required: true, label: 'Resting flexed posture of the finger', values: PA },
      { dom: 'kan-swelling', arg: 'swelling', kind: 'enum', required: true, label: 'Fusiform swelling of the whole finger', values: PA },
      { dom: 'kan-tender', arg: 'tenderness', kind: 'enum', required: true, label: 'Tenderness along the flexor tendon sheath', values: PA },
      { dom: 'kan-passive', arg: 'passive', kind: 'enum', required: true, label: 'Pain on passive extension', values: PA },
    ],
  },
];
