// spec-v1395: Texas sexual assault forensic examination -- eligibility and the facility's duties.
//
// Sources (official mirror tcss.legis.texas.gov, read 2026-09-18):
//   Code of Criminal Procedure art. 56A.303(a): a health care provider conducts a forensic medical
//   examination of (1) a minor victim "regardless of when the victim arrives", with consent; and
//   (2) an adult victim who arrives within 120 hours after the assault, or later if referred by a
//   law enforcement agency or by a physician, sexual assault examiner, or sexual assault nurse
//   examiner after a preliminary medical evaluation -- with consent. (b) A provider that does not
//   provide these services refers the victim to one that does.
//   Health & Safety Code 323.004: a facility that is not SAFE-ready tells the survivor so, gives the
//   names and locations of nearby SAFE-ready facilities and the information form, and offers the
//   choice of care there or stabilization and transfer; a transfer needs the survivor's written,
//   signed consent and a call confirming a sexual assault forensic examiner is available. (b) lists
//   the care every facility provides. (c) Documented consent is obtained before the examination, and
//   an adult requesting it is presumed competent.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const SAFE_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const REFERRALS = [
  { value: 'none', text: 'No referral' },
  { value: 'law-enforcement', text: 'Referred by a law enforcement agency' },
  { value: 'clinician', text: 'Referred by a physician, SAE, or SANE after a preliminary evaluation' },
];

const SERVICES = [
  'a forensic medical examination by a person with the required training (Government Code ch. 420, subch. B; CCP ch. 56A, subch. G)',
  'a private area, if available, to wait or speak with medical, legal, or crisis-center staff or volunteers',
  'access to a sexual assault program advocate, if available',
  'the information form (Health & Safety Code 323.005)',
  'a private treatment room, if available',
  'prophylaxis for sexually transmitted infections, if indicated by the history of contact',
  'the name and telephone number of the nearest sexual assault crisis center',
  'a shower at no cost after the examination, if the facility has showers',
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function txSaForensicExamWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = Number(String(o.age ?? '').trim());
  if (isBlank(o.age) || !Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years. A minor is examined whenever they arrive; an adult within 120 hours unless referred.' };
  if (isBlank(o.safeReady) || !['yes', 'no'].includes(o.safeReady)) return { valid: false, message: 'Say whether this facility is SAFE-ready. A facility that is not has its own duties to the survivor.' };
  const minor = age < 18;
  let hours = null;
  if (!minor) {
    if (isBlank(o.hours)) return { valid: false, message: 'Enter the hours since the assault. An adult is examined within 120 hours, or later on referral.' };
    hours = Number(String(o.hours).trim());
    if (!Number.isFinite(hours) || hours < 0 || hours > 100000) return { valid: false, message: 'Enter the hours since the assault as a number of hours.' };
  }
  const referral = REFERRALS.some((r) => r.value === o.referral) ? o.referral : 'none';

  let eligible;
  let why;
  if (minor) {
    eligible = true;
    why = 'A minor is examined regardless of when they arrive, with consent from the minor (where the Family Code allows), a person authorized to act for them, or the Department of Family and Protective Services.';
  } else if (hours <= 120) {
    eligible = true;
    why = `Arrived ${hours} hours after the assault, within the 120 hours for an adult.`;
  } else if (referral !== 'none') {
    eligible = true;
    why = `Arrived ${hours} hours after the assault, past 120 hours, but referred ${referral === 'law-enforcement' ? 'by a law enforcement agency' : 'by a physician, sexual assault examiner, or nurse examiner after a preliminary evaluation'}, which extends eligibility.`;
  } else {
    eligible = false;
    why = `Arrived ${hours} hours after the assault, past 120 hours, with no referral. A law enforcement agency, or a physician, sexual assault examiner, or nurse examiner after a preliminary evaluation, can still refer the survivor for the examination.`;
  }

  const duties = o.safeReady === 'no'
    ? 'This facility is not SAFE-ready: tell the survivor so, give the names and locations of nearby SAFE-ready facilities and the information form, and offer the choice of care here or stabilization and transfer. A transfer needs the survivor\'s written, signed consent and a call confirming a forensic examiner is available at the receiving facility.'
    : null;
  return {
    valid: true,
    eligible,
    abnormal: false,
    bandLabel: eligible ? 'Forensic examination: eligible' : 'Not eligible without a referral',
    band: `${eligible ? 'Eligible for a forensic medical examination.' : 'Not eligible for a forensic medical examination as entered.'} ${why}`,
    consentNote: 'Documented consent is obtained before the examination and treatment; an adult requesting it is presumed competent.',
    duties,
    services: SERVICES,
    postureNote: scopeSentence(SAFE_VERIFIED),
  };
}
