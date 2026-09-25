// spec-v1420: MCP adapter. The dom keys mirror views/group-v1420.js and this tile's META example.

import * as PF from '../../lib/paprosky-femoral-v1420.js';

export default [
  {
    id: 'paprosky-femoral',
    summary: 'Derives the Paprosky type (I, II, IIIA, IIIB or IV) of femoral bone loss before revision hip arthroplasty. Metaphyseal and diaphyseal loss set the grade; with extensive diaphyseal loss the isthmus decides type IV and 4 cm of intact diaphysis separates IIIA from IIIB.',
    compute: PF.paproskyFemoral,
    fields: [
      { dom: 'ppfem-metaphysis', arg: 'metaphysis', kind: 'enum', required: true, label: 'Metaphysis', values: PF.PPF_METAPHYSIS.map((x) => x.value) },
      { dom: 'ppfem-diaphysis', arg: 'diaphysis', kind: 'enum', required: true, label: 'Diaphysis', values: PF.PPF_DIAPHYSIS.map((x) => x.value) },
      { dom: 'ppfem-isthmus', arg: 'isthmus', kind: 'enum', label: 'Isthmus', values: PF.PPF_ISTHMUS.map((x) => x.value) },
      { dom: 'ppfem-intact', arg: 'intact', kind: 'enum', label: 'Intact diaphysis available for a scratch fit', values: PF.PPF_INTACT.map((x) => x.value) },
    ],
  },
];
