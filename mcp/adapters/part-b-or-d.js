// spec-v1505 tool 2: MCP adapter for part-b-or-d. The dom keys mirror views/group-v1505.js.

import * as BD from '../../lib/part-b-or-d.js';

const vals = (xs) => xs.map((x) => x.value);
const yn = (dom, arg, label) => ({ dom, arg, kind: 'enum', required: false, values: vals(BD.YES_NO), label });

export default [
  {
    id: 'part-b-or-d',
    summary: 'Whether Medicare Part B or Part D covers a drug, and why. The SSA 1861(s) categories, the MAC self-administered drug list, vaccines and the special Part B categories.',
    compute: BD.partBOrD,
    fields: [
      { dom: 'pbd-category', arg: 'category', kind: 'enum', required: true, values: vals(BD.CATEGORIES), label: 'How the drug is given, or its category' },
      { dom: 'pbd-sad', arg: 'sad', kind: 'enum', required: false, values: vals(BD.SAD), label: 'On the MAC self-administered drug list' },
      { dom: 'pbd-vaccine', arg: 'vaccine', kind: 'enum', required: false, values: vals(BD.VACCINES), label: 'Vaccine' },
      yn('pbd-hepb', 'hepbRisk', 'Hepatitis B: high or intermediate risk'),
      yn('pbd-home', 'atHome', 'Lives at home (for DME drugs)'),
      yn('pbd-transplant', 'medicareTransplant', 'Medicare paid for the transplant'),
      yn('pbd-injectable', 'sameAsInjectable', 'Oral cancer drug matches a Part B injectable'),
      yn('pbd-48', 'within48', 'Antiemetic within 48 hours of chemotherapy'),
      yn('pbd-dialysis', 'dialysis', 'On dialysis'),
      yn('pbd-pid', 'primaryImmuneDeficiency', 'For a primary immune deficiency'),
      yn('pbd-perm', 'permanent', 'Permanent digestive dysfunction'),
    ],
  },
];
