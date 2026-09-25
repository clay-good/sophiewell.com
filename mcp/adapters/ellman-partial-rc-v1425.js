// spec-v1425: MCP adapter. The dom keys mirror views/group-v1425.js and this tile's META example.

import * as EL from '../../lib/ellman-partial-rc-v1425.js';

export default [
  {
    id: 'ellman-partial-rc',
    summary: 'Grades a partial-thickness rotator cuff tear seen at arthroscopy by the Ellman classification, from its side and depth. The side sets type A (articular), B (bursal) or C (intratendinous); depth under 3 mm is grade 1, 3 to 6 mm grade 2 and over 6 mm grade 3. Surgeons agree on the side far better than on the grade.',
    compute: EL.ellmanPartialRc,
    fields: [
      { dom: 'ellm-loc', arg: 'location', kind: 'enum', required: true, label: 'Where the tear is', values: EL.ELLM_LOCATION.map((x) => x.value) },
      { dom: 'ellm-depth', arg: 'depthMm', kind: 'number', unit: 'mm', label: 'Tear depth (needed for a partial tear)' },
    ],
  },
];
