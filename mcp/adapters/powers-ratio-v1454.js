// spec-v1454: MCP adapter. The dom keys mirror views/group-v1454.js and this tile's META example.

import * as PW from '../../lib/powers-ratio-v1454.js';

export default [
  {
    id: 'powers-ratio',
    summary: 'Computes the Powers ratio for anterior atlanto-occipital dissociation from two distances on a lateral radiograph or CT. The basion to C1 spinolaminar line distance is divided by the opisthion to C1 anterior arch distance and read against the normal limit for the modality (1.0 on radiographs, 0.9 on CT); a basion-dens interval, if entered, is read against its own limit.',
    compute: PW.powersRatio,
    fields: [
      { dom: 'pwr-bc', arg: 'bc', kind: 'number', required: true, label: 'Basion to the spinolaminar line of C1 (BC)', unit: 'mm' },
      { dom: 'pwr-oa', arg: 'oa', kind: 'number', required: true, label: 'Opisthion to the anterior arch of C1 (OA)', unit: 'mm' },
      { dom: 'pwr-modality', arg: 'modality', kind: 'enum', required: true, label: 'Measured on', values: PW.POWERS_MODALITY.map((x) => x.value) },
      { dom: 'pwr-bdi', arg: 'bdi', kind: 'number', label: 'Basion-dens interval', unit: 'mm' },
    ],
  },
];
