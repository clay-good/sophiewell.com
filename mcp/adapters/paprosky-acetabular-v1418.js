// spec-v1418: MCP adapter. The dom keys mirror views/group-v1418.js and this tile's META example.

import * as PA from '../../lib/paprosky-acetabular-v1418.js';

export default [
  {
    id: 'paprosky-acetabular',
    summary: 'Derives the Paprosky type (1, 2A to 2C, 3A or 3B) of acetabular bone loss before revision hip arthroplasty from the radiograph. Hip center migration sets the grade and its direction or the Kohler line the subtype; the teardrop and ischium, if entered, are checked against the published table.',
    compute: PA.paproskyAcetabular,
    fields: [
      { dom: 'pap-migration', arg: 'migration', kind: 'enum', required: true, label: 'Hip center migration', values: PA.PAP_MIGRATION.map((x) => x.value) },
      { dom: 'pap-direction', arg: 'direction', kind: 'enum', label: 'Direction of migration', values: PA.PAP_DIRECTION.map((x) => x.value) },
      { dom: 'pap-kohler', arg: 'kohler', kind: 'enum', required: true, label: 'Kohler line (anterior column)', values: PA.PAP_KOHLER.map((x) => x.value) },
      { dom: 'pap-teardrop', arg: 'teardrop', kind: 'enum', label: 'Teardrop (medial wall)', values: PA.PAP_LYSIS.map((x) => x.value) },
      { dom: 'pap-ischium', arg: 'ischium', kind: 'enum', label: 'Ischium (posterior column)', values: PA.PAP_LYSIS.map((x) => x.value) },
    ],
  },
];
