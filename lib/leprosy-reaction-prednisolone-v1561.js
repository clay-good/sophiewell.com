// spec-v1561 tool 4: the 20-week prednisolone schedule for a type 1 leprosy reaction or neuritis (WHO 2020).
//
// Source: WHO SEARO. Leprosy/Hansen disease: management of reactions and prevention of disabilities:
// technical guidance, 2020 (IRIS 10665/332022; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026,
// pp. 17-18 and Table 3 (p. 18, read from the rendered page): start between 0.5 and 1.0 mg/kg a day, usually
// 0.5 mg/kg, meaning 30 or 40 mg for most adults, depending on weight; 20 weeks. The 40 mg track: 40 mg weeks
// 1-2, 30 mg weeks 3-4; the 30 mg track: 30 mg weeks 1-2, 25 mg weeks 3-4; both then 20 mg weeks 5-12, 10 mg
// weeks 13-16, 5 mg weeks 17-20. Albendazole 400 mg twice a day for 3 days (adults) for anyone starting
// steroids for neuritis.
//
// Stated rather than hidden: the table does not say at what weight 40 replaces 30; with no track chosen the
// tile takes the one nearer 0.5 mg/kg (40 mg from 70 kg) and says so. Under 30 kg neither track fits the
// 0.5-1.0 mg/kg range, and no schedule is printed. ENL has no tabulated schedule and is not built.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const TRACK_OPTIONS = [
  { value: '40', text: 'Start at 40 mg' },
  { value: '30', text: 'Start at 30 mg' },
];

const STEPS = {
  40: [[1, 2, 40], [3, 4, 30], [5, 12, 20], [13, 16, 10], [17, 20, 5]],
  30: [[1, 2, 30], [3, 4, 25], [5, 12, 20], [13, 16, 10], [17, 20, 5]],
};
const NOTE = 'This follows WHO\'s 2020 technical guidance on leprosy reactions (Table 3). Prednisolone once daily, by mouth.';
const r1 = (x) => Math.round(x * 100) / 100;

export function leprosyReactionPrednisolone(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 5, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  let week = null;
  if (String(o.week ?? '').trim() !== '') {
    const fw = inputFault([['the week of treatment', o.week, 1, 20, 'weeks']]);
    if (fw) return { valid: false, message: fw };
    week = Math.ceil(Number(o.week));
  }
  const notes = [];
  const chosen = TRACK_OPTIONS.find((x) => x.value === o.track);
  let track;
  if (chosen) {
    track = Number(chosen.value);
    const perKg = track / kg;
    if (perKg > 1) notes.push(`${track} mg is ${r1(perKg)} mg/kg at ${kg} kg, above the 0.5-1.0 mg/kg range.`);
    else if (perKg < 0.5) notes.push(`${track} mg is ${r1(perKg)} mg/kg at ${kg} kg, below the usual 0.5 mg/kg.`);
  } else {
    if (kg < 30) {
      return { valid: true, band: `Below the table: at ${kg} kg the 30 mg start is over 1.0 mg/kg. The guidance gives 0.5-1.0 mg/kg a day (${r1(0.5 * kg)}-${r1(kg)} mg) for the start and prints no schedule at this weight.`, bandLabel: 'No schedule at this weight', abnormal: true, notes: ['Taper over about 20 weeks with an experienced clinician.'], note: NOTE };
    }
    track = 0.5 * kg >= 35 ? 40 : 30;
    notes.push(`Starting track: not entered, so the one nearer 0.5 mg/kg (${r1(0.5 * kg)} mg at ${kg} kg) is used: ${track} mg. WHO's table does not give the weight at which 40 replaces 30.`);
  }
  const plan = STEPS[track].map(([a, b, d]) => `Weeks ${a}-${b}: ${d} mg a day.`);
  notes.unshift(...plan);
  notes.push('Adults starting steroids for neuritis: albendazole 400 mg twice a day for 3 days first.');
  notes.push('Watch for unrecognized TB and other infection, diabetes, peptic ulceration, mood change and, in older people, osteoporosis.');
  if (week !== null) {
    const step = STEPS[track].find(([a, b]) => week >= a && week <= b);
    return { valid: true, band: `Week ${week} of 20 on the ${track} mg track: prednisolone ${step[2]} mg a day.`, bandLabel: `${step[2]} mg a day`, abnormal: false, notes, note: NOTE };
  }
  return { valid: true, band: `The ${track} mg track: ${track} mg a day for weeks 1-2, tapering to 5 mg a day in weeks 17-20 (20 weeks).`, bandLabel: `${track} mg start`, abnormal: false, notes, note: NOTE };
}
