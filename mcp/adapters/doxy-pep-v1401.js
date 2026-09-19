// spec-v1401: MCP adapter. The dom keys mirror views/group-v1401.js and this tile's META example.

import * as DX from '../../lib/doxy-pep-v1401.js';

export default [
  {
    id: 'doxy-pep',
    summary: 'States CDC\'s 2024 recommendation on doxycycline postexposure prophylaxis for bacterial STIs. MSM and transgender women with syphilis, chlamydia, or gonorrhea in the past 12 months should be offered doxycycline 200 mg within 72 hours after sex, no more than 200 mg per 24 hours, with STI testing every 3 to 6 months. CDC makes no recommendation for other populations.',
    compute: DX.doxyPep,
    fields: [
      { dom: 'dx-pop', arg: 'population', kind: 'enum', required: true, label: 'Population', values: DX.POPULATIONS.map((p) => p.value) },
      { dom: 'dx-sti', arg: 'recentSti', kind: 'enum', label: 'Bacterial STI in the past 12 months', values: ['yes', 'no'] },
    ],
  },
];
