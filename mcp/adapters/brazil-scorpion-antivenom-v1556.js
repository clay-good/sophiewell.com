// spec-v1556 MCP adapter: brazil-scorpion-antivenom in lib/brazil-scorpion-antivenom-v1556.js.
// The dom keys mirror views/group-v1556.js and META['brazil-scorpion-antivenom'].example. Clinical domain.

import * as M from '../../lib/brazil-scorpion-antivenom-v1556.js';

export default [
  {
    id: 'brazil-scorpion-antivenom',
    summary: 'Classes a Tityus scorpion sting in Brazil and gives the vials. Mild (no antivenom), moderate (2-3) or severe (4-6) by the Ministry of Health table.',
    compute: M.brazilScorpionAntivenom,
    fields: [
      { dom: 'bsc-local', arg: 'local', kind: 'enum', label: 'Local pain or tingling', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsc-mod', arg: 'moderate', kind: 'enum', label: 'Intense local pain with nausea, vomiting, sweating, drooling, agitation, fast breathing or fast pulse', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsc-sev', arg: 'severe', kind: 'enum', label: 'Incessant vomiting, profuse sweating or drooling, prostration, seizures, coma, slow pulse, heart failure, pulmonary edema or shock', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
