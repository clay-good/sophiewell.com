// spec-v1633 MCP adapter: transplant-formulation-switch in
// lib/transplant-formulation-switch-v1633.js. The dom keys mirror views/group-v1633.js and
// META['transplant-formulation-switch'].example. Clinical domain. Four label rows: Envarsus XR,
// Neoral, Myfortic and CellCept.

import * as TF from '../../lib/transplant-formulation-switch-v1633.js';

export default [
  {
    id: 'transplant-formulation-switch',
    summary: 'What the labels state when a transplant drug changes product. Tacrolimus immediate-release to Envarsus XR at 80% of the daily dose, once daily; Sandimmune to Neoral at the same dose, then adjusted to trough; Neoral to Sandimmune, where the label gives a warning and no dose; and mycophenolate mofetil against Myfortic as mycophenolic acid content, since both labels say the two are not interchangeable.',
    compute: TF.transplantFormulationSwitch,
    fields: [
      { dom: 'tfs-switch', arg: 'switch', kind: 'enum', required: true, values: TF.SWITCHES.map((d) => d.value), label: 'Drug and switch' },
      { dom: 'tfs-dose', arg: 'dailyDose', kind: 'number', required: true, label: 'Current total daily dose', unit: 'mg' },
    ],
  },
];
