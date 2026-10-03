// spec-v1551 MCP adapter: the WHO 2026 ACT weight bands in lib/act-weight-band-dose-v1551.js. The dom keys
// mirror views/group-v1551.js and META['act-weight-band-dose'].example. Clinical domain.

import * as M from '../../lib/act-weight-band-dose-v1551.js';

export default [
  {
    id: 'act-weight-band-dose',
    summary: 'Gives the WHO 2026 weight-band dose of an ACT for uncomplicated falciparum malaria. It reads the 10 September 2026 living guideline and covers artemether-lumefantrine, artesunate with amodiaquine, mefloquine or sulfadoxine-pyrimethamine, and dihydroartemisinin-piperaquine. It prints the schedule and the achieved mg/kg against WHO targets; the band dose is never changed.',
    compute: M.actWeightBandDose,
    fields: [
      { dom: 'act-regimen', arg: 'regimen', kind: 'enum', required: true, label: 'ACT: al, asaq, asmq, assp, dhappq (aspy has no WHO table)', values: M.REGIMEN_OPTIONS.map((r) => r.value) },
      { dom: 'act-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 0.5, max: 150 },
    ],
  },
];
