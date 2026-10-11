// spec-v1633 MCP adapter: label-formulation-switch in lib/label-formulation-switch-v1633.js. The dom
// keys mirror views/group-v1633.js and META['label-formulation-switch'].example. Clinical domain.
// Four label rows: digoxin tablets, Coreg CR, Concerta and bumetanide tablets.

import * as LF from '../../lib/label-formulation-switch-v1633.js';

export default [
  {
    id: 'label-formulation-switch',
    summary: 'The corresponding dose for four switches a label states. Digoxin intravenous and tablets, by the label\'s table of equivalent doses; immediate-release carvedilol to Coreg CR; immediate-release methylphenidate to Concerta; and furosemide and bumetanide by the bumetanide label\'s approximate 1:40 potency ratio. A dose a table does not list is reported as not in the table.',
    compute: LF.labelFormulationSwitch,
    fields: [
      { dom: 'lfs-switch', arg: 'switch', kind: 'enum', required: true, values: LF.SWITCHES.map((d) => d.value), label: 'Drug and switch' },
      { dom: 'lfs-dose', arg: 'dose', kind: 'number', required: true, label: 'Current dose (digoxin in mcg; carvedilol and methylphenidate as the mg taken at each administration; diuretics in mg)' },
    ],
  },
];
