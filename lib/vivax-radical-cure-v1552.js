// spec-v1552 tool 2: which regimen to prevent P. vivax or P. ovale relapse may this patient receive, given
// the G6PD result, and at what dose? Primaquine or tafenoquine (WHO 2026).
//
// Source: WHO guidelines for malaria, 10 September 2026 (MAL26; CC BY-NC-SA 3.0 IGO, facts restated). Read
// October 6, 2026:
//   - p. 196: tafenoquine is contraindicated with G6PD deficiency, unknown status, or activity 70% or below.
//   - pp. 197-201 (G6PD testing, 2024): qualitative test non-deficient, primaquine 0.5 mg/kg/day for 14 or 7
//     days, never tafenoquine or 1 mg/kg/day, with precautions (heterozygous women read as non-deficient);
//     deficient, consider 0.75 mg/kg once a week for 8 weeks under supervision. Semi-quantitative: over 70%,
//     tafenoquine or primaquine 1 mg/kg/day for 7 days or 0.5 mg/kg/day for 14 days; 30-70%, no tafenoquine,
//     primaquine 0.5 mg/kg/day for 14 or 7 days with precautions; under 30%, the weekly regimen. No test: a
//     risk-benefit decision; tafenoquine not deployed.
//   - pp. 205-206 (tafenoquine, 2024, conditional; South America only; 2 years or older; 70% or more; with
//     chloroquine, not an ACT; not in pregnancy or lactation): over 35 kg 300 mg (two 150 mg tablets); over
//     10 to 35 kg, 100 mg (over 10-20 kg) or 200 mg (over 20-35 kg) as 50 mg dispersible tablets; day 1 or 2
//     of chloroquine.
//   - p. 206 (primaquine, 2024, strong): high total dose 7 mg/kg, 0.5 mg/kg/day for 14 days or 1 mg/kg/day
//     for 7 days (the 7-day only at 70% or more); the low total dose 3.5 mg/kg (0.5 mg/kg/day for 7 days)
//     might be used on the Indian subcontinent and in the Americas; not for pregnant women, infants under 1
//     month or women breastfeeding an infant under 1 month.
//   - p. 209: without a quantitative test, all women are treated as possibly intermediate and given the
//     14-day regimen, with counseling on hemolysis.
//   - p. 193 (chloroquine): 25 mg base/kg: 10 mg/kg day 1, 10 mg/kg day 2, 5 mg/kg day 3.
//
// Stated rather than hidden: the semi-quantitative categories are the test's own (over 70%, 30-70%, under
// 30%), so a reading of exactly 70% is the test's intermediate band, consistent with p. 196. No adult maximum
// is stated, so none is applied; weights over 100 kg are flagged. No test gives no regimen.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SEX_OPTIONS = [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const TEST_OPTIONS = [
  { value: 'semi', text: 'Semi-quantitative (or quantitative)' },
  { value: 'qual', text: 'Qualitative' },
  { value: 'none', text: 'No G6PD test' },
];
export const RESULT_OPTIONS = [
  { value: 'gt70', text: 'Semi-quantitative: over 70% (normal)' },
  { value: '30to70', text: 'Semi-quantitative: 30% to 70% (intermediate)' },
  { value: 'lt30', text: 'Semi-quantitative: under 30% (deficient)' },
  { value: 'notdef', text: 'Qualitative: not deficient' },
  { value: 'def', text: 'Qualitative: deficient' },
];
export const BLOOD_OPTIONS = [{ value: 'cq', text: 'Chloroquine' }, { value: 'act', text: 'An ACT' }];

const NOTE = 'This follows the WHO guidelines for malaria (10 September 2026). Doses are mg of primaquine base; give primaquine with food. Your national program sets the regimen.';
const mg = (x) => `${Math.round(x * 10) / 10} mg`;

function tafenoquine(kg) {
  if (kg > 35) return '300 mg once (two 150 mg tablets)';
  if (kg > 20) return '200 mg once (four 50 mg dispersible tablets)';
  if (kg > 10) return '100 mg once (two 50 mg dispersible tablets)';
  return null;
}

export function vivaxRadicalCure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 2, 250, 'kg'], ['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  const years = Number(o.age);
  const sex = SEX_OPTIONS.find((x) => x.value === o.sex);
  if (!sex) return { valid: false, message: 'Choose the sex: the qualitative test cannot exclude intermediate G6PD activity in women.' };
  if (sex.value === 'female') {
    if (!YES_NO.some((x) => x.value === o.pregnant)) return { valid: false, message: 'Choose whether she is pregnant: primaquine and tafenoquine are not given in pregnancy.' };
    if (!YES_NO.some((x) => x.value === o.bfInfant)) return { valid: false, message: 'Choose whether she is breastfeeding an infant under 1 month.' };
  }
  const test = TEST_OPTIONS.find((x) => x.value === o.test);
  if (!test) return { valid: false, message: 'Choose the G6PD test: semi-quantitative, qualitative, or none.' };
  const blood = BLOOD_OPTIONS.find((x) => x.value === o.blood);
  if (!blood) return { valid: false, message: 'Choose the blood-stage treatment: chloroquine or an ACT (tafenoquine goes only with chloroquine).' };
  if (!YES_NO.some((x) => x.value === o.southAmerica)) return { valid: false, message: 'Choose whether this is in South America: WHO recommends tafenoquine only there.' };

  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (blood.value === 'cq') notes.push(`Chloroquine for the blood stage: ${mg(10 * kg)} base on day 1, ${mg(10 * kg)} on day 2 and ${mg(5 * kg)} on day 3 (25 mg/kg in total).`);
  if (kg > 100) notes.push('WHO states no maximum dose; the mg/kg doses here are not capped, so check them at this weight.');

  if (sex.value === 'female' && o.pregnant === 'yes') {
    notes.push('Give weekly chloroquine prophylaxis until delivery and breastfeeding are complete, then the radical cure by G6PD status.');
    return out('No primaquine or tafenoquine in pregnancy.', 'Not in pregnancy', true);
  }
  if (sex.value === 'female' && o.bfInfant === 'yes') return out('No primaquine or tafenoquine while breastfeeding an infant under 1 month: give it once the infant is 1 month old.', 'Not now (breastfeeding)', true);
  if (years < 1 / 12) return out('No primaquine for an infant under 1 month.', 'Not under 1 month', true);

  if (test.value === 'none') {
    notes.push('No test: the decision weighs the local prevalence and severity of G6PD deficiency and the capacity to manage hemolysis against the benefit of preventing relapse. Tafenoquine is not deployed without a semi-quantitative or quantitative test.');
    return out('No regimen without a G6PD test: whether to give primaquine is a risk-benefit judgement, and tafenoquine should not be used.', 'No test, no regimen', true);
  }
  const res = RESULT_OPTIONS.find((x) => x.value === o.result);
  const fits = res && (test.value === 'semi' ? ['gt70', '30to70', 'lt30'] : ['notdef', 'def']).includes(res.value);
  if (!fits) return { valid: false, message: `Choose the ${test.value === 'semi' ? 'semi-quantitative' : 'qualitative'} G6PD result.` };

  const weekly = `primaquine ${mg(0.75 * kg)} base once a week for 8 weeks (0.75 mg/kg), under close medical supervision with access to transfusion`;
  const p14 = `primaquine ${mg(0.5 * kg)} base a day for 14 days (0.5 mg/kg/day; 7 mg/kg in total)`;
  const p7hi = `primaquine ${mg(1 * kg)} base a day for 7 days (1 mg/kg/day; 7 mg/kg in total)`;
  const p7lo = `primaquine ${mg(0.5 * kg)} base a day for 7 days (0.5 mg/kg/day; 3.5 mg/kg in total)`;
  const lowNote = 'On the Indian subcontinent and in the Americas, where the extra benefit of the high total dose may be small, WHO says the low total dose (3.5 mg/kg) might be used.';

  if (res.value === 'lt30' || res.value === 'def') return out(`G6PD deficient: consider ${weekly}.`, 'Weekly for 8 weeks', true);

  if (res.value === 'notdef') {
    notes.push('A qualitative test cannot show intermediate activity: no tafenoquine and no 1 mg/kg/day regimen.');
    if (sex.value === 'female') {
      notes.push('Without a quantitative test every woman is treated as possibly intermediate: give the 14-day regimen and explain the signs of hemolysis (dark urine, pallor, breathlessness), to stop and seek care.');
      return out(`Not deficient (qualitative), female: ${p14}.`, '14 days', false);
    }
    notes.push(`Or: ${p7lo}, the low total dose. ${lowNote}`);
    return out(`Not deficient (qualitative): ${p14}.`, '14 days', false);
  }

  if (res.value === '30to70') {
    notes.push('Intermediate activity still carries some risk of hemolysis: give it with precautions and explain the signs to stop for.');
    notes.push(`${lowNote} That regimen is ${p7lo}.`);
    return out(`Intermediate G6PD activity (30% to 70%): no tafenoquine and no 1 mg/kg/day regimen. ${p14[0].toUpperCase()}${p14.slice(1)}.`, '14 days, with precautions', true);
  }

  // Over 70%.
  const tq = tafenoquine(kg);
  const tqOk = o.southAmerica === 'yes' && blood.value === 'cq' && years >= 2 && tq;
  notes.push(`Or: ${p7hi}.`);
  notes.push(lowNote);
  if (tqOk) {
    notes.push(`Or, in South America: tafenoquine ${tq}, on day 1 or 2 of the chloroquine course (conditional recommendation; an alternative to the 3.5 mg/kg primaquine dose).`);
  } else {
    const why = o.southAmerica !== 'yes' ? 'WHO recommends it only in South America' : blood.value !== 'cq' ? 'it goes only with chloroquine, not an ACT' : years < 2 ? 'it is for 2 years or older' : 'there is no dose at 10 kg or less';
    notes.push(`No tafenoquine: ${why}.`);
  }
  return out(`Normal G6PD activity (over 70%): ${p14}.`, '14 days or 7 days', false);
}
