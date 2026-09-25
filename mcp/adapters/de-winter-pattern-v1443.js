// spec-v1443: MCP adapter. The dom keys mirror views/group-v1443.js and this tile's META example.

import * as DW from '../../lib/de-winter-pattern-v1443.js';

const YN = DW.DEWINTER_YES_NO.map((x) => x.value);

export default [
  {
    id: 'de-winter-pattern',
    summary: 'Checks a 12-lead tracing for the de Winter pattern, a STEMI equivalent of proximal LAD occlusion without ST elevation. It needs upsloping J-point ST depression with tall, symmetrical precordial T waves and no contiguous ST elevation.',
    compute: DW.deWinterPattern,
    fields: [
      { dom: 'dw-std', arg: 'stDepression', kind: 'enum', required: true, label: 'Upsloping J-point ST depression over 1 mm, precordial', values: YN },
      { dom: 'dw-tallt', arg: 'tallT', kind: 'enum', required: true, label: 'Tall, symmetrical precordial T waves', values: YN },
      { dom: 'dw-ste', arg: 'stElevation', kind: 'enum', required: true, label: 'Contiguous precordial ST elevation', values: YN },
      { dom: 'dw-avr', arg: 'avr', kind: 'enum', required: true, label: 'ST elevation in aVR', values: YN },
    ],
  },
];
