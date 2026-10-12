// spec-v1635 MCP adapter: chatelut-carboplatin in lib/chatelut-carboplatin-v1635.js. The dom keys
// mirror views/group-v1635.js and META['chatelut-carboplatin'].example. Clinical domain.

import * as CH from '../../lib/chatelut-carboplatin-v1635.js';

export default [
  {
    id: 'chatelut-carboplatin',
    summary: 'Carboplatin clearance and dose by the Chatelut formula, from weight, age, sex and serum creatinine. The dose is the target exposure times the predicted clearance. With a GFR it also shows the Calvert dose beside it. The formula was derived and tested in 70 adults; it carries no dose cap, and the creatinine assay of the original paper was not confirmed.',
    compute: (args) => CH.chatelutCarboplatin(args),
    fields: [
      { dom: 'chc-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'chc-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'chc-sex', arg: 'sex', kind: 'enum', required: true, values: CH.SEXES.map((x) => x.value), label: 'Sex' },
      { dom: 'chc-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine' },
      { dom: 'chc-cr-unit', arg: 'creatinineUnit', kind: 'enum', required: true, values: CH.CREATININE_UNITS.map((x) => x.value), label: 'Creatinine unit' },
      { dom: 'chc-auc', arg: 'targetAuc', kind: 'number', required: true, label: 'Target AUC', unit: 'mg/mL·min' },
      { dom: 'chc-gfr', arg: 'gfr', kind: 'number', label: 'GFR, to show the Calvert dose beside it (optional)', unit: 'mL/min' },
    ],
  },
];
