// spec-v1554 tool 6: infant HIV prophylaxis: risk group and the nevirapine prophylaxis dose (WHO, December
// 2025 recommendations; May 2026 dosing guidance).
//
// Sources, read October 6, 2026 (CC BY-NC-SA 3.0 IGO, facts restated):
//   - HIVCM25: WHO updated recommendations on HIV clinical management, December 2025 (IRIS 10665/384580),
//     section 4.1.1 and the summary: infants born to mothers on ART who are not at high risk get 6 weeks of
//     single-drug prophylaxis, nevirapine preferred, dolutegravir or lamivudine as alternatives; high-risk
//     infants get a three-drug regimen appropriate for age for 6 weeks, moving to abacavir/lamivudine plus
//     dolutegravir when available; breastfeeding infants then continue single-drug prophylaxis (nevirapine
//     preferred) until maternal viral suppression or the end of breastfeeding. High risk: the mother had
//     under 4 weeks of ART at delivery; or a viral load over 1,000 copies/mL in the 4 weeks before delivery
//     (if available); or acquired HIV in pregnancy or breastfeeding; or was first identified after delivery.
//   - ARV26: WHO optimal antiretroviral dosing guidance: paediatric populations, May 6, 2026, corrigendum June
//     18, 2026, Table 5 (corrected): prolonged postnatal prophylaxis from 4 weeks and 3-20 kg: nevirapine 10
//     mg/mL 1.5 mL (4-6 weeks), 2 mL (6 weeks-6 months), 3 mL (6-9 months), 4 mL (9-24 months), or 50 mg scored
//     dispersible tablets 0.5, 0.5, 0.5, 1; nevirapine 1.5 mL daily can be given from birth to 4 weeks;
//     lamivudine 10 mg/mL twice daily 1.5 mL (3-<6 kg), 4 mL (6-<10), 6 mL (10-<15); dolutegravir 10 mg scored
//     dispersible 0.5, 1.5, 2, 2.5 tablets (3-<6, 6-<10, 10-<15, 15-<20 kg).
//
// Stated rather than hidden: ages are in weeks (6 months = 26, 9 months = 39, 24 months = 104). Prophylaxis doses differ from treatment doses; every dose line says
// "prophylaxis". The three-drug regimen's neonatal doses (ARV26 Tables 3-4) are not printed. High
// volatility: dosing guidance changes often; check the current WHO edition.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const ART_OPTIONS = [
  { value: 'ge4', text: 'On ART 4 weeks or more' },
  { value: 'lt4', text: 'On ART under 4 weeks' },
  { value: 'none', text: 'Not on ART' },
];
export const VL_OPTIONS = [
  { value: 'le1000', text: '1,000 copies/mL or less' },
  { value: 'gt1000', text: 'Over 1,000 copies/mL' },
  { value: 'unknown', text: 'Not available' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s December 2025 HIV clinical management recommendations and the May 2026 paediatric dosing guidance (corrigendum June 2026). Dosing guidance changes often; check the current edition.';

export function nvpProphylaxis(weeks) {
  if (weeks < 4) return 'nevirapine 10 mg/mL 1.5 mL once daily (prophylaxis)';
  if (weeks < 6) return 'nevirapine 10 mg/mL 1.5 mL, or half a 50 mg dispersible tablet, once daily (prophylaxis)';
  if (weeks < 26) return 'nevirapine 10 mg/mL 2 mL, or half a 50 mg dispersible tablet, once daily (prophylaxis)';
  if (weeks < 39) return 'nevirapine 10 mg/mL 3 mL, or half a 50 mg dispersible tablet, once daily (prophylaxis)';
  if (weeks < 104) return 'nevirapine 10 mg/mL 4 mL, or one 50 mg dispersible tablet, once daily (prophylaxis)';
  return null;
}

export function infantArvProphylaxis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const art = ART_OPTIONS.find((x) => x.value === o.art);
  if (!art) return { valid: false, message: 'Choose the mother\'s ART at delivery: 4 weeks or more, under 4 weeks, or none.' };
  for (const [k, q] of [['incident', 'whether the mother acquired HIV during pregnancy or breastfeeding'], ['postpartum', 'whether the mother was first identified with HIV after delivery'], ['breastfeeding', 'whether the infant is breastfeeding']]) {
    if (o[k] !== 'yes' && o[k] !== 'no') return { valid: false, message: `Choose ${q}.` };
  }
  const f = inputFault([['the infant\'s age', o.age, 0, 104, 'weeks']]);
  if (f) return { valid: false, message: f };
  const weeks = Number(o.age);
  let kg = null;
  if (String(o.weight ?? '').trim() !== '') { const fw = inputFault([['the infant\'s weight', o.weight, 1, 25, 'kg']]); if (fw) return { valid: false, message: fw }; kg = Number(o.weight); }
  const vl = VL_OPTIONS.find((x) => x.value === o.vl)?.value || null;

  const why = [];
  if (art.value !== 'ge4') why.push(art.value === 'none' ? 'mother not on ART' : 'mother on ART under 4 weeks at delivery');
  if (vl === 'gt1000') why.push('maternal viral load over 1,000 copies/mL in the 4 weeks before delivery');
  if (o.incident === 'yes') why.push('HIV acquired in pregnancy or breastfeeding');
  if (o.postpartum === 'yes') why.push('mother first identified after delivery');
  const notes = [];
  if (!vl && !why.length) notes.push('Maternal viral load: not entered. Over 1,000 copies/mL in the 4 weeks before delivery would make this high risk.');
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  const nvp = nvpProphylaxis(weeks);

  if (why.length) {
    notes.push('The three-drug regimen\'s neonatal doses are in WHO\'s paediatric dosing guidance (Tables 3-4); they are not printed here.');
    if (o.breastfeeding === 'yes') notes.push(`After the 6 weeks, continue single-drug prophylaxis until the mother is virally suppressed or breastfeeding ends: at this age, ${nvp || 'see the current WHO dosing table'}.`);
    return out(`High risk (${why.join('; ')}): a three-drug prophylaxis regimen appropriate for age for 6 weeks, moving to abacavir/lamivudine plus dolutegravir when available.`, 'High risk: 3 drugs', true);
  }
  if (weeks >= 6) notes.push('The 6-week course is normally started at birth; at this age it would already be complete.');
  if (kg !== null && weeks >= 4 && kg >= 3 && kg < 20) {
    const dtg = kg < 6 ? '0.5' : kg < 10 ? '1.5' : kg < 15 ? '2' : '2.5';
    const tc = kg < 6 ? '1.5' : kg < 10 ? '4' : kg < 15 ? '6' : null;
    notes.push(`Alternatives (prophylaxis): dolutegravir 10 mg dispersible ${dtg} tablet${dtg === '0.5' ? '' : 's'} once daily${tc ? `, or lamivudine 10 mg/mL ${tc} mL twice daily` : ''}.`);
  } else if (kg === null) notes.push('Weight: not entered, so the dolutegravir and lamivudine alternatives (by weight, from 4 weeks) are not dosed.');
  return out(`Not high risk: 6 weeks of single-drug prophylaxis, nevirapine preferred: ${nvp || 'see the current WHO dosing table'}.`, 'Not high risk: nevirapine', false);
}
