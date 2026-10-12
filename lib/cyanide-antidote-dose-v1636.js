// spec-v1636 backfill 2: the cyanide antidote doses by weight, for co-cn-antidote.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   NITHIODOTE, Hope (set ff4941b3-..., version 10). Adults: "10 mL of sodium nitrite at the rate
//     of 2.5 to 5 mL/minute" then "50 mL of sodium thiosulfate immediately following". Children:
//     "0.2 mL/kg (6 mg/kg or 6-8 mL/m2 BSA) of sodium nitrite at the rate of 2.5 to 5 mL/minute not
//     to exceed 10 mL" then "1 mL/kg of body weight (250 mg/kg or approximately 30-40 mL/m2 of BSA)
//     not to exceed 50 mL total dose". "If signs of cyanide poisoning reappear, repeat treatment
//     using one-half the original dose of both". Sodium nitrite 30 mg/mL; sodium thiosulfate
//     250 mg/mL. "Use Sodium nitrite with caution in patients less than 6 months of age".
//   CYANOKIT, BTG (set d56fcc8d-..., version 2). Adults: 5 g over 15 minutes; "a second dose of 5 g
//     may be administered ... for a total dose of 10 g", over 15 minutes to 2 hours. Section 8.4:
//     "Safety and effectiveness of CYANOKIT have not been established in this population. In non-US
//     marketing experience, a dose of 70 mg/kg has been used to treat pediatric patients." The
//     label states no pediatric maximum, so the 70 mg/kg figure is shown uncapped and marked as
//     not a labeled dose.
//
// The label says "Adults" and "Children" and draws no age line between them; the reader chooses.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  nithiodote: { name: 'NITHIODOTE', setId: 'ff4941b3-9901-4aab-adcf-c5327bede34e' },
  cyanokit: { name: 'CYANOKIT', setId: 'd56fcc8d-bd64-46ab-b0c0-2124bd745a6b' },
};
export const WHO = [
  { value: '', text: 'Choose' },
  { value: 'adult-dosing', text: 'Adult (the labels\' adult doses)' },
  { value: 'child-dosing', text: 'Child (the labels\' pediatric statements)' },
];
const r1 = (n) => Math.round(n * 10) / 10;
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function cyanideAntidoteDose(input, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const who = o.who === undefined || o.who === null ? '' : String(o.who);
  if (who !== 'adult-dosing' && who !== 'child-dosing') return { valid: false, message: 'Choose adult or child. The labels dose the two differently and draw no age line between them.' };
  const child = who === 'child-dosing';
  let kg = null;
  if (child) {
    const f = inputFault([['the weight', o.weight, 0.5, 150, 'kg']]);
    if (f) return { valid: false, message: f };
    kg = Number(o.weight);
  }
  const notes = [];
  const out = { valid: true, flag: 'dose', bandLabel: 'Label doses' };
  const nr = labelRow(LABELS.nithiodote.setId, now, table);
  if (nr.answers) {
    const nitriteMl = child ? Math.min(r1(kg * 0.2), 10) : 10;
    const thioMl = child ? Math.min(r1(kg * 1), 50) : 50;
    Object.assign(out, { nitriteMl, nitriteMg: r1(nitriteMl * 30), thiosulfateMl: thioMl, thiosulfateG: r1(thioMl * 0.25 * 10) / 10 });
    const capN = child && kg * 0.2 > 10 ? ' (the label\'s 10 mL ceiling; 0.2 mL/kg would be more)' : '';
    const capT = child && kg * 1 > 50 ? ' (the label\'s 50 mL ceiling; 1 mL/kg would be more)' : '';
    notes.push(`NITHIODOTE${child ? `, child at ${fmt(kg)} kg` : ', adult'}: sodium nitrite ${fmt(nitriteMl)} mL (${fmt(out.nitriteMg)} mg) intravenously at 2.5 to 5 mL/minute${capN}, then immediately sodium thiosulfate ${fmt(thioMl)} mL (${fmt(thioMl * 0.25)} g)${capT}.`);
    notes.push(`If signs of poisoning reappear, the label repeats both at one-half the original dose: sodium nitrite ${fmt(r1(nitriteMl / 2 * 10) / 10)} mL, then sodium thiosulfate ${fmt(r1(thioMl / 2 * 10) / 10)} mL.`);
    notes.push(`The label says to monitor blood pressure during the infusion${child ? ', to use sodium nitrite with caution under 6 months of age (higher risk of severe methemoglobinemia),' : ''} and not to give it in the same line as hydroxocobalamin.`);
  } else notes.push(`NITHIODOTE: ${nr.why}`);
  const cr = labelRow(LABELS.cyanokit.setId, now, table);
  if (cr.answers) {
    if (child) {
      out.hydroxocobalaminNotLabeledMg = Math.round(kg * 70);
      notes.push(`CYANOKIT: the label says safety and effectiveness have not been established in children. It notes that 70 mg/kg has been used outside the U.S., which at ${fmt(kg)} kg is ${fmt(out.hydroxocobalaminNotLabeledMg)} mg; that is not a labeled dose, and the label states no pediatric maximum.`);
    } else {
      out.hydroxocobalaminG = 5;
      notes.push('CYANOKIT, adult: 5 g by intravenous infusion over 15 minutes (one vial). A second 5 g may be given, over 15 minutes to 2 hours, for 10 g in all.');
    }
  } else notes.push(`CYANOKIT: ${cr.why}`);
  if (!nr.answers && !cr.answers) return { valid: true, flag: 'withheld', bandLabel: 'Withheld', band: 'No dose is shown: neither label row is current.', notes, note: notes.join(' ') };
  notes.push('These are the two labels\' doses side by side. The tool does not choose between them.');
  out.band = child ? `Cyanide antidote doses from the labels, child at ${fmt(kg)} kg.` : 'Cyanide antidote doses from the labels, adult.';
  return { ...out, notes, note: notes.join(' ') };
}
