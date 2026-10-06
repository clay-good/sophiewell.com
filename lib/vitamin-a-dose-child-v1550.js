// spec-v1550 tool 2: the vitamin A dose for a child, by reason: routine supplementation, persistent diarrhea
// (IMCI), measles, or eye signs of deficiency.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced; all rights reserved):
//   - WHO. Guideline: vitamin A supplementation in infants and children 6-59 months of age, 2011 (VA11; IRIS
//     10665/44664), Table 1 (p. 4): 6-11 months 100,000 IU once; 12-59 months 200,000 IU every 4-6 months;
//     where night blindness is 1% or more at 24-59 months or low serum retinol 20% or more.
//   - WHO. IMCI chart booklet, 2014 ("Give vitamin A and mebendazole in clinic"): supplementation from 6 months,
//     then every 6 months; an extra dose, the same as supplementation (6 up to 12 months 100,000 IU, 1 year or
//     older 200,000 IU), for measles or persistent diarrhea; none if a dose was given in the past month or
//     the child is on RUTF for severe acute malnutrition.
//   - WHO. Pocket book of hospital care for children, 2nd ed., 2013 (PB13), section 6.4 and Annex 2 (p. 369):
//     measles, under 6 months 50,000 IU, 6-11 months 100,000 IU, 1-5 years 200,000 IU, once a day for 2 days,
//     unless already adequately treated for this illness; a third dose 2-4 weeks later with eye signs; the
//     capsule table (50,000 IU: half a 100,000 or one 50,000 capsule; 100,000 IU: half a 200,000, one 100,000
//     or two 50,000; 200,000 IU: one 200,000, two 100,000 or four 50,000).
//   - WHO. Management of severe malnutrition, 1999 (SAM99; IRIS 10665/41999), Table 10 (p. 18): clinical
//     vitamin A deficiency, day 1, day 2 and at least 2 weeks later: under 6 months 50,000 IU, 6-12 months
//     100,000 IU, over 12 months 200,000 IU.
//
// Stated rather than hidden: each reason uses its own source's age band (VA11 and IMCI break at 12 months,
// SAM99 at "over 12 months", so exactly 12 months is 100,000 IU for eye signs and 200,000 IU otherwise);
// IMCI withholds its extra measles dose after a dose in the past month, while PB13 gives the measles course
// unless the child was already treated for this illness. The tile follows PB13 for measles and says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const REASON_OPTIONS = [
  { value: 'routine', text: 'Routine supplementation' },
  { value: 'diarrhea', text: 'Persistent diarrhea (IMCI treatment dose)' },
  { value: 'measles', text: 'Measles' },
  { value: 'eyes', text: 'Eye signs of deficiency (night blindness, Bitot\'s spots, corneal changes)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const CAPS = {
  50000: 'half a 100,000 IU capsule or one 50,000 IU capsule',
  100000: 'half a 200,000 IU capsule, one 100,000 IU capsule or two 50,000 IU capsules',
  200000: 'one 200,000 IU capsule, two 100,000 IU capsules or four 50,000 IU capsules',
};
const iu = (n) => `${n.toLocaleString('en-US')} IU`;

export function vitaminADoseChild(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const reason = REASON_OPTIONS.find((x) => x.value === o.reason);
  if (!reason) return { valid: false, message: 'Choose the reason: routine, persistent diarrhea, measles, or eye signs.' };
  const f = inputFault([['the age', o.age, 0, 60, 'months']]);
  if (f) return { valid: false, message: `${f} WHO's doses here cover children up to 5 years.` };
  const m = Number(o.age);
  const notes = [];

  if (reason.value === 'routine' || reason.value === 'diarrhea') {
    if (!YES_NO.some((x) => x.value === o.recent)) return { valid: false, message: 'Choose whether the child had a vitamin A dose in the past month: if so, none is given now.' };
    if (!YES_NO.some((x) => x.value === o.rutf)) return { valid: false, message: 'Choose whether the child is on RUTF: therapeutic food already contains vitamin A.' };
    if (m < 6) return { valid: true, band: `No ${reason.value === 'routine' ? 'routine' : 'treatment'} dose under 6 months: WHO starts vitamin A supplementation at 6 months.`, bandLabel: 'Not under 6 months', abnormal: false, notes: [], note: 'This follows WHO\'s 2011 vitamin A guideline and the 2014 IMCI chart. Your national program may differ; follow it.' };
    if (o.recent === 'yes' || o.rutf === 'yes') {
      return { valid: true, band: `Do not give vitamin A now: ${o.recent === 'yes' ? 'a dose was given in the past month' : 'the child is on RUTF, which already contains vitamin A'}.`, bandLabel: 'Hold', abnormal: false, notes: [], note: 'This follows the 2014 IMCI chart. Your national program may differ; follow it.' };
    }
    const dose = m < 12 ? 100000 : 200000;
    if (reason.value === 'routine') {
      notes.push(m < 12 ? 'Once, at 6 to 11 months.' : 'Repeat every 4 to 6 months up to 59 months (the IMCI chart says every 6 months).');
      notes.push('WHO recommends routine supplementation where night blindness affects 1% or more of children 24-59 months, or low serum retinol 20% or more of children 6-59 months: a program decision, not a per-child one.');
    } else {
      notes.push('The IMCI treatment dose is the same as the supplementation dose for the age.');
    }
    notes.push(`As capsules: ${CAPS[dose]}.`);
    return { valid: true, band: `Vitamin A ${iu(dose)} by mouth, once (${m < 12 ? '6 to 11 months' : '12 months or older'}).`, bandLabel: iu(dose), abnormal: false, notes, note: reason.value === 'routine' ? 'This follows WHO\'s 2011 vitamin A guideline. Your national program may differ; follow it.' : 'This follows the 2014 IMCI chart. Your national program may differ; follow it.' };
  }

  if (reason.value === 'measles') {
    const dose = m < 6 ? 50000 : m < 12 ? 100000 : 200000;
    notes.push('Give it unless the child has already had adequate vitamin A for this illness. If there is any eye sign of vitamin A deficiency, give a third dose 2 to 4 weeks after the second.');
    notes.push('The IMCI chart\'s outpatient rule withholds its extra measles dose after a dose in the past month; this follows the hospital pocket book\'s measles course.');
    notes.push(`As capsules each day: ${CAPS[dose]}.`);
    return { valid: true, band: `Measles: vitamin A ${iu(dose)} by mouth once a day for 2 days (${m < 6 ? 'under 6 months' : m < 12 ? '6 to 11 months' : '1 to 5 years'}).`, bandLabel: `${iu(dose)} x 2 days`, abnormal: true, notes, note: 'This follows WHO\'s 2013 Pocket book of hospital care for children. Your national protocol may differ; follow it.' };
  }

  const dose = m < 6 ? 50000 : m <= 12 ? 100000 : 200000;
  notes.push('Give it by mouth, preferably as an oil-based preparation; injected (water-miscible) only at first in severe anorexia, edematous malnutrition or septic shock.');
  notes.push('Examine the eyes gently: they can rupture in vitamin A deficiency.');
  notes.push(`As capsules each time: ${CAPS[dose]}.`);
  return { valid: true, band: `Eye signs of deficiency: vitamin A ${iu(dose)} on day 1, day 2, and again at least 2 weeks later (${m < 6 ? 'under 6 months' : m <= 12 ? '6 to 12 months' : 'over 12 months'}).`, bandLabel: `${iu(dose)} x 3 doses`, abnormal: true, notes, note: 'This follows WHO\'s 1999 Management of severe malnutrition, Table 10. Your national protocol may differ; follow it.' };
}
