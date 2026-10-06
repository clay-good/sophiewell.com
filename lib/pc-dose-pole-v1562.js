// spec-v1562 tool 1: how many tablets a person gets at a mass drug administration: praziquantel and
// ivermectin by height (the WHO dose poles), albendazole, mebendazole and DEC by age.
//
// Source: WHO. Preventive chemotherapy in human helminthiasis, 2006 (IRIS 10665/43545; facts only, nothing
// reproduced). Read October 6, 2026: Table A4.1 (p. 49, read from the page image) and Figure A4.1 (p. 51,
// the dose poles); section 5.5 (pp. 25-27) and the intervention boxes (ineligible groups).
//   - Praziquantel 600 mg (at least 40 mg/kg): 94-109 cm 1, 110-124 cm 1.5, 125-137 cm 2, 138-149 cm 2.5,
//     150-159 cm 3, 160-177 cm 4, 178 cm or more 5; no information on its safety under 94 cm or 4 years.
//   - Ivermectin 3 mg: 90-119 cm 1, 120-139 cm 2, 141-159 cm 3, above 159 cm 4; not under 90 cm (about 15 kg),
//     in pregnancy, while breastfeeding in the first week after birth, or when severely ill; special care
//     where Loa loa is endemic.
//   - By age: albendazole 200 mg at 12-23 months, 400 mg from 2 years; mebendazole 500 mg from 1 year; DEC
//     100 mg tablets: none at 12-23 months, 1 at 2-5 years, 2 at 6-15 years, 3 over 15 years; DEC is not given
//     in pregnancy, under 2 years, or when severely ill, and is used only where onchocerciasis is absent.
//   - Albendazole and mebendazole may be given in pregnancy after the first trimester; praziquantel at any
//     stage of pregnancy and during lactation.
//
// Readings stated rather than hidden: the table's height bands are whole centimeters with gaps (for
// ivermectin, 140 cm is in no band); the pole's cut points are used as half-open bands (90, 120, 141, then
// above 159 cm for ivermectin; 94, 110, 125, 138, 150, 160, 178 for praziquantel). DEC's "2-5" and "6-15"
// years are read as 2 to under 6 and 6 to 15. This pole is not the scabies height stick, whose bands differ.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DRUG_OPTIONS = [
  { value: 'pzq', text: 'Praziquantel 600 mg (by height)' },
  { value: 'ivm', text: 'Ivermectin 3 mg (by height)' },
  { value: 'alb', text: 'Albendazole (by age)' },
  { value: 'mbd', text: 'Mebendazole 500 mg (by age)' },
  { value: 'dec', text: 'DEC 100 mg (by age)' },
];

const PZQ = [[94, 1], [110, 1.5], [125, 2], [138, 2.5], [150, 3], [160, 4], [178, 5]];
const NOTE = 'This follows WHO\'s 2006 preventive chemotherapy manual (Table A4.1 and the dose poles). Your national program may use its own regimen; follow it.';
const tabText = (n) => `${n === 1.5 ? '1½' : n === 2.5 ? '2½' : n} tablet${n === 1 ? '' : 's'}`;
const r1 = (x) => String(Math.round(x * 10) / 10);

export function pcDosePole(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUG_OPTIONS.find((x) => x.value === o.drug);
  if (!drug) return { valid: false, message: 'Choose the drug: praziquantel and ivermectin go by height, the others by age.' };
  const notes = [];

  if (drug.value === 'pzq' || drug.value === 'ivm') {
    const f = inputFault([['the height', o.height, 40, 230, 'cm']]);
    if (f) return { valid: false, message: f };
    const h = Number(o.height);
    if (drug.value === 'pzq') {
      notes.push('Praziquantel may be given at any stage of pregnancy and while breastfeeding.');
      if (h < 94) {
        return { valid: true, band: `${r1(h)} cm is below the praziquantel pole, which starts at 94 cm (about 4 years): the 2006 manual had no safety information below it and gives no pole dose.`, bandLabel: 'Below the pole', abnormal: true, notes, note: NOTE };
      }
      const n = [...PZQ].reverse().find(([lo]) => h >= lo)[1];
      return { valid: true, band: `Praziquantel for ${r1(h)} cm: ${tabText(n)} of 600 mg (${(n * 600).toLocaleString('en-US')} mg), once, by the WHO dose pole.`, bandLabel: tabText(n), abnormal: false, notes, note: NOTE };
    }
    notes.push('Do not give ivermectin in pregnancy, while breastfeeding in the first week after birth, or to anyone severely ill. Where Loa loa is endemic, it needs special precautions (risk of encephalopathy).');
    if (h < 90) {
      return { valid: true, band: `No ivermectin: ${r1(h)} cm is under the pole's 90 cm minimum (about 15 kg).`, bandLabel: 'Not eligible', abnormal: true, notes, note: NOTE };
    }
    const n = h > 159 ? 4 : h >= 141 ? 3 : h >= 120 ? 2 : 1;
    if (h >= 140 && h < 141) notes.push('The table prints 120-139 and 141-159 cm, leaving 140 cm in no band; the pole marks 141 cm, so under 141 cm is 2 tablets.');
    return { valid: true, band: `Ivermectin for ${r1(h)} cm: ${tabText(n)} of 3 mg (${n * 3} mg), once, by the WHO dose pole.`, bandLabel: tabText(n), abnormal: false, notes, note: NOTE };
  }

  const fa = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (fa) return { valid: false, message: fa };
  const age = Number(o.age);
  if (drug.value === 'alb' || drug.value === 'mbd') {
    notes.push('In pregnancy, give it only after the first trimester.');
    if (age < 1) return { valid: true, band: 'Under 12 months: the table gives no dose.', bandLabel: 'Under 12 months', abnormal: true, notes, note: NOTE };
    if (drug.value === 'mbd') return { valid: true, band: 'Mebendazole 500 mg, one tablet, once.', bandLabel: '500 mg', abnormal: false, notes, note: NOTE };
    const mg = age < 2 ? 200 : 400;
    return { valid: true, band: `Albendazole ${mg} mg, once (${age < 2 ? '12 to 23 months' : '2 years or older'}).`, bandLabel: `${mg} mg`, abnormal: false, notes, note: NOTE };
  }
  notes.push('Do not give DEC in pregnancy or to anyone severely ill. It is used only where onchocerciasis is absent.');
  if (age < 2) return { valid: true, band: 'No DEC under 2 years.', bandLabel: 'Not eligible', abnormal: true, notes, note: NOTE };
  const n = age < 6 ? 1 : age <= 15 ? 2 : 3;
  return { valid: true, band: `DEC ${n * 100} mg: ${tabText(n)} of 100 mg, once (${age < 6 ? '2 to 5 years' : age <= 15 ? '6 to 15 years' : 'over 15 years'}).`, bandLabel: `${n * 100} mg`, abnormal: false, notes, note: NOTE };
}
