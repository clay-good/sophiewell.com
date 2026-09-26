// spec-v1571: MCP adapter. The dom keys mirror views/group-v1571.js and this tile's META example.

import * as GT from '../../lib/glenoid-track-v1571.js';

export default [
  {
    id: 'glenoid-track',
    summary: 'Glenoid track: on-track, near-track or off-track Hill-Sachs lesion from the glenoid width, the defect and the Hill-Sachs interval.',
    compute: GT.glenoidTrack,
    fields: [
      { dom: 'gt-width', arg: 'glenoidWidth', kind: 'number', required: true, label: 'Glenoid width (D)', unit: 'mm' },
      { dom: 'gt-defect', arg: 'defect', kind: 'number', required: true, label: 'Anterior glenoid defect (d), 0 if none', unit: 'mm' },
      { dom: 'gt-hs', arg: 'hsWidth', kind: 'number', required: true, label: 'Hill-Sachs lesion width', unit: 'mm' },
      { dom: 'gt-bridge', arg: 'bridge', kind: 'number', required: true, label: 'Bone bridge to the cuff footprint', unit: 'mm' },
    ],
  },
];
