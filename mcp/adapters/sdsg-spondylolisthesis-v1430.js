// spec-v1430: MCP adapter. The dom keys mirror views/group-v1430.js and this tile's META example.

import * as SD from '../../lib/sdsg-spondylolisthesis-v1430.js';

export default [
  {
    id: 'sdsg-spondylolisthesis',
    summary: 'Sorts an L5-S1 developmental spondylolisthesis into Spinal Deformity Study Group types 1 to 6 from the lateral radiograph. A slip of 50% or less is typed by pelvic incidence; a higher slip by sacropelvic balance and then the C7 plumb line.',
    compute: SD.sdsgSpondylolisthesis,
    fields: [
      { dom: 'sdsg-slip', arg: 'slip', kind: 'number', required: true, label: 'Slip of L5 on S1', unit: '%' },
      { dom: 'sdsg-pi', arg: 'pi', kind: 'number', label: 'Pelvic incidence (slip of 50% or less)', unit: 'degrees' },
      { dom: 'sdsg-sacro', arg: 'sacropelvic', kind: 'enum', label: 'Sacropelvic balance (slip over 50%)', values: SD.SDSG_SACROPELVIC.map((x) => x.value) },
      { dom: 'sdsg-plumb', arg: 'plumb', kind: 'enum', label: 'C7 plumb line relative to the femoral heads', values: SD.SDSG_PLUMB.map((x) => x.value) },
    ],
  },
];
