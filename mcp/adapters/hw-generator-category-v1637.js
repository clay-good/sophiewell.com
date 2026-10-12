// spec-v1637 MCP adapter: hw-generator-category in lib/hw-generator-category-v1637.js. The dom keys
// mirror views/group-v1637.js and META['hw-generator-category'].example. Administrative domain.
// No clock.

import * as HW from '../../lib/hw-generator-category-v1637.js';

export default [
  {
    id: 'hw-generator-category',
    summary: 'The federal hazardous waste generator category for one calendar month. It is read from kilograms of acute waste, non-acute waste and acute cleanup residue (Table 1 to 40 CFR 262.13): large, small or very small, with what drove it. Hazardous waste pharmaceuticals managed under part 266 subpart P are not counted.',
    compute: HW.hwGeneratorCategory,
    fields: [
      { dom: 'hwg-acute', arg: 'acuteKg', kind: 'number', required: true, label: 'Acute hazardous waste this calendar month (0 if none)', unit: 'kg' },
      { dom: 'hwg-nonacute', arg: 'nonAcuteKg', kind: 'number', required: true, label: 'Non-acute hazardous waste this calendar month (0 if none)', unit: 'kg' },
      { dom: 'hwg-residue', arg: 'residueKg', kind: 'number', required: true, label: 'Residues from a cleanup of acute hazardous waste (0 if none)', unit: 'kg' },
      { dom: 'hwg-subpart', arg: 'subpartP', kind: 'enum', required: true, values: HW.SUBPART_P.map((k) => k.value), label: 'Are hazardous waste pharmaceuticals managed under subpart P?' },
    ],
  },
];
