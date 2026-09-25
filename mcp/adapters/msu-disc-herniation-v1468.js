// spec-v1468: MCP adapter. The dom keys mirror views/group-v1468.js and this tile's META example.

import * as MS from '../../lib/msu-disc-herniation-v1468.js';

export default [
  {
    id: 'msu-disc-herniation',
    summary: 'Classifies a lumbar disc herniation on T2 axial MRI by the MSU system: size 1, 2 or 3 and location zone A, AB, B or C. Size comes from the chosen grade or from two measurements against the intra-facet line; complete measurements decide it.',
    compute: MS.msuDiscHerniation,
    fields: [
      { dom: 'msu-size', arg: 'size', kind: 'enum', required: false, label: 'Size (or give both measurements instead)', values: MS.MSU_SIZES.map((x) => x.value) },
      { dom: 'msu-dist', arg: 'dist', kind: 'number', required: false, label: 'Distance from the posterior disc (or vertebral endplate) to the intra-facet line', unit: 'mm' },
      { dom: 'msu-extent', arg: 'extent', kind: 'number', required: false, label: 'How far the herniation extends from that same point', unit: 'mm' },
      { dom: 'msu-zone', arg: 'zone', kind: 'enum', required: true, label: 'Location zone where the herniation intrudes furthest', values: MS.MSU_ZONES.map((x) => x.value) },
    ],
  },
];
