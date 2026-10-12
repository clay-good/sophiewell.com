// spec-v1638 tool 17: chronic care management codes from the month's minutes.
//
// Source: CMS, MLN909188, "Chronic Care Management Services", June 2025, re-read October 12, 2026.
//   Table 2: 99490 clinical staff, first 20 minutes; +99439 each additional 20 minutes; 99491
//     physician or other qualified health care professional, first 30 minutes; +99437 each
//     additional 30 minutes; 99487 complex, clinical staff, first 60 minutes; +99489 each
//     additional 30 minutes.
//   "CPT codes 99487, 99489, 99490, and 99439 include time spent directly by the billing
//     practitioners or clinical staff. Time spent by the billing practitioner may also count
//     toward the time threshold if not used to report 99491. CPT codes 99491 and 99437 include
//     only time that's spent personally by the billing practitioner. Clinical staff time doesn't
//     count toward the required reporting time threshold code."
//   "You can't report non-complex CCM and complex CCM for the same patient in a calendar month
//     (don't report 99491 and 99437 in the same calendar month as 99487, 99489, 99490, or 99439)."
//   The clinical staff codes are assigned "general supervision".
// Code numbers and CMS's time thresholds only; no CPT descriptors. The booklet states no cap on
// add-on units; a payer or the CPT code set may, and the result says so. A pharmacist does not
// bill these codes: the billing practitioner does.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const KINDS = [
  opt('non-complex-clinical-staff', 'Non-complex, clinical staff time (99490, 99439)'),
  opt('non-complex-practitioner', 'Non-complex, the billing practitioner\'s own time (99491, 99437)'),
  opt('complex-ccm', 'Complex (99487, 99489)'),
];
const RULES = {
  'non-complex-clinical-staff': { base: '99490', first: 20, addOn: '99439', each: 20 },
  'non-complex-practitioner': { base: '99491', first: 30, addOn: '99437', each: 30 },
  'complex-ccm': { base: '99487', first: 60, addOn: '99489', each: 30 },
};
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function ccmTimeUnits(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = KINDS.find((k) => k.value === String(o.kind ?? '').trim());
  if (!kind) return { valid: false, message: 'Choose which codes are being reported: the staff codes, the practitioner\'s own codes, or complex care management. They are not combined in one calendar month.' };
  const rule = RULES[kind.value];
  const practitionerOnly = kind.value === 'non-complex-practitioner';
  const f = inputFault([[practitionerOnly ? 'the minutes the billing practitioner personally spent this calendar month' : 'the clinical staff minutes this calendar month (0 if none)', practitionerOnly ? o.practitionerMinutes : o.staffMinutes, 0, 6000, 'minutes']]);
  if (f) return { valid: false, message: f };
  let minutes; const notes = [];
  if (practitionerOnly) {
    minutes = Number(o.practitionerMinutes);
    notes.push(`${minutes} minutes spent personally by the billing practitioner. Clinical staff time does not count toward 99491 or 99437.`);
    if (!blank(o.staffMinutes) && Number(o.staffMinutes) > 0) notes.push(`The ${Number(o.staffMinutes)} clinical staff minutes entered are not counted here.`);
  } else {
    const staff = Number(o.staffMinutes);
    let own = 0;
    if (!blank(o.practitionerMinutes)) {
      const g = inputFault([['the billing practitioner\'s minutes', o.practitionerMinutes, 0, 6000, 'minutes']]);
      if (g) return { valid: false, message: g };
      own = Number(o.practitionerMinutes);
    }
    minutes = staff + own;
    notes.push(own > 0 ? `${staff} clinical staff minutes plus ${own} minutes by the billing practitioner, which may count toward the staff codes when it is not used to report 99491: ${minutes} minutes.` : `${staff} clinical staff minutes. The billing practitioner's own time may be added when it is not used to report 99491; none was entered.`);
  }
  const out = { valid: true, minutes };
  if (minutes < rule.first) {
    out.code = null; out.addOnUnits = 0; out.minutesShort = rule.first - minutes;
    notes.push(`Under the ${rule.first}-minute threshold for ${rule.base}: nothing is reportable under these codes this month. ${out.minutesShort} more minute${out.minutesShort === 1 ? '' : 's'} would reach it.`);
  } else {
    const units = Math.floor((minutes - rule.first) / rule.each);
    const used = rule.first + units * rule.each;
    out.code = rule.base; out.addOn = rule.addOn; out.addOnUnits = units; out.minutesUsed = used; out.minutesToNextUnit = rule.each - (minutes - used);
    notes.push(`${rule.base} for the first ${rule.first} minutes${units ? `, and ${rule.addOn} x ${units} for each additional ${rule.each} minutes` : ''}. ${used} of the ${minutes} minutes are used; ${out.minutesToNextUnit} more would reach the next ${rule.each}-minute unit of ${rule.addOn}.`);
    notes.push('CMS\'s booklet states no cap on the add-on units; the CPT code set or a payer may limit them.');
  }
  notes.push('Non-complex and complex care management are not reported for the same patient in one calendar month, and 99491 and 99437 are not reported in the same month as 99487, 99489, 99490 or 99439. Time counted toward another billed code is not counted here.');
  notes.push('The clinical staff codes are assigned general supervision, which is how a pharmacist working as clinical staff furnishes them incident to the billing practitioner. The pharmacist does not bill these codes; the billing practitioner does. Time is only one requirement: consent, the care plan and the other service elements are not checked here.');
  return { ...out, flag: out.code ? 'reportable' : 'under-the-threshold', abnormal: false, band: out.code ? `${out.code}${out.addOnUnits ? ` + ${out.addOn} x ${out.addOnUnits}` : ''} from ${minutes} minutes.` : `Nothing reportable: ${minutes} minutes is under ${rule.first}.`, bandLabel: out.code ? `${out.minutesToNextUnit} minutes short of the next unit` : `${out.minutesShort} minutes short`, notes, note: notes.join(' ') };
}
