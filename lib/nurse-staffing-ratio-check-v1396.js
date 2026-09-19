// spec-v1396: hospital nurse-to-patient ratio check -- California acute care (22 CCR 70217(a)) and
// New York intensive care (10 NYCRR 405.22).
//
// Sources, read 2026-09-18:
//   22 CCR 70217(a) (Cornell LII copy; last amended Register 2013, No. 11). Ratios are the most
//     patients one licensed nurse may be assigned at any time, with "no averaging ... during any one
//     shift nor over any period of time". Only nurses giving direct care count; a charge nurse or
//     manager counts only while giving direct care. LVNs may be up to 50% of licensed nurses on a unit.
//     (1) critical care (ICU, burn, CCU, acute respiratory) 1:2; intensive care newborn nursery
//     1 RN:2, RNs only. (2) operating room: an RN circulator for each occupied room. (3) active labor
//     1:2; antepartum not in active labor 1:4. (4) postpartum 1:4 couplets, never more than 8 mothers
//     plus infants; mothers only 1:6. (5) combined L/D/postpartum 1:3 for one laboring woman plus a
//     postpartum couplet. (6) pediatrics 1:4. (7) PACU 1:2. (8) emergency department 1:4 while patients
//     are treated, at least two licensed nurses present, the triage RN and a base-radio RN not
//     counted; ED critical care patients 1:2; critical trauma 1:1, RNs only. (9) step-down 1:3 (since
//     January 1, 2008). (10) telemetry 1:4 (since 2008). (11) medical/surgical 1:5 (since January 1,
//     2005). (12) specialty care 1:4 (since 2008). (13) psychiatric 1:6, LVNs and psychiatric
//     technicians no more than half.
//   10 NYCRR 405.22(5): at least one RN for every two patients the attending practitioner determines
//     need intensive or critical care -- by acuity, not location; not for a patient the attending says
//     no longer needs it or who is boarding. New York sets no other unit ratio here.
//
// New Jersey and Texas are not offered. California's acute psychiatric hospital emergency rule
// (22 CCR 71215.1) was not read.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const NSR_VERIFIED = '2026-09-18';
export const NSR_STATES = stateOptions(['CA', 'NY']);
export const CA_UNITS = [
  { value: 'critical', text: 'Critical care: ICU, burn, CCU, acute respiratory', ratio: 2, ref: '(a)(1)' },
  { value: 'nicu', text: 'Intensive care newborn nursery (RNs only)', ratio: 2, ref: '(a)(1)', rnOnly: true },
  { value: 'or', text: 'Operating room (patient-occupied rooms)', ratio: 1, ref: '(a)(2)', rnOnly: true },
  { value: 'labor', text: 'Labor and delivery, active labor', ratio: 2, ref: '(a)(3)' },
  { value: 'antepartum', text: 'Antepartum, not in active labor', ratio: 4, ref: '(a)(3)' },
  { value: 'couplets', text: 'Postpartum mother-baby couplets', ratio: 4, ref: '(a)(4)' },
  { value: 'mothers', text: 'Postpartum, mothers only', ratio: 6, ref: '(a)(4)' },
  { value: 'ldp', text: 'Combined L/D/P: one laboring woman plus a postpartum couplet', ratio: 3, ref: '(a)(5)' },
  { value: 'peds', text: 'Pediatrics', ratio: 4, ref: '(a)(6)' },
  { value: 'pacu', text: 'Postanesthesia recovery (PACU)', ratio: 2, ref: '(a)(7)' },
  { value: 'ed', text: 'Emergency department', ratio: 4, ref: '(a)(8)' },
  { value: 'ed-critical', text: 'Emergency department, critical care patients', ratio: 2, ref: '(a)(8)' },
  { value: 'ed-trauma', text: 'Emergency department, critical trauma (RNs only)', ratio: 1, ref: '(a)(8)', rnOnly: true },
  { value: 'stepdown', text: 'Step-down', ratio: 3, ref: '(a)(9)' },
  { value: 'telemetry', text: 'Telemetry', ratio: 4, ref: '(a)(10)' },
  { value: 'medsurg', text: 'Medical/surgical', ratio: 5, ref: '(a)(11)' },
  { value: 'specialty', text: 'Specialty care', ratio: 4, ref: '(a)(12)' },
  { value: 'psych', text: 'Psychiatric unit of a general acute hospital', ratio: 6, ref: '(a)(13)' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function count(v, label) {
  if (isBlank(v)) return { err: `Enter the number of ${label}.` };
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 500) return { err: `Enter the number of ${label} as a whole number.` };
  return { n };
}

export function nurseStaffingRatioCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !NSR_STATES.some((s) => s.value === o.state)) return { valid: false, message: 'Choose California or New York. New Jersey and Texas are not offered.' };
  const unit = o.state === 'NY'
    ? { value: 'icu', text: 'Patients the attending says need intensive or critical care', ratio: 2, ref: '405.22(5)', rnOnly: true }
    : CA_UNITS.find((u) => u.value === o.unit);
  if (!unit) return { valid: false, message: 'Choose the unit type. Each unit is checked separately; ratios may not be averaged across units or shifts.' };
  const p = count(o.patients, unit.value === 'or' ? 'patient-occupied operating rooms' : 'patients');
  if (p.err) return { valid: false, message: p.err };
  const nr = count(o.nurses, 'licensed nurses on the unit');
  if (nr.err) return { valid: false, message: nr.err };
  if (isBlank(o.notCounted)) return { valid: false, message: 'Enter how many of those nurses are not in the ratio (a triage RN, a base-radio RN, a charge nurse without patients), or 0. A blank would count them.' };
  const x = count(o.notCounted, 'nurses not in the ratio');
  if (x.err) return { valid: false, message: x.err };
  const excluded = x.n;
  if (excluded > nr.n) return { valid: false, message: 'The nurses not in the ratio cannot outnumber the nurses entered.' };

  const counted = nr.n - excluded;
  const required = Math.ceil(p.n / unit.ratio);
  const short = Math.max(0, required - counted);
  const notes = [];
  if (o.state === 'CA' && unit.value === 'ed' && nr.n < 2 && p.n > 0) notes.push('At least two licensed nurses must be physically present whenever a patient is in the department (70217(a)(8)).');
  if (o.state === 'CA' && unit.value.startsWith('ed')) notes.push('The triage RN and a base-radio RN are not counted in the ratio; enter them under "not in the ratio".');
  if (o.state === 'CA' && unit.value === 'couplets') notes.push('With multiple births, mothers plus infants assigned to one nurse may never exceed eight (70217(a)(4)).');
  if (unit.rnOnly) notes.push(unit.value === 'or' ? 'Each occupied room needs a registered nurse as circulator, plus a scrub assistant.' : 'Only registered nurses may be assigned to these patients.');
  if (o.state === 'NY') notes.push('New York applies this by acuity, not location: it does not cover a patient the attending says no longer needs intensive care, or one boarding in the ICU without needing it. New York sets no other unit ratio in this section.');

  const refText = o.state === 'NY' ? '10 NYCRR 405.22(5)' : `22 CCR 70217${unit.ref}`;
  return {
    valid: true,
    required,
    counted,
    short,
    abnormal: short > 0,
    bandLabel: short > 0 ? `${short} short` : 'Meets the ratio',
    band: `${unit.text}: 1 nurse per ${unit.ratio} (${refText}). ${p.n} ${unit.value === 'or' ? 'occupied rooms' : 'patients'} need at least ${required}; ${counted} counted${excluded ? ` (${excluded} of ${nr.n} not in the ratio)` : ''}. ${short > 0 ? `The unit is ${short} short.` : 'The unit meets the ratio.'}`,
    notes,
    averagingNote: o.state === 'CA' ? 'Check each unit and each moment separately: 70217 forbids averaging across a shift or over time, and counts a charge nurse only while giving direct care.' : null,
    postureNote: scopeSentence(NSR_VERIFIED),
  };
}
