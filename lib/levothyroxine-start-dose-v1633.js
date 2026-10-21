// spec-v1633 tool 16: levothyroxine starting dose and titration step, as the label gives them.
//
// One label row (spec-v1628 section 1): Synthroid (AbbVie, DailyMed version 1537), section 2.3,
// re-read on October 11, 2026.
//   Table 1, adults: "Full replacement dose is 1.6 mcg/kg/day. Some patients require a lower starting
//     dose. Titrate dosage by 12.5 to 25 mcg increments every 4 to 6 weeks"; "Adults at risk for
//     atrial fibrillation or with underlying cardiac disease: Lower starting dose (less than 1.6
//     mcg/kg/day). Titrate dosage every 6 to 8 weeks"; "Geriatric patients: Lower starting dose (less
//     than 1.6 mcg/kg/day)". "Dosages greater than 200 mcg/day are seldom required. An inadequate
//     response to daily dosages greater than 300 mcg/day is rare".
//   Table 2, pediatric starting daily dose per kg: 0-3 months, 10-15 mcg/kg/day; 3-6 months, 8-10;
//     6-12 months, 6-8; 1-5 years, 5-6; 6-12 years, 4-5; greater than 12 years with growth and puberty
//     incomplete, 2-3; growth and puberty complete, 1.6. "Titrate the dosage (every 2 weeks)".
//   "Pediatric Patients at Risk for Hyperactivity: ... start at one-fourth the recommended full
//     replacement dosage, and increase on a weekly basis by one-fourth".
//   Tablet strengths (section 3): 25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200 and 300 mcg.
//
// The label says "mcg/kg/day" without naming actual or ideal weight; the weight is the reader's entry
// and the result says so. Where the label gives no number (the lower adult start), the tool says so.
//
// Pure: no DOM, no network; `now` is passed in.

import { dpSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { brand: 'Synthroid', setId: '1e11ad30-1041-4520-10b0-8f9d30d30fcc' };
export const GROUPS = [
  { value: 'adult', text: 'Adult', adult: true },
  { value: 'adult-cardiac', text: 'Adult at risk for atrial fibrillation or with underlying cardiac disease', adult: true },
  { value: 'adult-geriatric', text: 'Geriatric patient', adult: true },
  { value: 'ped-0-3m', text: 'Child: 0 to 3 months', range: [10, 15], row: '0 to 3 months' },
  { value: 'ped-3-6m', text: 'Child: 3 to 6 months', range: [8, 10], row: '3 to 6 months' },
  { value: 'ped-6-12m', text: 'Child: 6 to 12 months', range: [6, 8], row: '6 to 12 months' },
  { value: 'ped-1-5y', text: 'Child: 1 to 5 years', range: [5, 6], row: '1 to 5 years' },
  { value: 'ped-6-12y', text: 'Child: 6 to 12 years', range: [4, 5], row: '6 to 12 years' },
  { value: 'ped-over-12-incomplete', text: 'Over 12 years, growth and puberty incomplete', range: [2, 3], row: 'greater than 12 years, growth and puberty incomplete' },
  { value: 'ped-growth-complete', text: 'Growth and puberty complete', range: [1.6, 1.6], row: 'growth and puberty complete' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const TABLETS = [25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200, 300];
const NOTE = 'This reports what the label gives for these inputs. It does not prescribe. The label says dosing must be individualized and titrated to TSH or free T4.';
const say = (x) => Number(x.toFixed(1)).toLocaleString('en-US');
// The tablet strengths either side of a dose (or the one it equals).
export function tabletsAround(mcg) {
  if (TABLETS.includes(mcg)) return [mcg];
  const below = [...TABLETS].reverse().find((t) => t < mcg); const above = TABLETS.find((t) => t > mcg);
  return [below, above].filter((t) => t !== undefined);
}
const around = (mcg) => { const t = tabletsAround(dpSafe(mcg, TABLETS, 1)); return t.length === 1 ? `${t[0]} mcg is a tablet strength` : mcg > 300 ? 'above the largest tablet, 300 mcg' : mcg < 25 ? 'below the smallest tablet, 25 mcg' : `between the ${t[0]} and ${t[1]} mcg tablets`; };

export function levothyroxineStartDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const group = GROUPS.find((g) => g.value === String(o.group ?? '').trim());
  if (!group) return { valid: false, message: 'Choose the patient group. The label has a row for each.' };
  const f = inputFault([['the weight', o.weightKg, 0.5, 400, 'kg']]);
  if (f) return { valid: false, message: f };
  let hyper = 'no';
  if (!group.adult) {
    hyper = String(o.hyperactivityRisk ?? '').trim();
    if (hyper !== 'yes' && hyper !== 'no') return { valid: false, message: 'Say whether the child is at risk for hyperactivity: the label then starts at one-fourth of the full dose.' };
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: 'The Synthroid label\'s dosing tables are withheld, so no dose is reported.', bandLabel: 'Withheld', notes: [`The label rows are withheld: ${lr.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  const w = Number(o.weightKg);
  const base = { valid: true, group: group.value, weightKg: w, labelUrl: lr.url, note: NOTE };
  const weightNote = 'The label states the dose in mcg/kg/day without naming actual or ideal weight; the weight used is the one entered.';
  const tail = [weightNote, `Tablet strengths: ${TABLETS.join(', ')} mcg.`, `Label: ${lr.edition}.`];

  if (group.adult) {
    const full = 1.6 * w;
    const limits = [];
    if (full > 300) limits.push('The label says an inadequate response to more than 300 mcg a day is rare and may indicate poor compliance, malabsorption or drug interactions.');
    else if (full > 200) limits.push('The label says dosages greater than 200 mcg a day are seldom required.');
    if (group.value === 'adult') {
      // Shown at the digits that keep it on the same side of 200 mcg and each tablet as the decisions beside it.
      const sayFull = dpSafe(full, [200, ...TABLETS], 1).toLocaleString('en-US', { maximumFractionDigits: 12 });
      return { ...base, flag: 'dose', abnormal: full > 200, fullReplacementMcg: Number(full.toFixed(1)), tabletsAround: tabletsAround(Number(full.toFixed(1))), band: `The Synthroid label's full replacement dose is 1.6 mcg/kg/day: ${sayFull} mcg a day at ${say(w)} kg (${around(full)}).`, bandLabel: `${sayFull} mcg a day`, notes: ['The label adds that some patients require a lower starting dose.', 'Titration: 12.5 to 25 mcg increments every 4 to 6 weeks, as needed until the patient is euthyroid.', ...limits, ...tail] };
    }
    const who = group.value === 'adult-cardiac' ? 'adults at risk for atrial fibrillation or with underlying cardiac disease' : 'geriatric patients';
    return { ...base, flag: 'no-number-given', abnormal: true, fullReplacementMcg: Number(full.toFixed(1)), band: `For ${who} the Synthroid label gives a lower starting dose, less than 1.6 mcg/kg/day, and no number. Full replacement at ${say(w)} kg would be ${say(full)} mcg a day; the label's start is below that.`, bandLabel: `Below ${say(full)} mcg a day`, notes: [group.value === 'adult-cardiac' ? 'Titration for this group: every 6 to 8 weeks, as needed until the patient is euthyroid.' : 'The label\'s adult titration step is 12.5 to 25 mcg; it gives geriatric patients no separate interval.', ...limits, ...tail] };
  }
  const [lo, hi] = group.range; const low = lo * w; const high = hi * w;
  const one = lo === hi;
  const notes = [`Row matched: ${group.row}, ${one ? `${lo}` : `${lo} to ${hi}`} mcg/kg/day. Titration in children: every 2 weeks as needed, on TSH or free T4.`];
  if (group.value === 'ped-0-3m') notes.push('From birth to 3 months at risk for cardiac failure, the label starts lower and increases every 4 to 6 weeks; it gives no number.');
  const out = { ...base, flag: 'dose', abnormal: false, lowMcg: Number(low.toFixed(1)), highMcg: Number(high.toFixed(1)) };
  if (hyper === 'yes') {
    const q = (x) => x / 4;
    notes.unshift(`At risk for hyperactivity: the label starts at one-fourth of the full replacement dose and adds one-fourth each week. One-fourth is ${one ? say(q(low)) : `${say(q(low))} to ${say(q(high))}`} mcg a day; the full dose is reached in the fourth week.`);
    return { ...out, startLowMcg: Number(q(low).toFixed(1)), startHighMcg: Number(q(high).toFixed(1)), band: `The Synthroid label's full dose for this age is ${one ? say(low) : `${say(low)} to ${say(high)}`} mcg a day at ${say(w)} kg; at risk for hyperactivity it starts at one-fourth, ${one ? say(q(low)) : `${say(q(low))} to ${say(q(high))}`} mcg a day.`, bandLabel: `Start ${one ? say(q(low)) : `${say(q(low))} to ${say(q(high))}`} mcg a day`, notes: [...notes, ...tail] };
  }
  return { ...out, band: `The Synthroid label's starting dose for this age is ${one ? `${lo}` : `${lo} to ${hi}`} mcg/kg/day: ${one ? say(low) : `${say(low)} to ${say(high)}`} mcg a day at ${say(w)} kg.`, bandLabel: `${one ? say(low) : `${say(low)} to ${say(high)}`} mcg a day`, notes: [...notes, one ? `${say(low)} mcg is ${around(low)}.` : `${say(low)} mcg is ${around(low)}; ${say(high)} mcg is ${around(high)}.`, ...tail] };
}
