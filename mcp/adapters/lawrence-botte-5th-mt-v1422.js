// spec-v1422: MCP adapter. The dom keys mirror views/group-v1422.js and this tile's META example.

import * as LB from '../../lib/lawrence-botte-5th-mt-v1422.js';

export default [
  {
    id: 'lawrence-botte-5th-mt',
    summary: 'Assigns the Lawrence and Botte zone (1, 2 or 3) of a proximal fifth metatarsal fracture from where it sits. Zone 1 is a tuberosity avulsion, zone 2 a Jones fracture of the metaphyseal-diaphyseal junction, zone 3 a diaphyseal stress fracture subtyped I to III by the Torg fracture-line and sclerosis findings.',
    compute: LB.lawrenceBotte5thMt,
    fields: [
      { dom: 'lb5-location', arg: 'location', kind: 'enum', required: true, label: 'Fracture location', values: LB.LB5_LOCATION.map((x) => x.value) },
      { dom: 'lb5-torg', arg: 'torg', kind: 'enum', label: 'Fracture line and medullary canal (zone 3)', values: LB.LB5_TORG.map((x) => x.value) },
    ],
  },
];
