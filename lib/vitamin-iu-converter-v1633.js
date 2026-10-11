// spec-v1633 tool 18: vitamin A, D, E, folate and niacin unit conversion, by FDA's labeling factors.
//
// Source: FDA, "Converting Units of Measure for Folate, Niacin, and Vitamins A, D, and E on the
// Nutrition and Supplement Facts Labels: Guidance for Industry" (August 2019), re-read on October 11,
// 2026 (fda.gov/media/129863/download).
//   Vitamin D: "One IU of vitamin D has been previously defined as the activity of 0.025 mcg of
//     cholecalciferol"; "1 mcg cholecalciferol = 40 IU vitamin D".
//   Vitamin A, Table 3, IU to mcg RAE: pre-formed vitamin A (retinol) 0.30; supplemental
//     beta-carotene 0.30; dietary beta-carotene 0.05; dietary alpha-carotene or beta-cryptoxanthin
//     0.025. "There is no direct conversion factor from the vitamin A declared on labels in IU to mcg
//     RAE, only individual conversion factors".
//   Vitamin E, Table 6, IU to mg alpha-tocopherol: natural (RRR-alpha-tocopherol and its esters)
//     0.67; synthetic (all-rac-alpha-tocopherol and its esters) 0.45.
//   Folate: "mcg DFE = mcg naturally occurring folate + (1.7 x mcg folic acid)".
//   Niacin: "mg NE = mg niacin + (mg tryptophan / 60)".
//   Table 1, the 2016 RDIs (adults and children 4 years and older): folate 400 mcg DFE, niacin 16 mg
//     NE, vitamin A 900 mcg RAE, vitamin D 20 mcg, vitamin E 15 mg alpha-tocopherol.
//
// The source form is a required choice for vitamins A and E: there is no single factor without it.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const QUANTITIES = [
  { value: 'vitamin-d', text: 'Vitamin D (D2 or D3)', factor: 0.025, unit: 'mcg', dv: 20, dvUnit: 'mcg', form: 'vitamin D' },
  { value: 'vitamin-a-retinol', text: 'Vitamin A: pre-formed (retinol)', factor: 0.30, unit: 'mcg RAE', dv: 900, dvUnit: 'mcg RAE', form: 'pre-formed vitamin A (retinol)' },
  { value: 'vitamin-a-supplemental-beta-carotene', text: 'Vitamin A: supplemental beta-carotene', factor: 0.30, unit: 'mcg RAE', dv: 900, dvUnit: 'mcg RAE', form: 'supplemental beta-carotene' },
  { value: 'vitamin-a-dietary-beta-carotene', text: 'Vitamin A: dietary beta-carotene', factor: 0.05, unit: 'mcg RAE', dv: 900, dvUnit: 'mcg RAE', form: 'dietary beta-carotene' },
  { value: 'vitamin-a-other-carotenoid', text: 'Vitamin A: dietary alpha-carotene or beta-cryptoxanthin', factor: 0.025, unit: 'mcg RAE', dv: 900, dvUnit: 'mcg RAE', form: 'dietary alpha-carotene or beta-cryptoxanthin' },
  { value: 'vitamin-e-natural', text: 'Vitamin E: natural (RRR-alpha-tocopherol, d-alpha)', factor: 0.67, unit: 'mg', dv: 15, dvUnit: 'mg alpha-tocopherol', form: 'natural vitamin E (RRR-alpha-tocopherol)' },
  { value: 'vitamin-e-synthetic', text: 'Vitamin E: synthetic (all-rac-alpha-tocopherol, dl-alpha)', factor: 0.45, unit: 'mg', dv: 15, dvUnit: 'mg alpha-tocopherol', form: 'synthetic vitamin E (all-rac-alpha-tocopherol)' },
  { value: 'folate-dfe', text: 'Folate: food folate and folic acid to mcg DFE', dv: 400, dvUnit: 'mcg DFE' },
  { value: 'niacin-ne', text: 'Niacin: niacin and tryptophan to mg NE', dv: 16, dvUnit: 'mg NE' },
];
export const DIRECTIONS = [{ value: 'from-iu', text: 'From IU to metric' }, { value: 'to-iu', text: 'From metric to IU' }];
const NOTE = 'These are FDA\'s factors for Nutrition and Supplement Facts labels. The percent Daily Value uses the 2016 values for adults and children 4 years and older. It is a unit conversion, not a dose.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (x) => Number(x.toPrecision(6)).toLocaleString('en-US', { maximumFractionDigits: 4 });
const pct = (x, dv) => Math.round((x / dv) * 100);

export function vitaminIuConverter(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const q = QUANTITIES.find((x) => x.value === String(o.quantity ?? '').trim());
  if (!q) return { valid: false, message: 'Choose the vitamin and its form. For vitamins A and E there is no single factor without the form.' };
  const base = { valid: true, quantity: q.value, note: NOTE };
  if (q.value === 'folate-dfe' || q.value === 'niacin-ne') {
    const folate = q.value === 'folate-dfe';
    const a = folate ? ['the food folate', o.amount, 'mcg'] : ['the niacin', o.amount, 'mg'];
    const b = folate ? ['the folic acid', o.amount2, 'mcg'] : ['the tryptophan', o.amount2, 'mg'];
    if (blank(o.amount) && blank(o.amount2)) return { valid: false, message: folate ? 'Enter the food folate, the folic acid, or both, in mcg.' : 'Enter the niacin, the tryptophan, or both, in mg.' };
    const checks = [a, b].filter(([, v]) => !blank(v)).map(([label, v, unit]) => [label, v, 0, 1e7, unit]);
    const f = inputFault(checks);
    if (f) return { valid: false, message: f };
    const x = blank(o.amount) ? 0 : Number(o.amount); const y = blank(o.amount2) ? 0 : Number(o.amount2);
    const total = folate ? x + 1.7 * y : x + y / 60;
    return { ...base, flag: 'converted', abnormal: false, result: Number(total.toPrecision(6)), unit: q.dvUnit, percentDailyValue: pct(total, q.dv),
      band: folate ? `${say(x)} mcg of food folate + 1.7 × ${say(y)} mcg of folic acid = ${say(total)} mcg DFE, which is ${pct(total, q.dv)}% of the Daily Value of 400 mcg DFE.` : `${say(x)} mg of niacin + ${say(y)} mg of tryptophan ÷ 60 = ${say(total)} mg NE, which is ${pct(total, q.dv)}% of the Daily Value of 16 mg NE.`,
      bandLabel: `${say(total)} ${q.dvUnit}`,
      notes: [folate ? 'FDA: folic acid is 85% bioavailable and naturally occurring folate about 50%, so folic acid counts 1.7 times.' : 'FDA: a mean of 60 mg of tryptophan is equivalent to 1 mg of niacin.', ...(blank(o.amount) || blank(o.amount2) ? [`The ${blank(o.amount) ? a[0].replace('the ', '') : b[0].replace('the ', '')} was left blank and counted as none.`] : [])] };
  }
  const dir = String(o.direction ?? '').trim();
  if (dir !== 'from-iu' && dir !== 'to-iu') return { valid: false, message: 'Choose the direction: from IU to metric, or from metric to IU.' };
  const f = inputFault([['the amount', o.amount, null, 1e9, dir === 'from-iu' ? 'IU' : q.unit]]);
  if (f) return { valid: false, message: f };
  const x = Number(o.amount);
  const metric = dir === 'from-iu' ? x * q.factor : x; const iu = dir === 'from-iu' ? x : x / q.factor;
  const notes = [`FDA factor for ${q.form}: 1 IU = ${q.factor} ${q.unit}${q.value === 'vitamin-d' ? ' (1 mcg = 40 IU), for D2 and D3 alike' : ''}.`];
  if (q.value.startsWith('vitamin-a')) notes.push('FDA: there is no direct conversion factor from vitamin A in IU to mcg RAE without the source; a mixture needs each part converted by its own factor.');
  if (q.value.startsWith('vitamin-e')) notes.push('The factor covers the ester forms too (the acetate and the succinate).');
  return { ...base, flag: 'converted', abnormal: false, direction: dir, metric: Number(metric.toPrecision(6)), iu: Number(iu.toPrecision(6)), unit: q.unit, percentDailyValue: pct(metric, q.dv),
    band: dir === 'from-iu' ? `${say(x)} IU of ${q.form} × ${q.factor} = ${say(metric)} ${q.unit}, which is ${pct(metric, q.dv)}% of the Daily Value of ${say(q.dv)} ${q.dvUnit}.` : `${say(x)} ${q.unit} of ${q.form} ÷ ${q.factor} = ${say(iu)} IU; ${say(x)} ${q.unit} is ${pct(metric, q.dv)}% of the Daily Value of ${say(q.dv)} ${q.dvUnit}.`,
    bandLabel: dir === 'from-iu' ? `${say(metric)} ${q.unit}` : `${say(iu)} IU`, notes };
}
