// spec-v1493: MCP adapter. The dom keys mirror views/group-v1493.js and this tile's META example.

import * as EI from '../../lib/eichner-index-v1493.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'eichner-index',
    summary: 'Eichner index of occlusal support, A1 to C3, from the posterior support zones in contact.',
    compute: EI.eichnerIndex,
    fields: [
      { dom: 'ei-zones', arg: 'zones', kind: 'enum', required: true, values: vals(EI.ZONES), label: 'Posterior support zones in contact' },
      { dom: 'ei-missing', arg: 'missing', kind: 'enum', required: false, values: vals(EI.MISSING), label: 'With four zones: teeth missing in none, one or both arches' },
      { dom: 'ei-anterior', arg: 'anterior', kind: 'enum', required: false, values: vals(EI.YES_NO), label: 'With no zones: anterior teeth in contact' },
      { dom: 'ei-arches', arg: 'arches', kind: 'enum', required: false, values: vals(EI.ARCHES), label: 'With no contact: teeth in both arches, one arch or none' },
    ],
  },
];
