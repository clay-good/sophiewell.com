// spec-v1633 tool 20: an antidepressant dose in fluoxetine equivalents.
//
// Source: Hayasaka Y, Purgato M, Magni LR, et al. Dose equivalents of antidepressants: evidence-based
// recommendations from randomized controlled trials. J Affect Disord 2015;180:179-184 (PMID
// 25911132). The abstract was re-read on October 11, 2026; the full tables were not read.
//   "In the primary analysis, fluoxetine 40mg/day was equivalent to paroxetine dosage of 34.0mg/day,
//   agomelatine 53.2mg/day, amitriptyline, 122.3mg/day, bupropion 348.5mg/day, clomipramine
//   116.1mg/day, desipramine 196.3mg/day, dothiepin 154.8mg/day, doxepin 140.1mg/day, escitalopram
//   18.0mg/day, fluvoxamine 143.3mg/day, imipramine 137.2mg/day, lofepramine 250.2mg/day, maprotiline
//   118.0mg/day, mianserin, 101.1mg/day, mirtazapine 50.9mg/day, moclobemide 575.2mg/day, nefazodone
//   535.2mg/day, nortriptyline 100.9mg/day, reboxetine 11.5mg/day, sertraline 98.5mg/day, trazodone
//   401.4mg/day, and venlafaxine 149.4mg/day. Sensitivity analyses corroborated the results except for
//   doxepin."
//
//   fluoxetine equivalent (mg/day) = dose (mg/day) x 40 / E,  E = the dose equal to fluoxetine 40 mg
//
// A measure of dose intensity for research and audit. It is not a cross-taper plan. Citalopram,
// duloxetine and vortioxetine are not in the primary analysis the abstract reports and are not offered.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// [drug, the daily dose equal to fluoxetine 40 mg/day]
export const EQUIVALENTS = [['fluoxetine', 40], ['paroxetine', 34.0], ['agomelatine', 53.2], ['amitriptyline', 122.3], ['bupropion', 348.5], ['clomipramine', 116.1], ['desipramine', 196.3], ['dothiepin', 154.8], ['doxepin', 140.1], ['escitalopram', 18.0], ['fluvoxamine', 143.3], ['imipramine', 137.2], ['lofepramine', 250.2], ['maprotiline', 118.0], ['mianserin', 101.1], ['mirtazapine', 50.9], ['moclobemide', 575.2], ['nefazodone', 535.2], ['nortriptyline', 100.9], ['reboxetine', 11.5], ['sertraline', 98.5], ['trazodone', 401.4], ['venlafaxine', 149.4]];
export const DRUGS = EQUIVALENTS.map(([d]) => ({ value: d, text: d[0].toUpperCase() + d.slice(1) }));
const NOTE = 'A measure of dose intensity from randomized flexible-dose trials, read from the paper\'s abstract. It compares doses for research and audit; it is not a plan for switching or cross-tapering, and the method assumes a dose-response relationship.';
const say = (x) => Number(x.toPrecision(4)).toLocaleString('en-US', { maximumFractionDigits: 1 });

export function antidepressantFluoxetineEquivalent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const row = EQUIVALENTS.find(([d]) => d === String(o.drug ?? '').trim());
  if (!row) return { valid: false, message: 'Choose the antidepressant. The paper\'s primary analysis covers 23; citalopram, duloxetine and vortioxetine are not among them.' };
  const f = inputFault([['the daily dose', o.dailyDose, null, 5000, 'mg']]);
  if (f) return { valid: false, message: f };
  const [drug, e] = row; const d = Number(o.dailyDose); const fe = (d * 40) / e;
  const notes = [`Hayasaka 2015: fluoxetine 40 mg a day was equivalent to ${drug} ${e} mg a day, from the weighted mean dose ratio in 83 randomized flexible-dose trials (14,131 participants).`];
  if (drug === 'doxepin') notes.push('The paper\'s sensitivity analyses corroborated every drug except doxepin, so this figure is the least secure.');
  notes.push('The authors note that the number of studies for some drugs was small.');
  return { valid: true, drug, flag: 'equivalent', abnormal: drug === 'doxepin', fluoxetineEquivalentMg: Number(fe.toPrecision(4)), band: drug === 'fluoxetine' ? `${say(d)} mg a day of fluoxetine is its own equivalent.` : `${say(d)} mg a day of ${drug} × 40 ÷ ${e} = ${say(fe)} mg a day in fluoxetine equivalents.`, bandLabel: `${say(fe)} mg fluoxetine equivalents`, notes, note: NOTE };
}
