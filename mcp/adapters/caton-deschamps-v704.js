// spec-v704 MCP adapter: Caton-Deschamps patellar-height index in
// lib/caton-deschamps-v704.js. The dom keys mirror the browser renderer
// (views/group-v704.js) and META['caton-deschamps'].example. Two millimetre distances; a
// ratio returns the index. Clinical domain.

import { catonDeschamps } from '../../lib/caton-deschamps-v704.js';

export default [
  {
    id: 'caton-deschamps',
    summary: 'Caton-Deschamps index of patellar height (Caton 1982): index = A / B, where A = distance from the inferior patellar articular surface to the anterosuperior tibial plateau and B = patellar articular surface length (mm), on a lateral knee radiograph at ~30 deg flexion. Normal ~0.6-1.2; < 0.6 patella baja (infera); > 1.2 patella alta. Companion to the Insall-Salvati ratio.',
    compute: catonDeschamps,
    fields: [
      { dom: 'cd-a', arg: 'distanceA', kind: 'number', unit: 'mm', required: true, label: 'Distance A (inferior articular surface to tibial plateau, mm)' },
      { dom: 'cd-b', arg: 'lengthB', kind: 'number', unit: 'mm', required: true, label: 'Length B (patellar articular surface, mm)' },
    ],
  },
];
