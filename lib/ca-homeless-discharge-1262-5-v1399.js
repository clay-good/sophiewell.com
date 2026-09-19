// spec-v1399: California homeless patient discharge checklist, Health & Safety Code 1262.5(n) and (o)
// (SB 1152, 2018).
//
// Source: leginfo text read 2026-09-18.
//   (n)(4) Unless the patient is transferred to another licensed facility, identify a postdischarge
//     destination, sheltered with supportive services first: an agency or provider that agreed to
//     accept the patient (with the name of who agreed), the patient's residence (the place they name
//     as their principal dwelling), or an alternative destination the patient indicates.
//   (o) Before discharging a homeless patient the hospital documents: (1) the treating physician's
//     determination of clinical stability, including alert and oriented to person, place, and time,
//     and postdischarge medical needs communicated; (2) a meal offered, unless medically indicated
//     otherwise; (3) weather-appropriate clothing offered if the patient's is inadequate; (4) referral
//     to follow-up care, if medically necessary; (5) a prescription if needed, and medication from an
//     onsite outpatient pharmacy if there is one; (6) screening for infectious disease common to the
//     region offered or referred; (7) vaccinations appropriate to the presenting condition offered;
//     (8) a medical screening examination and evaluation, with behavioral health treatment or referral
//     if indicated and a good faith effort to contact the health plan, primary care provider, or
//     another provider such as coordinated entry; (9) screening for, and help enrolling in, coverage
//     the patient is eligible for; (10) transportation offered to the (n)(4) destination if it is
//     within 30 minutes or 30 miles.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const HD_VERIFIED = '2026-09-18';
export const STATUS = [
  { value: 'done', text: 'Documented' },
  { value: 'na', text: 'Not needed (reason documented)' },
  { value: 'not-done', text: 'Not done' },
];
export const ITEMS = [
  ['destination', '(n)(4)', 'a postdischarge destination identified (or a transfer to a licensed facility)', false],
  ['stability', '(o)(1)', "the physician's clinical-stability determination, and postdischarge needs explained", false],
  ['meal', '(o)(2)', 'a meal offered', true],
  ['clothing', '(o)(3)', 'weather-appropriate clothing offered', true],
  ['followUp', '(o)(4)', 'referral to follow-up care', true],
  ['medication', '(o)(5)', 'a prescription, and medication from an onsite outpatient pharmacy', true],
  ['infection', '(o)(6)', 'infectious disease screening offered or referred', false],
  ['vaccines', '(o)(7)', 'vaccinations offered', true],
  ['screening', '(o)(8)', 'medical screening exam, and behavioral health follow-up if indicated', false],
  ['coverage', '(o)(9)', 'coverage screening and enrollment help', false],
  ['transport', '(o)(10)', 'transportation offered to a destination within 30 minutes or 30 miles', true],
];

export function caHomelessDischarge12625(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rows = ITEMS.map(([k, ref, label, conditional]) => {
    let st = STATUS.some((s) => s.value === o[k]) ? o[k] : null;
    if (st === 'na' && !conditional) st = 'bad-na';
    return { ref, label, st };
  });
  const open = rows.filter((r) => r.st === null);
  const notDone = rows.filter((r) => r.st === 'not-done');
  const badNa = rows.filter((r) => r.st === 'bad-na');
  const lines = rows.map((r) => `${r.ref} ${r.label}: ${r.st === 'done' ? 'documented' : r.st === 'na' ? 'not needed, reason documented' : r.st === 'not-done' ? 'not done' : r.st === 'bad-na' ? 'marked not needed, but this item has no exception' : 'not documented'}`);
  const missing = [...notDone, ...badNa, ...open].map((r) => `${r.ref} ${r.label}`);
  const complete = missing.length === 0;
  return {
    valid: true,
    complete,
    abnormal: !complete,
    bandLabel: complete ? 'Complete' : `Incomplete: ${missing.length} of ${ITEMS.length} items not documented`,
    band: complete
      ? 'Every item 1262.5(n)(4) and (o) require before discharging a homeless patient is documented.'
      : `Not yet: document ${missing.join('; ')}.`,
    lines,
    noteText: `Homeless discharge (HSC 1262.5): ${lines.join('. ')}.`,
    policyNote: 'Ask every patient about housing status; it may not be used to deny care or admission (1262.5(n)(2)). A transfer to another licensed facility needs no (n)(4) destination.',
    postureNote: scopeSentence(HD_VERIFIED),
  };
}
