// spec-v1637 tool 12: the methadone take-home supply ceiling in an opioid treatment program.
//
// Source: 42 CFR 8.12(h)(3)(ii) and (i), read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   (i)(1)  take-home doses "for days that the clinic is closed for business, including one weekend
//     day (e.g., Sunday) and State and Federal holidays, no matter their length of time in
//     treatment."
//   (i)(3)  the restrictions "do not apply to buprenorphine and buprenorphine products".
//   (i)(3)(i)  "During the first 14 days of treatment, the take-home supply (beyond that of
//     paragraph (i)(1) of this section) is limited to 7 days."
//   (i)(3)(ii)  "From 15 days of treatment, ... is limited to 14 days."
//   (i)(3)(iii) "From 31 days of treatment, ... not to exceed 28 days."
//   (h)(3)(ii)  "The total dose for the first day should not exceed 50 milligrams unless the OTP
//     practitioner ... finds sufficient medical rationale ... and documents in the patient's record
//     that a higher dose was clinically indicated."
//
// The rule does not say which day is day 1. The tool counts the day of admission as day 1 and
// says so; the reader may enter the treatment day instead. These are ceilings: whether a patient
// gets any take-home dose is the practitioner's documented decision under (i)(2). The tool never
// recommends a supply.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';

export const MEDICATIONS = [
  { value: 'methadone', text: 'Methadone' },
  { value: 'buprenorphine-product', text: 'Buprenorphine or a buprenorphine product' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const whole = (label, v, lo, hi, unit) => inputFault([[label, v, lo, hi, unit]]) || (Number.isInteger(Number(v)) ? null : `Enter ${label} as a whole number.`);

export function otpTakeHomeLimit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const med = MEDICATIONS.find((m) => m.value === String(o.medication ?? '').trim());
  if (!med) return { valid: false, message: 'Choose the medication: the take-home ceilings apply to methadone and not to buprenorphine products.' };
  let day = null; let admitted = null; let counted = '';
  if (!blank(o.treatmentDay)) {
    const f = whole('the treatment day', o.treatmentDay, 1, 36500, '');
    if (f) return { valid: false, message: f };
    day = Number(o.treatmentDay); counted = 'as entered';
  } else {
    admitted = date(o.admitted); const on = date(o.dispensedOn);
    if (!admitted || !on) return { valid: false, message: 'Enter the admission date and the date the supply would be dispensed, or enter the treatment day.' };
    if (on.getTime() < admitted.getTime()) return { valid: false, message: 'Enter a dispensing date that is not before the admission date.' };
    day = Math.round((on.getTime() - admitted.getTime()) / 86400000) + 1;
    counted = `counting the admission date, ${say(admitted)}, as day 1; the rule does not say which day is day 1`;
  }
  for (const [label, v, lo, hi, unit] of [['the proposed take-home supply', o.proposedDays, 0, 90, 'days'], ['the state ceiling', o.stateCeilingDays, 0, 28, 'days']]) {
    if (!blank(v)) { const f = whole(label, v, lo, hi, unit); if (f) return { valid: false, message: f }; }
  }
  if (!blank(o.firstDayDose)) { const f = inputFault([['the total methadone dose on the first day', o.firstDayDose, 0, 500, 'mg']]); if (f) return { valid: false, message: f }; }
  const proposed = blank(o.proposedDays) ? null : Number(o.proposedDays);
  const stateCeiling = blank(o.stateCeilingDays) ? null : Number(o.stateCeilingDays);
  const notes = [`Treatment day ${day}, ${counted}.`];
  const out = { valid: true, treatmentDay: day };
  const closure = 'Doses for days the clinic is closed, including one weekend day and state and federal holidays, are allowed at any time in treatment and are outside these ceilings (42 CFR 8.12(i)(1)).';
  if (med.value === 'buprenorphine-product') {
    notes.push('The take-home restrictions in 42 CFR 8.12(i)(3)(i) to (iii) do not apply to buprenorphine and buprenorphine products. The rule sets no day ceiling for them.');
    notes.push('Whether to give unsupervised doses is still the practitioner\'s documented decision under the criteria in 8.12(i)(2). A state may set its own ceiling.');
    return { ...out, flag: 'no-federal-ceiling', federalCeilingDays: null, band: 'No federal take-home ceiling applies to buprenorphine products.', bandLabel: 'No federal ceiling', notes, note: notes.join(' ') };
  }
  const [ceiling, para, phrase] = day <= 14 ? [7, '8.12(i)(3)(i)', 'during the first 14 days of treatment'] : day <= 30 ? [14, '8.12(i)(3)(ii)', 'from 15 days of treatment'] : [28, '8.12(i)(3)(iii)', 'from 31 days of treatment'];
  out.federalCeilingDays = ceiling;
  notes.push(`Methadone, ${phrase}: the take-home supply is limited to ${ceiling} days (42 CFR ${para}).`);
  const binding = stateCeiling !== null && stateCeiling < ceiling ? stateCeiling : ceiling;
  out.ceilingDays = binding;
  if (stateCeiling !== null) notes.push(stateCeiling < ceiling ? `The state ceiling entered, ${stateCeiling} days, is lower and governs.` : `The state ceiling entered, ${stateCeiling} days, is not lower than the federal one.`);
  else notes.push('No state ceiling was entered; a state may set a lower one.');
  if (admitted) {
    if (day <= 14) notes.push(`The 14-day ceiling opens on treatment day 15, ${say(addCalendarDaysUtc(admitted, 14))}; the 28-day ceiling on day 31, ${say(addCalendarDaysUtc(admitted, 30))}.`);
    else if (day <= 30) notes.push(`The 28-day ceiling opens on treatment day 31, ${say(addCalendarDaysUtc(admitted, 30))}.`);
    out.nextStepOpens = day <= 14 ? fmtUtc(addCalendarDaysUtc(admitted, 14)) : day <= 30 ? fmtUtc(addCalendarDaysUtc(admitted, 30)) : null;
  } else if (day <= 30) notes.push(day <= 14 ? 'The 14-day ceiling opens on treatment day 15 and the 28-day ceiling on day 31.' : 'The 28-day ceiling opens on treatment day 31.');
  notes.push(closure);
  let over = false;
  if (proposed !== null) {
    over = proposed > binding;
    out.proposedFits = !over;
    notes.push(`A proposed supply of ${proposed} day${proposed === 1 ? '' : 's'} is ${over ? 'over' : 'within'} the ${binding}-day ceiling.`);
  }
  else notes.push('No proposed supply was entered, so nothing was checked against the ceiling.');
  if (!blank(o.firstDayDose)) {
    const dose = Number(o.firstDayDose);
    out.firstDayOver50 = dose > 50;
    notes.push(dose > 50 ? `First-day total ${dose} mg: over 50 mg. The rule says the first-day total should not exceed 50 mg unless the practitioner finds sufficient medical rationale and documents in the record that a higher dose was clinically indicated (8.12(h)(3)(ii)).` : `First-day total ${dose} mg: not over the 50 mg the rule names for the first day (8.12(h)(3)(ii)).`);
  }
  notes.push('These are maximums. Whether a patient receives any take-home dose is the practitioner\'s documented decision under the six criteria in 8.12(i)(2); this reports the ceiling and recommends nothing.');
  return { ...out, flag: over ? 'over-the-ceiling' : 'ceiling', abnormal: over || out.firstDayOver50 === true, band: `Methadone take-home ceiling on treatment day ${day}: ${binding} days.`, bandLabel: proposed === null ? `${binding}-day ceiling` : over ? 'Proposed supply is over the ceiling' : 'Proposed supply is within the ceiling', notes, note: notes.join(' ') };
}
