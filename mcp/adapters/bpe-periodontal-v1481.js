// spec-v1481: MCP adapter. The dom keys mirror views/group-v1481.js and this tile's META example.

import * as BP from '../../lib/bpe-periodontal-v1481.js';

const CODES = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'bpe-periodontal',
    summary: 'Basic Periodontal Examination: the highest code across six sextants and the charting it calls for. Codes 3 and 4 indicate periodontitis; any code 4 calls for full charting.',
    compute: BP.bpePeriodontal,
    fields: [
      { dom: 'bpe-ur', arg: 'ur', kind: 'enum', required: false, values: CODES, label: 'Upper right sextant code' },
      { dom: 'bpe-ua', arg: 'ua', kind: 'enum', required: false, values: CODES, label: 'Upper anterior sextant code' },
      { dom: 'bpe-ul', arg: 'ul', kind: 'enum', required: false, values: CODES, label: 'Upper left sextant code' },
      { dom: 'bpe-ll', arg: 'll', kind: 'enum', required: false, values: CODES, label: 'Lower left sextant code' },
      { dom: 'bpe-la', arg: 'la', kind: 'enum', required: false, values: CODES, label: 'Lower anterior sextant code' },
      { dom: 'bpe-lr', arg: 'lr', kind: 'enum', required: false, values: CODES, label: 'Lower right sextant code' },
      { dom: 'bpe-furcation', arg: 'furcation', kind: 'bool', required: false, label: 'Furcation involvement in a sextant (*)' },
    ],
  },
];
