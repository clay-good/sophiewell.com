// spec-v1556 MCP adapter: brazil-spider-antivenom in lib/brazil-spider-antivenom-v1556.js.
// The dom keys mirror views/group-v1556.js and META['brazil-spider-antivenom'].example. Clinical domain.

import * as M from '../../lib/brazil-spider-antivenom-v1556.js';

export default [
  {
    id: 'brazil-spider-antivenom',
    summary: 'Classes a spider bite in Brazil and gives the vials. Phoneutria or Loxosceles by the Ministry of Health table, prednisone for Loxosceles, supportive care for widow spiders.',
    compute: M.brazilSpiderAntivenom,
    fields: [
      { dom: 'bsp-spider', arg: 'spider', kind: 'enum', required: true, label: 'Spider', values: M.SPIDER_OPTIONS.map((d) => d.value) },
      { dom: 'bsp-mod', arg: 'moderate', kind: 'enum', label: 'Moderate signs (Phoneutria: intense pain, sweating, vomiting, agitation, high BP; Loxosceles: typical lesion with rash or fever)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsp-sev', arg: 'severe', kind: 'enum', label: 'Severe signs (Phoneutria: profuse sweating, drooling, priapism, shock, pulmonary edema; Loxosceles: hemolysis)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'bsp-age', arg: 'ageGroup', kind: 'enum', label: 'Adult or child (for prednisone)', values: M.AGE_OPTIONS.map((d) => d.value) },
      { dom: 'bsp-weight', arg: 'weight', kind: 'number', label: 'Child weight in kg', min: 2, max: 150 },
    ],
  },
];
