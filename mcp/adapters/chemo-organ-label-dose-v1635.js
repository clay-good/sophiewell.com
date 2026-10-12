// spec-v1635 MCP adapter: chemo-organ-label-dose in lib/chemo-organ-label-dose-v1635.js. The dom keys
// mirror views/group-v1635.js and META['chemo-organ-label-dose'].example. Clinical domain. Thirteen
// label rows, one per drug label read (two for doxorubicin).

import * as CO from '../../lib/chemo-organ-label-dose-v1635.js';

export default [
  {
    id: 'chemo-organ-label-dose',
    summary: 'The FDA label\'s dose modification for liver or kidney function, for one chemotherapy drug at a time. It takes the laboratory values that drug\'s label reads and returns the label\'s own row: a percent, a dose, "avoid", or no recommended dose. A value the label leaves between two rows returns both. Covers 12 drugs, among them doxorubicin, paclitaxel, bleomycin and capecitabine.',
    compute: (args) => CO.chemoOrganLabelDose(args, new Date()),
    fields: [
      { dom: 'col-drug', arg: 'drug', kind: 'enum', required: true, values: CO.DRUGS.map((x) => x.value), label: 'Drug' },
      { dom: 'col-bili', arg: 'bilirubin', kind: 'number', label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'col-dbili', arg: 'directBilirubin', kind: 'number', label: 'Direct bilirubin (vincristine)', unit: 'mg/dL' },
      { dom: 'col-bili-uln', arg: 'bilirubinXuln', kind: 'number', label: 'Bilirubin as a multiple of the upper limit of normal (3-hour paclitaxel, docetaxel)' },
      { dom: 'col-ast-uln', arg: 'transaminaseXuln', kind: 'number', label: 'AST or ALT as a multiple of the upper limit of normal' },
      { dom: 'col-alp-uln', arg: 'alkPhosXuln', kind: 'number', label: 'Alkaline phosphatase as a multiple of the upper limit of normal (docetaxel)' },
      { dom: 'col-crcl', arg: 'crcl', kind: 'number', label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'col-cr', arg: 'creatinine', kind: 'number', label: 'Serum creatinine (epirubicin, daunorubicin)', unit: 'mg/dL' },
      { dom: 'col-plt', arg: 'platelets', kind: 'number', label: 'Lowest platelet count after the prior course (carboplatin)', unit: '/mm³' },
      { dom: 'col-anc', arg: 'neutrophils', kind: 'number', label: 'Lowest neutrophil count after the prior course (carboplatin)', unit: '/mm³' },
    ],
  },
];
