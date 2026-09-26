// spec-v1502 tool 5: does a prescription fit the plan's quantity limit, would another strength fit,
// or does it need a quantity-limit exception?
//
// 42 CFR 423.578(b) (read in the eCFR on 2026-09-25): a Part D formulary exception covers "a dose
// restriction, including the dosage form, that causes a particular Part D drug not to be covered for
// the number of doses prescribed". The limit itself is the plan's, so it is reader input.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const POSTURE = 'This is arithmetic on the plan\'s stated limit, not a coverage decision. The plan\'s formulary controls.';
const r2 = (x) => Math.round(x * 100) / 100;

export function quantityLimitCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['the units taken per dose', o.unitsPerDose, null, 1000, ''],
    ['the doses per day', o.dosesPerDay, null, 48, ''],
    ['the strength of one unit', o.strength, null, 100000, 'mg'],
    ['the plan\'s quantity limit', o.limitQty, null, 100000, 'units'],
    ['the days the limit covers', o.limitDays, null, 366, ''],
  ]);
  if (fault) return { valid: false, message: fault };
  const per = Number(o.unitsPerDose);
  const freq = Number(o.dosesPerDay);
  const strength = Number(o.strength);
  const limit = Number(o.limitQty);
  const days = Number(o.limitDays);
  const need = r2(per * freq * days);
  const doseMg = per * strength;
  const notes = [`Needed: ${per} × ${freq} per day × ${days} days = ${need} units of ${strength} mg (a ${r2(doseMg)} mg dose).`];
  if (need <= limit + 1e-9) {
    return { valid: true, needed: need, excess: 0, band: `Fits the limit: ${need} of the ${limit} units allowed per ${days} days.`, bandLabel: 'Fits the limit', notes, note: POSTURE };
  }
  const excess = r2(need - limit);
  if (String(o.otherStrength ?? '').trim() !== '') {
    const f2 = inputFault([['the other strength', o.otherStrength, null, 100000, 'mg']]);
    if (f2) return { valid: false, message: f2 };
    const other = Number(o.otherStrength);
    const unitsOther = doseMg / other;
    if (Math.abs(unitsOther - Math.round(unitsOther)) < 1e-9 && Math.round(unitsOther) >= 1) {
      const needOther = r2(Math.round(unitsOther) * freq * days);
      notes.push(`At ${other} mg: ${Math.round(unitsOther)} per dose × ${freq} per day × ${days} days = ${needOther} units.`);
      if (needOther <= limit + 1e-9) {
        return { valid: true, needed: need, excess, band: `Exceeds the limit by ${excess} units per ${days} days at ${strength} mg, but fits at ${other} mg: ${needOther} of ${limit} units.`, bandLabel: 'Fits with the other strength', notes, note: POSTURE };
      }
    } else notes.push(`A ${r2(doseMg)} mg dose is not a whole number of ${other} mg units, so that strength does not give the same dose.`);
  } else notes.push('Another strength was not entered; a higher strength may fit the limit with fewer units.');
  notes.push('An exception to a quantity limit is a formulary exception: the prescriber states that the allowed number of doses has been, or would be, ineffective or harmful (42 CFR 423.578(b)).');
  return { valid: true, needed: need, excess, band: `Exceeds the limit by ${excess} units per ${days} days (${need} needed, ${limit} allowed): a quantity-limit exception is needed.`, bandLabel: 'Needs a quantity-limit exception', notes, note: POSTURE };
}
