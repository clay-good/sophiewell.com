// spec-v1631 MCP adapter: phenytoin-mm-dose in lib/phenytoin-mm-dose-v1631.js. The dom keys mirror
// views/group-v1631.js and META['phenytoin-mm-dose'].example. Clinical domain. Ludden 1977; the
// salt-to-acid difference is a label row. It does not correct levels for albumin.

import * as PM from '../../lib/phenytoin-mm-dose-v1631.js';

export default [
  {
    id: 'phenytoin-mm-dose',
    summary: 'Phenytoin Km and Vmax from two steady-state levels on two different daily doses (Michaelis-Menten). Gives the daily dose for a target level. Puts sodium-salt and free-acid products on one basis and lists the predicted level at common doses. Refuses pairs that imply a negative Km. The target is the reader\'s; levels are not corrected for albumin.',
    compute: PM.phenytoinMmDose,
    fields: [
      { dom: 'pm-dose1', arg: 'dose1', kind: 'number', required: true, label: 'First daily dose', unit: 'mg/day' },
      { dom: 'pm-form1', arg: 'form1', kind: 'enum', required: true, values: PM.FORMS.map((x) => x.value), label: 'First dose form: sodium salt (sodium) or free acid (acid)' },
      { dom: 'pm-level1', arg: 'level1', kind: 'number', required: true, label: 'Steady-state level on the first dose', unit: 'mcg/mL' },
      { dom: 'pm-dose2', arg: 'dose2', kind: 'number', required: false, label: 'Second daily dose', unit: 'mg/day' },
      { dom: 'pm-form2', arg: 'form2', kind: 'enum', required: false, values: PM.FORMS.map((x) => x.value), label: 'Second dose form: sodium salt (sodium) or free acid (acid)' },
      { dom: 'pm-level2', arg: 'level2', kind: 'number', required: false, label: 'Steady-state level on the second dose', unit: 'mcg/mL' },
      { dom: 'pm-target', arg: 'target', kind: 'number', required: true, label: 'Target level', unit: 'mcg/mL' },
      { dom: 'pm-km', arg: 'km', kind: 'number', required: false, label: 'With one level only: the Km to use (no default)', unit: 'mcg/mL' },
      { dom: 'pm-test', arg: 'testDose', kind: 'number', required: false, label: 'A dose to test (optional)', unit: 'mg/day' },
      { dom: 'pm-testform', arg: 'testForm', kind: 'enum', required: false, values: PM.FORMS.map((x) => x.value), label: 'Form of the dose to test' },
    ],
  },
];
