// spec-v183 MCP wave 14: adapters for the two lib/pk-v166.js pharmacology tiles.
// dom keys mirror views/group-v166.js; arg names mirror the lib signatures.

import * as F from '../../lib/pk-v166.js';

export default [
  {
    id: 'pk-suite',
    summary: 'Pharmacokinetics suite (Rowland & Tozer): loading dose = Vd·Cp/F, maintenance = CL·Css·τ/F, k = CL/Vd, half-life = 0.693·Vd/CL, steady state ≈ 5·t½.',
    compute: F.pkSuite,
    fields: [
      { dom: 'pk-vd', arg: 'vd', kind: 'number', label: 'Volume of distribution Vd (L)' },
      { dom: 'pk-cl', arg: 'cl', kind: 'number', label: 'Clearance CL (L/h)' },
      { dom: 'pk-cp', arg: 'cp', kind: 'number', label: 'Target concentration Cp (mg/L)' },
      { dom: 'pk-f', arg: 'f', kind: 'number', label: 'Bioavailability F (0–1)' },
      { dom: 'pk-tau', arg: 'tau', kind: 'number', label: 'Dosing interval τ (h)' },
    ],
  },
  {
    id: 'chlorpromazine-equivalents',
    summary: 'Chlorpromazine equivalents (Woods 2003): convert an antipsychotic total daily dose to its 100 mg-chlorpromazine equivalent by the agent-specific factor.',
    compute: F.chlorpromazineEquivalents,
    fields: [
      { dom: 'cpz-agent', arg: 'agent', kind: 'enum', values: ['chlorpromazine', 'haloperidol', 'risperidone', 'olanzapine', 'quetiapine', 'ziprasidone', 'aripiprazole'], required: true, label: 'Antipsychotic agent' },
      { dom: 'cpz-dose', arg: 'dose', kind: 'number', required: true, label: 'Total daily dose (mg)' },
    ],
  },
];
