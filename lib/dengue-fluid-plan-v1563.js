// spec-v1563 tool 5: the WHO dengue IV fluid ladder in mL per hour, by group, age and weight.
//
// Source: WHO. Handbook for clinical management of dengue, 2012 (IRIS 10665/76887; facts only, nothing
// reproduced). Read October 6, 2026:
//   - p. 26 (warning signs, infants, children and adults): isotonic crystalloid 5-7 mL/kg/h for 1-2 hours, then
//     3-5 for 2-4 hours, then 2-3 or less; if vital signs worsen with a rapidly rising hematocrit, 5-10 for
//     1-2 hours; aim for urine about 0.5 mL/kg/h; IV fluids usually only 24-48 hours; ideal body weight for
//     obese or overweight patients.
//   - p. 28 (compensated shock): adults 5-10 mL/kg/h over 1 hour, then 5-7 for 1-2 hours, 3-5 for 2-4 hours,
//     2-3 up to 24-48 hours; infants and children 10-20 over 1 hour, then 10 for 1-2 hours, 7 for 2 hours,
//     5 for 4 hours, 3 up to 24-48 hours; never beyond 48 hours; if shock persists with a high hematocrit, a
//     second bolus (adults crystalloid or colloid 10-20 mL/kg/h for 1 hour; children colloid 10-20).
//   - pp. 30-31 (hypotensive shock, all ages): 20 mL/kg over 15-30 minutes; then adults 10 mL/kg/h for 1 hour,
//     5-7 for 1-2 hours, 3-5 for 2-4 hours, 2-3 or less up to 24-48 hours; infants and children colloid 10 for
//     1 hour, crystalloid 10 for 1 hour, 7.5 for 2 hours, 5 for 4 hours, 3 up to 24-48 hours.
//
// Stated rather than hidden: the child ladders print 7 mL/kg/h after compensated shock and 7.5 after
// hypotensive shock; each is used as printed in its own section. The ladder is a titration plan that is
// reassessed before every step, not an order.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const GROUP_OPTIONS = [
  { value: 'warning', text: 'Warning signs (no shock)' },
  { value: 'compensated', text: 'Compensated shock' },
  { value: 'hypotensive', text: 'Hypotensive shock' },
];
export const AGE_OPTIONS = [
  { value: 'adult', text: 'Adult' },
  { value: 'child', text: 'Infant or child' },
];

// Steps: [lo, hi (or null), duration text, kind ('rate' mL/kg/h or 'bolus' mL/kg), fluid].
const LADDERS = {
  warning: [[5, 7, 'for 1 to 2 hours', 'rate'], [3, 5, 'for 2 to 4 hours', 'rate'], [2, 3, 'or less, as the response allows', 'rate']],
  'compensated-adult': [[5, 10, 'over 1 hour', 'rate'], [5, 7, 'for 1 to 2 hours', 'rate'], [3, 5, 'for 2 to 4 hours', 'rate'], [2, 3, 'up to 24 to 48 hours', 'rate']],
  'compensated-child': [[10, 20, 'over 1 hour', 'rate'], [10, null, 'for 1 to 2 hours', 'rate'], [7, null, 'for 2 hours', 'rate'], [5, null, 'for 4 hours', 'rate'], [3, null, 'up to 24 to 48 hours', 'rate']],
  'hypotensive-adult': [[20, null, 'over 15 to 30 minutes', 'bolus', 'crystalloid or colloid'], [10, null, 'for 1 hour', 'rate', 'crystalloid or colloid'], [5, 7, 'for 1 to 2 hours', 'rate', 'crystalloid'], [3, 5, 'for 2 to 4 hours', 'rate', 'crystalloid'], [2, 3, 'or less, up to 24 to 48 hours', 'rate', 'crystalloid']],
  'hypotensive-child': [[20, null, 'over 15 to 30 minutes', 'bolus', 'crystalloid or colloid'], [10, null, 'for 1 hour', 'rate', 'colloid'], [10, null, 'for 1 hour', 'rate', 'crystalloid'], [7.5, null, 'for 2 hours', 'rate', 'crystalloid'], [5, null, 'for 4 hours', 'rate', 'crystalloid'], [3, null, 'up to 24 to 48 hours', 'rate', 'crystalloid']],
};

const ml = (x) => Math.round(x).toLocaleString('en-US');

export function dengueFluidPlan(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const group = GROUP_OPTIONS.find((x) => x.value === o.group);
  if (!group) return { valid: false, message: 'Choose the group: warning signs, compensated shock or hypotensive shock.' };
  const age = AGE_OPTIONS.find((x) => x.value === o.ageGroup);
  if (!age) return { valid: false, message: 'Choose adult or infant/child: the shock ladders differ.' };
  const f = inputFault([['the weight', o.weight, 1, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const w = Number(o.weight);
  const key = group.value === 'warning' ? 'warning' : `${group.value}-${age.value}`;
  const steps = LADDERS[key].map(([lo, hi, dur, kind, fluid], i) => {
    const per = hi === null ? `${lo}` : `${lo}-${hi}`;
    const amt = hi === null ? ml(w * lo) : `${ml(w * lo)}-${ml(w * hi)}`;
    const what = kind === 'bolus' ? `${amt} mL (${per} mL/kg) ${dur}` : `${amt} mL/h (${per} mL/kg/h) ${dur}`;
    return `Step ${i + 1}: ${what}${fluid ? `, ${fluid}` : ''}.`;
  });
  const notes = [...steps];
  notes.push('Reassess before every step (vital signs, capillary refill, hematocrit, urine output) and step down only if the patient is improving. Use isotonic crystalloid unless a step says colloid.');
  if (group.value === 'warning') {
    notes.push(`If vital signs worsen and the hematocrit rises rapidly, increase to ${ml(w * 5)}-${ml(w * 10)} mL/h (5-10 mL/kg/h) for 1 to 2 hours and reassess. Aim for urine about ${(Math.round(w * 0.5 * 10) / 10)} mL/h (0.5 mL/kg/h).`);
  } else {
    notes.push(age.value === 'adult'
      ? `If shock persists and the hematocrit is high or rising, a second bolus of ${ml(w * 10)}-${ml(w * 20)} mL (10-20 mL/kg) over 1 hour${group.value === 'hypotensive' ? ' (colloid, over 30 minutes to 1 hour)' : ''}; if it is falling with unstable vital signs, look for bleeding and consider transfusion.`
      : `If shock persists and the hematocrit is high or rising, change to colloid, ${ml(w * 10)}-${ml(w * 20)} mL (10-20 mL/kg); if it is falling with unstable vital signs, look for bleeding and consider transfusion.`);
  }
  notes.push('Use ideal body weight for an obese or overweight patient. IV fluids are usually needed for 24 to 48 hours; do not continue beyond 48 hours.');
  if (key === 'compensated-child' || key === 'hypotensive-child') notes.push('WHO\'s child ladders print 7 mL/kg/h after compensated shock and 7.5 after hypotensive shock; each is used as printed.');
  const first = LADDERS[key][0];
  return {
    valid: true,
    band: `${group.text}, ${age.value === 'adult' ? 'adult' : 'infant or child'}, ${Math.round(w * 10) / 10} kg: start at ${first[1] === null ? ml(w * first[0]) : `${ml(w * first[0])}-${ml(w * first[1])}`} ${first[3] === 'bolus' ? 'mL' : 'mL/h'} ${first[2]}, then step down as below if the patient improves.`,
    bandLabel: group.text,
    abnormal: group.value !== 'warning',
    notes,
    note: 'This follows WHO\'s 2012 dengue clinical management handbook. It is a titration plan to reassess, not an order; your national protocol may differ.',
  };
}
