// spec-v1633 tool 13: antiepileptic formulation and route switches, as each label states them.
//
// Six label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Depakote ER (AbbVie, DailyMed version 1658), section 2.2, "Conversion from Depakote to Depakote
//     ER": adults and children 10 and older, "once-daily using a dose 8 to 20% higher than the total
//     daily dose of Depakote (Table 1)". Table 1, Depakote total daily dose to Depakote ER (mg):
//     500*-625, 750; 750*-875, 1,000; 1,000*-1,125, 1,250; 1,250-1,375, 1,500; 1,500-1,625, 1,750;
//     1,750, 2,000; 1,875-2,000, 2,250; 2,125-2,250, 2,500; 2,375, 2,750; 2,500-2,750, 3,000; 2,875,
//     3,250; 3,000-3,125, 3,500. "* These total daily doses of Depakote cannot be directly converted
//     to an 8 to 20% higher total daily dose of Depakote ER". "There is insufficient data to allow a
//     conversion factor recommendation for patients with DEPAKOTE doses above 3,125 mg/day."
//   Valproate sodium injection (Sagent, version 3): "the total daily dose ... should be equivalent to
//     the total daily dose of the oral valproate product ... as a 60 minute infusion (but not more
//     than 20 mg/min) with the same frequency as the oral products".
//   Keppra injection (UCB, version 29): "When switching from or to oral KEPPRA, the total daily
//     dosage/frequency of KEPPRA injection should be equivalent to those of oral KEPPRA".
//   Tegretol (Novartis, version 39): tablets to suspension, "the same number of mg per day in
//     smaller, more frequent doses (i.e., twice a day tablets to three times a day suspension)";
//     tablets to Tegretol-XR, "the same total daily mg dose", twice a day.
//   Cerebyx (Pfizer, version 38), section 2.6: "CEREBYX can be substituted for oral phenytoin at the
//     same total daily phenytoin sodium equivalents (PE) dose"; "no need to perform molecular
//     weight-based adjustments when converting between fosphenytoin and phenytoin sodium doses".
//   Dilantin Infatabs (Pfizer, version 58), section 2.5: "approximately an 8% increase in drug
//     content with the free acid form over that of the sodium salt".
//
// For phenytoin free acid and sodium salt the tool shows the drug content of both and the
// difference. It does not pick the new dose: the label says adjustment and levels "may be necessary".
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const DEPAKOTE = { brand: 'Depakote ER', setId: '0dc024ce-efc8-4690-7cb5-639c728fccac' };
const VALPROATE = { brand: 'valproate sodium injection (Sagent)', setId: '8d5fc1c1-d3c0-497e-971b-6c4dba9a3fad' };
const KEPPRA = { brand: 'Keppra injection', setId: 'c6d5784d-abf9-45fe-ac5a-d5c53bd50f7e' };
const TEGRETOL = { brand: 'Tegretol', setId: '8d409411-aa9f-4f3a-a52c-fbcb0c3ec053' };
const CEREBYX = { brand: 'Cerebyx', setId: 'd4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a' };
const DILANTIN = { brand: 'Dilantin Infatabs', setId: 'ca119a89-2394-4d34-8078-cd1fa4e8e2f1' };
export const LABELS = { depakote: DEPAKOTE, valproate: VALPROATE, keppra: KEPPRA, tegretol: TEGRETOL, cerebyx: CEREBYX, dilantin: DILANTIN };
export const SWITCHES = [
  { value: 'depakote-to-er', text: 'Depakote (delayed-release) to Depakote ER', label: DEPAKOTE, unit: 'mg' },
  { value: 'valproate-oral-to-iv', text: 'Oral valproate to valproate injection', label: VALPROATE, unit: 'mg' },
  { value: 'levetiracetam-oral-and-iv', text: 'Levetiracetam: oral to injection, or injection to oral', label: KEPPRA, unit: 'mg' },
  { value: 'carbamazepine-tablets-to-xr', text: 'Carbamazepine tablets to Tegretol-XR', label: TEGRETOL, unit: 'mg' },
  { value: 'carbamazepine-tablets-to-suspension', text: 'Carbamazepine tablets to suspension', label: TEGRETOL, unit: 'mg' },
  { value: 'phenytoin-oral-to-fosphenytoin', text: 'Oral phenytoin to fosphenytoin (Cerebyx)', label: CEREBYX, unit: 'mg PE' },
  { value: 'phenytoin-acid-to-sodium', text: 'Phenytoin free acid (Infatabs, suspension) to sodium salt (capsules, injection)', label: DILANTIN, unit: 'mg' },
  { value: 'phenytoin-sodium-to-acid', text: 'Phenytoin sodium salt (capsules, injection) to free acid (Infatabs, suspension)', label: DILANTIN, unit: 'mg' },
];
// Depakote ER Table 1: [Depakote total daily dose from, to, Depakote ER mg]. 500, 750 and 1,000 are asterisked.
export const DEPAKOTE_ROWS = [[500, 625, 750], [750, 875, 1000], [1000, 1125, 1250], [1250, 1375, 1500], [1500, 1625, 1750], [1750, 1750, 2000], [1875, 2000, 2250], [2125, 2250, 2500], [2375, 2375, 2750], [2500, 2750, 3000], [2875, 2875, 3250], [3000, 3125, 3500]];
export const DEPAKOTE_ASTERISK = [500, 750, 1000];
const NOTE = 'This reports what the label states for the switch. It does not prescribe, and every one of these labels says plasma levels and dose adjustment may be needed after a switch.';
const say = (x) => Number(x.toFixed(2)).toLocaleString('en-US');
const rowText = ([lo, hi]) => (lo === hi ? `${say(lo)} mg` : `${say(lo)} to ${say(hi)} mg`);

export function aedFormulationSwitch(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const sw = SWITCHES.find((s) => s.value === String(o.switch ?? '').trim());
  if (!sw) return { valid: false, message: 'Choose the switch: the drug, and the formulation or route it is moving between.' };
  const f = inputFault([['the current total daily dose', o.dailyDose, null, 20000, sw.unit]]);
  if (f) return { valid: false, message: f };
  const L = sw.label; const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's statement is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the conversion from the label in hand.'], note: NOTE };
  const d = Number(o.dailyDose);
  const base = { valid: true, switch: sw.value, dailyDose: d, labelUrl: lr.url, note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const same = (band, notes) => ({ ...base, flag: 'dose', abnormal: false, targetDailyDose: d, band, bandLabel: `${say(d)} ${sw.unit} a day`, notes: [...notes, ...tail] });

  if (sw.value === 'depakote-to-er') {
    if (d > 3125) return { ...base, flag: 'no-recommendation-given', abnormal: true, band: `The Depakote ER label says there is insufficient data to allow a conversion factor recommendation for Depakote doses above 3,125 mg a day; ${say(d)} mg is above it.`, bandLabel: 'Insufficient data above 3,125 mg', notes: tail };
    const row = DEPAKOTE_ROWS.find(([lo, hi]) => d >= lo && d <= hi);
    if (!row) {
      const below = [...DEPAKOTE_ROWS].reverse().find((r) => r[1] < d); const above = DEPAKOTE_ROWS.find((r) => r[0] > d);
      const near = [below, above].filter(Boolean).map((r) => `${rowText(r)} (Depakote ER ${say(r[2])} mg)`).join(' and ');
      return { ...base, flag: 'not-in-table', abnormal: true, band: `${say(d)} mg a day is not in the Depakote ER label's conversion table. The nearest row${below && above ? 's are' : ' is'} ${near}.`, bandLabel: 'Not in the label\'s table', notes: ['The table lists Depakote total daily doses in steps of 125 mg, from 500 to 3,125 mg.', ...tail] };
    }
    const er = row[2]; const pct = ((er - d) / d) * 100;
    const notes = [`Row matched: Depakote ${rowText(row)} a day to Depakote ER ${say(er)} mg once daily, which is ${say(pct)}% higher than ${say(d)} mg. The label's conversion is for adults and children 10 years and older with epilepsy.`];
    const star = DEPAKOTE_ASTERISK.includes(d);
    if (star) notes.push(`The label marks ${say(d)} mg with an asterisk: it cannot be directly converted to an 8 to 20% higher Depakote ER dose with the strengths available, and the label suggests considering an increase to the next higher Depakote dose before converting.`);
    notes.push('The label says trough valproate concentrations are on average equivalent but may vary across patients after conversion.');
    return { ...base, flag: star ? 'dose-with-caution' : 'dose', abnormal: star, targetDailyDose: er, percentHigher: Number(pct.toFixed(1)), band: `The Depakote ER label's table gives ${say(er)} mg of Depakote ER once daily for a Depakote total daily dose of ${rowText(row)}.`, bandLabel: `Depakote ER ${say(er)} mg once daily`, notes: [...notes, ...tail] };
  }
  if (sw.value === 'valproate-oral-to-iv') return same(`The valproate injection label: the total daily dose of the injection is equivalent to the total daily dose of the oral valproate product, ${say(d)} mg a day, given with the same frequency as the oral product.`, ['Each dose is given as a 60-minute infusion, at no more than 20 mg a minute.', 'The label says plasma concentration monitoring and dosage adjustments may be necessary, and to switch back to oral valproate as soon as it is clinically feasible.']);
  if (sw.value === 'levetiracetam-oral-and-iv') return same(`The Keppra injection label: when switching from or to oral Keppra, the total daily dosage and frequency of the injection are equivalent to those of oral Keppra, ${say(d)} mg a day.`, ['The label notes no clinical study experience with intravenous levetiracetam for longer than 4 days.']);
  if (sw.value === 'carbamazepine-tablets-to-xr') return same(`The Tegretol label: tablets to Tegretol-XR at the same total daily dose, ${say(d)} mg a day, given twice a day.`, ['Tegretol-XR tablets are swallowed whole, never crushed or chewed.']);
  if (sw.value === 'carbamazepine-tablets-to-suspension') return same(`The Tegretol label: tablets to suspension at the same number of mg per day, ${say(d)} mg, in smaller, more frequent doses (for example twice-a-day tablets to three-times-a-day suspension).`, ['The label explains that the suspension gives higher peak levels than the same dose as a tablet.']);
  if (sw.value === 'phenytoin-oral-to-fosphenytoin') return same(`The Cerebyx label: when oral phenytoin is not possible, Cerebyx is substituted at the same total daily dose in phenytoin sodium equivalents, ${say(d)} mg PE a day.`, ['The label says no molecular-weight adjustment is needed between fosphenytoin and phenytoin sodium doses.', 'Dilantin capsules are about 90% bioavailable and Cerebyx is 100% bioavailable, so the label says serum phenytoin concentrations may increase modestly after the substitution.', 'Cerebyx is always prescribed in mg PE. Loading doses are a different question.']);
  // phenytoin free acid <-> sodium salt: content only
  const toSodium = sw.value === 'phenytoin-acid-to-sodium';
  const before = toSodium ? d : d * 0.92; const after = toSodium ? d * 0.92 : d;
  const change = ((after - before) / before) * 100;
  return { ...base, flag: 'content-comparison', abnormal: true, acidContentBefore: Number(before.toFixed(2)), acidContentAfter: Number(after.toFixed(2)), percentChange: Number(change.toFixed(1)),
    band: `At the same ${say(d)} mg a day, the ${toSodium ? 'free-acid' : 'sodium-salt'} product holds ${say(before)} mg of phenytoin and the ${toSodium ? 'sodium-salt' : 'free-acid'} product holds ${say(after)} mg: ${change < 0 ? `${say(-change)}% less` : `${say(change)}% more`} drug on the same number of milligrams.`,
    bandLabel: `${change < 0 ? `${say(-change)}% less` : `${say(change)}% more`} drug at the same mg`,
    notes: ['The Dilantin label: the free-acid form (Infatabs, suspension) has approximately 8% more drug content than the sodium salt (capsules, injection), so dosage adjustments and serum level monitoring may be necessary when switching either way.', 'The sodium-salt content is taken as 0.92 of its milligrams, the label\'s "approximately 8%". The tool compares content; it does not pick the new dose.', 'Phenytoin has nonlinear kinetics: a small change in dose can move the level more than in proportion.', ...tail] };
}
