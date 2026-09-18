// spec-v1400: MCP adapter. The dom keys mirror views/group-v1400.js and this tile's META example.

import * as LT from '../../lib/ltbi-regimen-dosing-v1400.js';

export default [
  {
    id: 'ltbi-regimen-dosing',
    summary: 'Latent TB infection treatment regimen and doses (NTCA/CDC 2020). 3HP: isoniazid 15 mg/kg (25 mg/kg ages 2 to 11) rounded up to the nearest 50 mg, 900 mg maximum, with rifapentine by weight band up to 900 mg, once weekly for 12 doses; not recommended under 2 or in pregnancy. 4R: rifampin 10 mg/kg adults, 15-20 mg/kg children, 600 mg maximum, daily for 120 doses. 3HR: isoniazid 5 mg/kg (300 mg maximum) with rifampin 10 mg/kg (600 mg maximum), daily for 90 doses. 6H and 9H isoniazid are the alternative, daily or twice weekly. The short rifamycin regimens are preferred over 9 months of isoniazid. Rifamycin interactions with antiretrovirals and hormonal contraception are flagged, not resolved.',
    compute: LT.ltbiRegimenDosing,
    fields: [
      { dom: 'ltbi-regimen', arg: 'regimen', kind: 'enum', required: true, label: 'Regimen', values: LT.REGIMENS.map((a) => a.value) },
      { dom: 'ltbi-weight', arg: 'weightKg', kind: 'number', required: true, label: 'Weight (kg)' },
      { dom: 'ltbi-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'ltbi-pregnant', arg: 'pregnant', kind: 'enum', required: true, label: 'Pregnant, or expecting pregnancy during treatment', values: ['yes', 'no'] },
      { dom: 'ltbi-hiv', arg: 'hiv', kind: 'enum', required: true, label: 'HIV status', values: LT.HIV_STATUS.map((a) => a.value) },
      { dom: 'ltbi-frequency', arg: 'frequency', kind: 'enum', label: 'Isoniazid frequency (6H or 9H)', values: LT.H_FREQUENCY.map((a) => a.value) },
    ],
  },
];
