// spec-v1400: MCP adapter. The dom keys mirror views/group-v1400.js and this tile's META example.

import * as TB from '../../lib/ca-adult-tb-risk-v1400.js';

export default [
  {
    id: 'ca-adult-tb-risk',
    summary: "California Adult TB Risk Assessment (CDPH) for asymptomatic adults. Test for latent TB infection, IGRA preferred, if any of four boxes applies: birth, travel, or residence of at least 1 month, or frequent border crossing, in a country with an elevated TB rate (10 or more per 100,000); immunosuppression, current or planned; close contact with infectious TB; or homelessness or incarceration, current or past. Otherwise no testing is indicated. Symptoms or an abnormal chest x-ray mean an active-disease workup instead. The form prints the steroid threshold as prednisone 15 mg/kg/day; the tool uses CDC's 15 mg/day for at least a month and says so.",
    compute: TB.caAdultTbRisk,
    fields: [
      { dom: 'catb-symptoms', arg: 'symptoms', kind: 'enum', required: true, label: 'Symptoms of TB disease or an abnormal chest x-ray', values: ['yes', 'no'] },
      { dom: 'catb-country', arg: 'country', kind: 'enum', required: true, label: 'High TB-rate country: birth, travel, residence, or border crossing', values: ['yes', 'no'] },
      { dom: 'catb-immuno', arg: 'immunosuppression', kind: 'enum', required: true, label: 'Immunosuppression, current or planned', values: ['yes', 'no'] },
      { dom: 'catb-contact', arg: 'contact', kind: 'enum', required: true, label: 'Close contact with infectious TB', values: ['yes', 'no'] },
      { dom: 'catb-congregate', arg: 'congregate', kind: 'enum', required: true, label: 'Homelessness or incarceration, current or past', values: ['yes', 'no'] },
    ],
  },
];
