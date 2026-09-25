// spec-v1485: MCP adapter. The dom keys mirror views/group-v1485.js and this tile's META example.

import * as IC from '../../lib/icdas-caries-v1485.js';

const CODES = ['0', '1', '2', '3', '4', '5', '6'];

export default [
  {
    id: 'icdas-caries',
    summary: 'ICDAS caries codes 0 to 6 with their merged severity. Up to six surfaces are read as sound, initial, moderate or extensive, and the most severe is named.',
    compute: IC.icdasCaries,
    fields: IC.ICDAS_SURFACES.map((k, i) => ({ dom: `icdas-${k}`, arg: k, kind: 'enum', required: false, values: CODES, label: `Surface ${i + 1} ICDAS code` })),
  },
];
