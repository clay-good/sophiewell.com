// spec-v1633 tool 15: formulation and route switches a label states (cardiac and other).
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Digoxin tablets (Amneal, DailyMed version 20), Table 6, "Comparison of the Systemic Availability
//     and Equivalent Doses of Oral and Intravenous Digoxin": tablets (absolute bioavailability 60% to
//     80%) 62.5, 125, 250, 500 mcg; intravenous injection (100%) 50, 100, 200, 400 mcg.
//   Coreg CR (Waylis, version 3), Table 1: immediate-release carvedilol 3.125 mg twice daily, 10 mg
//     once daily; 6.25 mg twice daily, 20 mg; 12.5 mg twice daily, 40 mg; 25 mg twice daily, 80 mg.
//     "When switching from carvedilol 12.5 mg or 25 mg twice daily, a starting dose of COREG CR 20 mg
//     or 40 mg once daily, respectively, may be warranted for elderly patients or those at increased
//     risk of hypotension, dizziness, or syncope."
//   Concerta (Janssen, version 30), Table 2, from immediate-release methylphenidate twice or three
//     times daily: 5 mg, 18 mg every morning; 10 mg, 36 mg; 15 mg, 54 mg; 20 mg, 72 mg ("Only for
//     patients 13-65 years of age").
//   Bumetanide tablets (Sun, version 5): "1 mg bumetanide has a diuretic potency equivalent to
//     approximately 40 mg furosemide"; "bumetanide can be substituted at approximately a 1:40 ratio
//     of bumetanide in proportion to furosemide in patients allergic to furosemide".
//
// Only pairs a label states. A dose a table does not list is reported as not in the table.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const DIGOXIN = { brand: 'digoxin tablets (Amneal)', setId: 'dfac7f13-28be-423d-9389-9089da29da17' };
const COREG = { brand: 'Coreg CR', setId: 'd3625d78-6eb6-41fe-8f6f-664965c104c4' };
const CONCERTA = { brand: 'Concerta', setId: '1a88218c-5b18-4220-8f56-526de1a276cd' };
const BUMETANIDE = { brand: 'bumetanide tablets (Sun)', setId: '5c753aae-77b7-4add-8453-385a8f62d7db' };
export const LABELS = { digoxin: DIGOXIN, coreg: COREG, concerta: CONCERTA, bumetanide: BUMETANIDE };
export const SWITCHES = [
  { value: 'digoxin-iv-to-tablet', text: 'Digoxin: intravenous to tablets', label: DIGOXIN, ask: 'the intravenous digoxin dose', unit: 'mcg', max: 2000 },
  { value: 'digoxin-tablet-to-iv', text: 'Digoxin: tablets to intravenous', label: DIGOXIN, ask: 'the digoxin tablet dose', unit: 'mcg', max: 2000 },
  { value: 'carvedilol-ir-to-cr', text: 'Carvedilol immediate-release to Coreg CR', label: COREG, ask: 'the carvedilol dose taken twice daily', unit: 'mg', max: 100 },
  { value: 'methylphenidate-ir-to-concerta', text: 'Methylphenidate immediate-release to Concerta', label: CONCERTA, ask: 'the methylphenidate dose taken two or three times daily', unit: 'mg', max: 100 },
  { value: 'furosemide-to-bumetanide', text: 'Furosemide to bumetanide', label: BUMETANIDE, ask: 'the furosemide dose', unit: 'mg', max: 2000 },
  { value: 'bumetanide-to-furosemide', text: 'Bumetanide to furosemide', label: BUMETANIDE, ask: 'the bumetanide dose', unit: 'mg', max: 50 },
];
export const DIGOXIN_PAIRS = [[50, 62.5], [100, 125], [200, 250], [400, 500]]; // [intravenous mcg, tablet mcg]
export const CARVEDILOL_PAIRS = [[3.125, 10], [6.25, 20], [12.5, 40], [25, 80]]; // [mg twice daily, Coreg CR mg once daily]
export const CONCERTA_PAIRS = [[5, 18], [10, 36], [15, 54], [20, 72]]; // [IR mg per dose, Concerta mg every morning]
const NOTE = 'This reports what the label states for the switch. It does not prescribe, and it holds only the pairs a label states.';
const say = (x) => Number(x.toFixed(3)).toLocaleString('en-US', { maximumFractionDigits: 3 });

export function labelFormulationSwitch(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const sw = SWITCHES.find((s) => s.value === String(o.switch ?? '').trim());
  if (!sw) return { valid: false, message: 'Choose the switch: the drug and the two formulations.' };
  const f = inputFault([[sw.ask, o.dose, null, sw.max, sw.unit]]);
  if (f) return { valid: false, message: f };
  const L = sw.label; const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's statement is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the conversion from the label in hand.'], note: NOTE };
  const d = Number(o.dose);
  const base = { valid: true, switch: sw.value, dose: d, labelUrl: lr.url, note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const notInTable = (list, unit, extra = []) => ({ ...base, flag: 'not-in-table', abnormal: true, band: `${say(d)} ${unit} is not in the ${L.brand} label's table. Its rows are ${list.map(say).join(', ')} ${unit}.`, bandLabel: 'Not in the label\'s table', notes: [...extra, ...tail] });

  if (sw.value === 'digoxin-iv-to-tablet' || sw.value === 'digoxin-tablet-to-iv') {
    const toTab = sw.value === 'digoxin-iv-to-tablet'; const from = toTab ? 0 : 1;
    const pair = DIGOXIN_PAIRS.find((p) => p[from] === d);
    const why = 'The label\'s table sets tablets at an absolute bioavailability of 60% to 80% against 100% for the intravenous injection, and says to allow for the difference when calculating maintenance doses.';
    if (!pair) return notInTable(DIGOXIN_PAIRS.map((p) => p[from]), 'mcg', [why]);
    const target = pair[toTab ? 1 : 0];
    return { ...base, flag: 'dose', abnormal: false, targetDose: target, band: `The digoxin label's table of equivalent doses: ${say(pair[0])} mcg intravenous corresponds to ${say(pair[1])} mcg as tablets, so ${say(d)} mcg ${toTab ? 'intravenous' : 'as tablets'} goes to ${say(target)} mcg ${toTab ? 'as tablets' : 'intravenous'}.`, bandLabel: `${say(target)} mcg ${toTab ? 'as tablets' : 'intravenous'}`, notes: [why, ...tail] };
  }
  if (sw.value === 'carvedilol-ir-to-cr') {
    const pair = CARVEDILOL_PAIRS.find((p) => p[0] === d);
    if (!pair) return notInTable(CARVEDILOL_PAIRS.map((p) => p[0]), 'mg twice daily', ['Enter the dose taken at each of the two daily administrations, not the daily total.']);
    const notes = [`Row matched: ${say(d * 2)} mg a day (${say(d)} mg twice daily) to Coreg CR ${pair[1]} mg once daily.`];
    let lower = null;
    if (d === 12.5 || d === 25) { lower = d === 12.5 ? 20 : 40; notes.push(`The label adds that from ${say(d)} mg twice daily a starting dose of Coreg CR ${lower} mg once daily may be warranted for elderly patients or those at increased risk of hypotension, dizziness or syncope.`); }
    notes.push('Coreg CR is taken once daily in the morning with food, and later titration is at intervals of at least 2 weeks.');
    return { ...base, flag: 'dose', abnormal: false, targetDose: pair[1], ...(lower ? { lowerStartDose: lower } : {}), band: `The Coreg CR label's table gives ${pair[1]} mg once daily for immediate-release carvedilol ${say(d)} mg twice daily.`, bandLabel: `Coreg CR ${pair[1]} mg once daily`, notes: [...notes, ...tail] };
  }
  if (sw.value === 'methylphenidate-ir-to-concerta') {
    const pair = CONCERTA_PAIRS.find((p) => p[0] === d);
    if (!pair) return notInTable(CONCERTA_PAIRS.map((p) => p[0]), 'mg twice or three times daily', ['Enter the dose taken at each administration, not the daily total.']);
    const notes = [`Row matched: methylphenidate ${say(d)} mg twice daily or three times daily to Concerta ${pair[1]} mg every morning.`];
    if (pair[1] === 72) notes.push('The label marks 72 mg "only for patients 13 to 65 years of age"; the maximum for ages 6 to 12 is 54 mg a day.');
    notes.push('Later increases are in 18 mg steps at weekly intervals.');
    return { ...base, flag: 'dose', abnormal: pair[1] === 72, targetDose: pair[1], band: `The Concerta label's table gives ${pair[1]} mg every morning for immediate-release methylphenidate ${say(d)} mg twice or three times daily.`, bandLabel: `Concerta ${pair[1]} mg every morning`, notes: [...notes, ...tail] };
  }
  const toBum = sw.value === 'furosemide-to-bumetanide';
  const target = toBum ? d / 40 : d * 40;
  const notes = ['The bumetanide label: 1 mg of bumetanide has a diuretic potency equivalent to approximately 40 mg of furosemide.'];
  if (toBum) notes.push('The label states the substitution for patients allergic to furosemide, at approximately a 1:40 ratio, because cross-sensitivity has rarely been observed.');
  else notes.push('The label states the potency ratio and the substitution toward bumetanide. It gives no instruction for a switch from bumetanide to furosemide, so this is the potency figure only.');
  return { ...base, flag: toBum ? 'dose' : 'potency-only', abnormal: !toBum, targetDose: Number(target.toFixed(3)), band: toBum ? `At the label's approximate 1:40 ratio, ${say(d)} mg of furosemide corresponds to ${say(target)} mg of bumetanide.` : `By the label's potency statement, ${say(d)} mg of bumetanide has about the diuretic potency of ${say(target)} mg of furosemide.`, bandLabel: `About ${say(target)} mg of ${toBum ? 'bumetanide' : 'furosemide'}`, notes: [...notes, 'The ratio is approximate, by the label\'s own word.', ...tail] };
}
