// spec-v1554 tool 7: pediatric ARV doses by weight band, once daily, with the rifampicin adjustment (WHO
// paediatric dosing guidance, May 2026, corrigendum June 2026).
//
// Source: WHO. Optimal antiretroviral dosing guidance: recommendations for dosing medicines for HIV prevention
// and treatment in paediatric populations, May 6, 2026, corrigendum June 18, 2026 (doi:10.2471/B09711; CC
// BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026: Table 1 (p. 6, page image) once daily for infants
// and children 4 weeks or older and 3-35 kg, by weight band 3-<6, 6-<10, 10-<15, 15-<20, 20-<25 kg
// (paediatric) and 25-<35 kg (adult tablets): ABC/3TC/DTG 60/30/5 mg dispersible (pALD) 1, 3, 4, 5, 6 (no
// adult row); ABC/3TC 120/60 mg dispersible 0.5, 1.5, 2, 2.5, 3, then adult 600/300 mg 1; DTG 5 mg dispersible
// 1, 3, 4, 5, 6; DTG 10 mg scored dispersible 0.5, 1.5, 2, 2.5, 3; DTG 50 mg film-coated 1 from 20 kg (adult
// 50 mg 1 at 25-<35 kg; preferred from 20 kg if the child can swallow tablets; dispersible and film-coated
// tablets are not bioequivalent); TDF/3TC/DTG (TLD) 1 from 30 kg. Footnotes: under 4 weeks see the neonatal
// tables; from 4 weeks but under 3 kg most experts use the 3-5.99 kg band. Table 7 (p. 10): with rifampicin,
// DTG twice daily at the same counts (50 mg film-coated twice daily from 20 kg); pALD stays once daily with
// an extra DTG dose 12 hours later; continue the adjustment until 2 weeks after rifampicin ends.
//
// Stated rather than hidden: Table 1's footnote b says a quarter of an ABC/3TC 120/60 mg tablet in the
// 3-5.99 kg band while the table prints 0.5; both are shown. The corrigendum's row changes to Table 1 column
// 7 could not be mapped unambiguously, so only the rows above are offered; twice-daily ABC/3TC and the
// neonatal tables are not built. Highest volatility: check the current WHO edition before every use.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DRUG_OPTIONS = [
  { value: 'pald', text: 'ABC/3TC/DTG 60/30/5 mg dispersible (pALD)' },
  { value: 'abc3tc', text: 'ABC/3TC 120/60 mg dispersible' },
  { value: 'dtg5', text: 'DTG 5 mg dispersible' },
  { value: 'dtg10', text: 'DTG 10 mg scored dispersible' },
  { value: 'dtg50', text: 'DTG 50 mg film-coated' },
  { value: 'tld', text: 'TDF/3TC/DTG (TLD) 300/300/50 mg' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const BANDS = ['3 to under 6 kg', '6 to under 10 kg', '10 to under 15 kg', '15 to under 20 kg', '20 to under 25 kg', '25 to under 35 kg'];
const ROWS = {
  pald: [1, 3, 4, 5, 6, null],
  abc3tc: [0.5, 1.5, 2, 2.5, 3, 'adult 600/300 mg tablet 1'],
  dtg5: [1, 3, 4, 5, 6, 'adult 50 mg film-coated tablet 1'],
  dtg10: [0.5, 1.5, 2, 2.5, 3, 'adult 50 mg film-coated tablet 1'],
  dtg50: [null, null, null, null, 1, 1],
};
const NOTE = 'WHO paediatric ARV dosing guidance, May 2026 (corrigendum June 2026). Treatment doses, once daily; highest volatility: confirm against the current WHO edition.';

export function whoPediatricArvDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const d = DRUG_OPTIONS.find((x) => x.value === o.drug);
  if (!d) return { valid: false, message: 'Choose the formulation.' };
  const f = inputFault([['the weight', o.weight, 1, 35, 'kg'], ['the age', o.age, 0, 1000, 'weeks']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  const weeks = Number(o.age);
  if (o.rif !== 'yes' && o.rif !== 'no') return { valid: false, message: 'Choose whether the child is on rifampicin: dolutegravir is then given twice daily.' };
  if (weeks < 4) return { valid: false, message: 'Choose the neonatal tables for an infant under 4 weeks: these doses are from 4 weeks (WHO gives reduced neonatal doses).' };
  const notes = [];
  const out = (band, label) => ({ valid: true, band, bandLabel: label, abnormal: false, notes, note: NOTE });

  if (d.value === 'tld') {
    if (kg < 30) return { valid: false, message: 'Choose another formulation under 30 kg: TLD is from 30 kg.' };
    if (o.rif === 'yes') notes.push('With rifampicin, add a separate DTG 50 mg dose 12 hours later, until 2 weeks after rifampicin ends.');
    return out('TLD (TDF/3TC/DTG 300/300/50 mg) 1 tablet once daily (30 kg or more).', '1 tablet daily');
  }
  const under3 = kg < 3;
  const i = under3 ? 0 : kg < 6 ? 0 : kg < 10 ? 1 : kg < 15 ? 2 : kg < 20 ? 3 : kg < 25 ? 4 : 5;
  if (under3) notes.push('From 4 weeks but under 3 kg, most experts use the 3-5.99 kg band (preterm and low-birth-weight dosing is uncertain).');
  const cell = ROWS[d.value][i];
  if (cell === null) {
    if (d.value === 'pald') return { valid: false, message: 'Choose an adult formulation at 25 kg or more: pALD has no row there.' };
    return { valid: false, message: 'Choose a dispersible DTG formulation under 20 kg: the 50 mg film-coated tablet is from 20 kg.' };
  }
  const text = typeof cell === 'number' ? `${cell} tablet${cell === 1 ? '' : 's'}` : cell;
  if (d.value === 'abc3tc' && i === 0) notes.push('Table 1 prints 0.5 tablet for 3 to under 6 kg, but its footnote says a quarter of a double-scored tablet in that band; confirm in the current edition.');
  if ((d.value === 'dtg5' || d.value === 'dtg10') && kg >= 20) notes.push('From 20 kg the DTG 50 mg film-coated tablet is preferred if the child can swallow tablets; dispersible and film-coated tablets are not bioequivalent (30 mg dispersible = 50 mg film-coated).');
  if (d.value === 'abc3tc' || d.value === 'pald') notes.push(d.value === 'pald' ? 'pALD contains dolutegravir; do not add another DTG except for the rifampicin adjustment.' : 'ABC/3TC is a backbone: give it with a third drug (usually DTG).');
  let rifLine = '';
  if (o.rif === 'yes') {
    if (d.value === 'pald') rifLine = ' With rifampicin: keep pALD once daily and add a separate DTG dose (Table 7 counts) 12 hours later.';
    else if (d.value !== 'abc3tc') rifLine = ' With rifampicin: give this DTG dose twice daily.';
    notes.push('Continue the rifampicin adjustment until 2 weeks after rifampicin ends.');
  }
  return out(`${d.text}, ${BANDS[i]}: ${text} once daily.${rifLine}`, `${text} ${o.rif === 'yes' && d.value !== 'abc3tc' ? 'with rifampicin adjustment' : 'once daily'}`);
}
