// spec-v1638 tool 4: the Part D 14-day dispensing rule in long-term care.
//
// Source: 42 CFR 423.154(a)-(c), read on eCFR as current October 8, 2026 (re-read October 12,
// 2026).
//   (a)(1)(i)  pharmacies serving long-term care facilities "Dispense solid oral doses of
//     brand-name drugs ... to enrollees in such facilities in no greater than 14-day increments at
//     a time".
//   (a)(2)  the sponsor may "Not penalize long-term care facilities' choice of more efficient
//     uniform dispensing techniques ... by prorating dispensing fees based on days' supply or
//     quantity dispensed."
//   (b)  excluded: "(1) Solid oral doses of antibiotics; or (2) Solid oral doses that are
//     dispensed in their original container as indicated in the Food and Drug Administration
//     Prescribing Information or are customarily dispensed in their original packaging to assist
//     patients with compliance (for example, oral contraceptives)."
//   (c)  waived, "except paragraphs (a)(2) and (3)", for pharmacies serving intermediate care
//     facilities for individuals with intellectual disabilities and institutes for mental disease,
//     and for I/T/U pharmacies.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const DRUGS = [opt('brandname-product', 'Brand-name drug'), opt('nonbrand-product', 'Generic drug')];
export const YES_NO = [opt('yes', 'Yes'), opt('no', 'No')];
export const FACILITIES = [
  opt('nursing-facility', 'Nursing facility or skilled nursing facility'),
  opt('icf-iid', 'Intermediate care facility for individuals with intellectual disabilities'),
  opt('imd-facility', 'Institute for mental disease'),
  opt('itu-pharmacy', 'Indian Health Service, tribal or urban Indian (I/T/U) pharmacy'),
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const yn = (v) => (String(v ?? '').trim() === 'yes' ? true : String(v ?? '').trim() === 'no' ? false : null);

export function ltcShortCycleCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose brand or generic: the 14-day rule is for brand-name drugs.' };
  const facility = FACILITIES.find((d) => d.value === String(o.facility ?? '').trim());
  if (!facility) return { valid: false, message: 'Choose the facility or pharmacy type: the rule is waived for three of them.' };
  const a = {};
  for (const [k, ask] of [['solidOral', 'is it a solid oral dose (a tablet or capsule)'], ['antibiotic', 'is it an antibiotic'], ['originalContainer', 'is it dispensed in its original container under the FDA labeling, or customarily in original packaging for adherence']]) {
    a[k] = yn(o[k]);
    if (a[k] === null) return { valid: false, message: `Choose yes or no: ${ask}?` };
  }
  const notes = []; const out = { valid: true };
  let reason = null;
  if (drug.value !== 'brandname-product') reason = 'the rule covers brand-name drugs, and this is a generic';
  else if (!a.solidOral) reason = 'the rule covers solid oral doses only';
  else if (a.antibiotic) reason = 'solid oral antibiotics are excluded (42 CFR 423.154(b)(1))';
  else if (a.originalContainer) reason = 'solid oral doses dispensed in their original container or packaging are excluded (423.154(b)(2))';
  else if (facility.value !== 'nursing-facility') reason = `the requirement is waived for a pharmacy serving this kind of facility (423.154(c))`;
  const inScope = reason === null;
  out.inScope = inScope;
  if (!inScope) notes.push(`Outside the 14-day rule: ${reason}.`);
  else notes.push('In the rule: a brand-name solid oral drug for a Part D enrollee in a long-term care facility is dispensed in increments of no more than 14 days at a time (42 CFR 423.154(a)(1)(i)).');
  let over = false;
  if (!blank(o.daysToDispense)) {
    const f = inputFault([['the days supply to dispense', o.daysToDispense, 1, 366, 'days']]);
    if (f) return { valid: false, message: f };
    const d = Number(o.daysToDispense);
    out.daysToDispense = d;
    if (inScope) { over = d > 14; out.complies = !over; notes.push(`A ${d}-day supply ${over ? 'is more than 14 days and does not comply' : 'is within the 14-day increment'}.`); }
  } else if (inScope) notes.push('No days supply was entered, so no dispensing was checked.');
  if (!blank(o.totalDays)) {
    const f = inputFault([['the total days ordered', o.totalDays, 1, 3660, 'days']]);
    if (f) return { valid: false, message: f };
    if (inScope) { out.dispensingEvents = Math.ceil(Number(o.totalDays) / 14); notes.push(`${Number(o.totalDays)} days in 14-day increments is at least ${out.dispensingEvents} dispensing event${out.dispensingEvents === 1 ? '' : 's'}.`); }
  }
  notes.push('Whatever the technique, the sponsor may not penalize a more efficient uniform dispensing technique by prorating dispensing fees by days supply or quantity (423.154(a)(2)). That fee rule stays in force for the three waived facility and pharmacy types too (423.154(c)).');
  notes.push('The facility chooses its uniform dispensing technique; a shorter increment than 14 days is allowed. This is the Part D rule and applies to Part D enrollees.');
  return { ...out, flag: !inScope ? 'outside-the-rule' : over ? 'over-14-days' : 'in-the-rule', abnormal: over, band: inScope ? (over ? 'In the 14-day rule: this supply is over 14 days.' : 'In the 14-day rule: no more than 14 days at a time.') : 'Outside the 14-day rule.', bandLabel: !inScope ? 'Outside the rule' : over ? 'Over 14 days' : out.complies ? 'Complies' : '14-day increments', notes, note: notes.join(' ') };
}
