// spec-v1451: MCP adapter. The dom keys mirror views/group-v1451.js and this tile's META example.

import * as RR from '../../lib/raymond-roy-v1451.js';

export default [
  {
    id: 'raymond-roy',
    summary: 'Derives the Raymond-Roy occlusion class (I, II, IIIa or IIIb) of a coiled aneurysm from where contrast fills on angiography. No filling is class I, the neck alone class II, and a residual sac class III, split by whether contrast sits within the coil interstices (IIIa) or along the aneurysm wall (IIIb).',
    compute: RR.raymondRoy,
    fields: [
      { dom: 'rroc-filling', arg: 'filling', kind: 'enum', required: true, label: 'Contrast filling of the aneurysm', values: RR.RR_FILLING.map((x) => x.value) },
      { dom: 'rroc-location', arg: 'location', kind: 'enum', label: 'Where the residual contrast sits (class III only)', values: RR.RR_LOCATION.map((x) => x.value) },
    ],
  },
];
