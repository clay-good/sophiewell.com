// spec-v1633 MCP adapter: aed-formulation-switch in lib/aed-formulation-switch-v1633.js. The dom keys
// mirror views/group-v1633.js and META['aed-formulation-switch'].example. Clinical domain. Six label
// rows: Depakote ER, valproate injection, Keppra injection, Tegretol, Cerebyx and Dilantin Infatabs.

import * as AF from '../../lib/aed-formulation-switch-v1633.js';

export default [
  {
    id: 'aed-formulation-switch',
    summary: 'The dose when an antiepileptic changes formulation or route, as its label states it. Depakote to Depakote ER by the label\'s table; oral valproate to injection; levetiracetam oral and injection; carbamazepine tablets to Tegretol-XR or suspension; oral phenytoin to fosphenytoin in phenytoin sodium equivalents; and phenytoin free acid against sodium salt as a drug-content comparison, with no new dose picked.',
    compute: AF.aedFormulationSwitch,
    fields: [
      { dom: 'afs-switch', arg: 'switch', kind: 'enum', required: true, values: AF.SWITCHES.map((d) => d.value), label: 'Drug and switch' },
      { dom: 'afs-dose', arg: 'dailyDose', kind: 'number', required: true, label: 'Current total daily dose (mg; phenytoin to fosphenytoin in mg PE)', unit: 'mg' },
    ],
  },
];
