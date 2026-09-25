// spec-v1495: MCP adapter. The dom keys mirror views/group-v1495.js and this tile's META example.

import * as OH from '../../lib/ohat-oral-health-v1495.js';

export default [
  {
    id: 'ohat-oral-health',
    summary: 'Oral Health Assessment Tool: eight items rated healthy, changes or unhealthy, totaled out of 16, with the unhealthy items named.',
    compute: OH.ohatOralHealth,
    fields: OH.OHAT_ITEMS.map(([k, label]) => ({ dom: `ohat-${k}`, arg: k, kind: 'enum', required: false, values: ['0', '1', '2'], label })),
  },
];
