// spec-v1556 tool 6: Indian red scorpion (Mesobuthus tamulus) sting: clinical grade on arrival.
//
// Source: Bawaskar HS, Bawaskar PH. Efficacy and safety of scorpion antivenom plus prazosin compared with
// prazosin alone for venomous scorpion (Mesobuthus tamulus) sting: randomised open label clinical trial. BMJ.
// 2011;342:c7136, box "Evaluation of clinical grade" (PMC3016167; CC BY-NC, facts restated). Read October 6,
// 2026: grade 1, severe local pain radiating along the dermatomes, mild local swelling and sweating at the
// site, no systemic involvement; grade 2, autonomic storm (vomiting, generalized sweating, drooling, slow
// heart rate, extra beats, low blood pressure, priapism; or blood pressure over 140/90, heart rate over 120,
// cold extremities, a transient systolic murmur); grade 3, cold extremities, fast heart rate, low or high
// blood pressure with pulmonary edema (breathing over 24 a minute, basal crackles); grade 4, fast heart rate
// and low blood pressure, with or without pulmonary edema, with warm extremities (warm shock).
//
// Stated rather than hidden: the grade only. No prazosin or antivenom dose is printed: the regimen comes from
// one open-label trial, and its stop rule ("until the extremities were cold") reads as a misprint. A sign
// left blank is not assessed, so the grade is "at least".
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const GRADES = [
  ['warmShock', 4, 'warm shock: fast heart rate and low blood pressure with warm extremities'],
  ['pulmonary', 3, 'pulmonary edema with cold extremities and a fast heart rate'],
  ['autonomic', 2, 'autonomic storm'],
  ['local', 1, 'severe local pain, mild local swelling and sweating, no systemic signs'],
];
const NOTE = 'This follows the clinical grades in Bawaskar and Bawaskar, BMJ 2011 (Mesobuthus tamulus). It grades severity only; it gives no drug doses.';
const k = (v) => v === 'yes' || v === 'no';

export function scorpionGradeIndia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!GRADES.some(([key]) => k(o[key]))) return { valid: false, message: 'Choose whether at least one grade\'s signs are present or absent.' };
  const hit = GRADES.find(([key]) => o[key] === 'yes');
  const notes = [];
  if (!hit) {
    const open = GRADES.filter(([key]) => !k(o[key])).map(([, g]) => `grade ${g}`);
    if (open.length) return { valid: true, band: `Not graded: no grade's signs present so far, and ${open.join(', ')} signs not assessed.`, bandLabel: 'Not graded', abnormal: false, notes, note: NOTE };
    return { valid: true, band: 'No grade 1-4 signs: not graded as a Mesobuthus tamulus envenoming.', bandLabel: 'No grade', abnormal: false, notes, note: NOTE };
  }
  const [, g, what] = hit;
  const open = GRADES.filter(([key, gg]) => gg > g && !k(o[key])).map(([, gg]) => `grade ${gg}`);
  if (open.length) notes.push(`Not assessed: ${open.join(', ')} signs. The grade could be higher.`);
  if (g >= 2) notes.push('Grades 2 to 4 are systemic envenoming: manage in hospital with monitoring.');
  notes.push('Severity depends on the time since the sting as well as the grade on arrival.');
  return { valid: true, band: `${open.length ? 'At least grade' : 'Grade'} ${g}: ${what}.`, bandLabel: `${open.length ? 'At least grade' : 'Grade'} ${g}`, abnormal: g >= 2, notes, note: NOTE };
}
