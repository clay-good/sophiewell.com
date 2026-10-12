// spec-v1639 MCP adapter: epinephrine-device-weight-band in
// lib/epinephrine-device-weight-band-v1639.js. The dom keys mirror views/group-v1639.js and
// META['epinephrine-device-weight-band'].example. Clinical domain. Three label rows: EpiPen, Auvi-Q
// and neffy.

import * as EP from '../../lib/epinephrine-device-weight-band-v1639.js';

export default [
  {
    id: 'epinephrine-device-weight-band',
    summary: 'The labeled strength of each epinephrine device at a weight. Auvi-Q: 0.1 mg from 7.5 kg, 0.15 mg from 15 kg, 0.3 mg from 30 kg. EpiPen Jr 0.15 mg at 15 to 30 kg and EpiPen 0.3 mg at 30 kg or more. neffy nasal spray: 1 mg at 15 to under 30 kg, 2 mg at 30 kg or more. Says when a label does not cover the weight; selects no product.',
    compute: EP.epinephrineDeviceWeightBand,
    fields: [
      { dom: 'edw-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight' },
      { dom: 'edw-unit', arg: 'weightUnit', kind: 'enum', required: true, values: EP.UNITS.map((u) => u.value), label: 'Weight is in' },
    ],
  },
];
