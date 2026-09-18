// spec-v1395: can this minor consent alone? (California and Texas.)
//
// Sources (read 2026-09-18):
//   CA Family Code (leginfo)
//     6922  15 or older, living apart from parents (any duration), and managing own finances:
//           medical, vision, or dental care; the clinician may tell the parents.
//     6924  12 or older: outpatient mental health treatment or counseling, or residential shelter
//           services, if mature enough in the attending professional's opinion; parents are involved
//           unless inappropriate, and the record says whether and when contact was attempted.
//     6925  Any age: care related to preventing or treating pregnancy (not sterilization)
//           (AB 260, effective September 26, 2025).
//     6926  12 or older: diagnosis or treatment of a reportable infectious disease or related STI,
//           and STI prevention.
//     6927  12 or older, alleged rape: diagnosis, treatment, and evidence collection.
//     6929  12 or older: care and counseling for a drug- or alcohol-related problem; NOT replacement
//           narcotic therapy in a licensed program, except that 16 or older may consent to
//           medications for opioid use disorder there where federal law expressly permits.
//   TX Family Code 32.003 (official mirror tcss.legis.texas.gov): a child may consent when on active
//     duty; 16 or older, living apart, and managing own finances; for diagnosis and treatment of a
//     reportable infectious disease; unmarried and pregnant, for pregnancy care OTHER THAN
//     ABORTION; for drug or chemical dependency; as an unmarried parent with custody, for their own
//     child; or when serving a term in a Department of Criminal Justice facility. The provider may
//     tell the parents, with or without the child's consent.
//
// New York and New Jersey are not offered: their minor-consent law was not read.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const MSC_VERIFIED = '2026-09-18';
export const MSC_STATES = stateOptions(['CA', 'TX']);
export const SERVICES = [
  { value: 'general', text: 'General medical care' },
  { value: 'mental-health', text: 'Outpatient mental health treatment or counseling' },
  { value: 'sud', text: 'Substance use disorder treatment' },
  { value: 'moud-otp', text: 'Opioid use disorder medication in a licensed narcotic treatment program' },
  { value: 'sti', text: 'Sexually transmitted or reportable infectious disease' },
  { value: 'pregnancy', text: 'Care for a current pregnancy' },
  { value: 'contraception', text: 'Contraception (preventing pregnancy)' },
  { value: 'abortion', text: 'Abortion' },
  { value: 'sexual-assault', text: 'Examination and care after sexual assault' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const yes = (v) => v === 'yes';

function ca(o, age) {
  const s = o.service;
  const emancipatedLike = age >= 15 && yes(o.livingApart) && yes(o.ownFinances);
  if (s === 'pregnancy') return { may: true, section: 'Family Code 6925', text: 'At any age, a minor may consent to care related to preventing or treating pregnancy (not sterilization).' };
  if (s === 'contraception') return { may: true, section: 'Family Code 6925', text: 'At any age, a minor may consent to care related to preventing pregnancy (not sterilization).' };
  if (s === 'abortion') return { may: true, section: 'Family Code 6925', text: 'Section 6925 covers care related to the prevention or treatment of pregnancy at any age and, as amended by AB 260 (2025), excludes only sterilization.' };
  if (s === 'sti' && age >= 12) return { may: true, section: 'Family Code 6926', text: 'At 12 or older, a minor may consent to diagnosis and treatment of a reportable infectious disease or related STI, and to STI prevention.' };
  if (s === 'sexual-assault' && age >= 12) return { may: true, section: 'Family Code 6927', text: 'At 12 or older, a minor alleged to have been raped may consent to diagnosis, treatment, and the collection of evidence.' };
  if (s === 'mental-health' && age >= 12) {
    if (o.mature === 'no') return { may: false, section: 'Family Code 6924', text: 'At 12 or older a minor may consent to outpatient mental health care only if mature enough to participate intelligently, in the professional\'s opinion; that is recorded as not met.' };
    if (o.mature !== 'yes') return { unanswered: 'Answer whether, in the treating professional\'s opinion, the minor is mature enough to participate intelligently. Family Code 6924 turns on it.' };
    return { may: true, section: 'Family Code 6924', text: 'At 12 or older and mature enough in the professional\'s opinion, a minor may consent to outpatient mental health treatment or counseling. Parents are involved unless that would be inappropriate, and the record says whether and when contact was attempted.' };
  }
  if (s === 'sud' && age >= 12) return { may: true, section: 'Family Code 6929', text: 'At 12 or older, a minor may consent to care and counseling for a drug- or alcohol-related problem. Parents are involved if appropriate, and the record says whether and when contact was attempted.' };
  if (s === 'moud-otp') {
    if (age >= 16) return { may: true, section: 'Family Code 6929(e)(2)', text: 'At 16 or older, a minor may consent to medications for opioid use disorder in a licensed narcotic treatment program, only if and to the extent federal law expressly permits.' };
    return { may: false, section: 'Family Code 6929(e)(1)', text: 'Replacement narcotic therapy in a licensed program needs a parent\'s or guardian\'s consent under 16.' };
  }
  if (emancipatedLike) return { may: true, section: 'Family Code 6922', text: 'At 15 or older, living apart from the parents and managing their own finances, a minor may consent to medical, vision, or dental care; the clinician may still tell the parents.' };
  return { may: false, section: null, text: 'None of the California self-consent sections read here covers this minor and service; a parent or guardian consents.' };
}

function tx(o, age) {
  const s = o.service;
  if (yes(o.activeDuty)) return { may: true, section: 'Family Code 32.003(a)(1)', text: 'A child on active duty with the armed services may consent to medical, dental, psychological, and surgical treatment.' };
  if (age >= 16 && yes(o.livingApart) && yes(o.ownFinances)) return { may: true, section: 'Family Code 32.003(a)(2)', text: 'At 16 or older, living apart from the parents and managing their own finances, a child may consent to treatment.' };
  if (s === 'sti') return { may: true, section: 'Family Code 32.003(a)(3)', text: 'A child may consent to diagnosis and treatment of an infectious disease that must be reported to the health authority.' };
  if (s === 'pregnancy' && o.married !== 'yes') return { may: true, section: 'Family Code 32.003(a)(4)', text: 'An unmarried, pregnant child may consent to hospital, medical, or surgical care related to the pregnancy, other than abortion.' };
  if (s === 'abortion') return { may: false, section: 'Family Code 32.003(a)(4)', text: 'Texas excludes abortion from the pregnant minor\'s consent.' };
  if (s === 'contraception') return { may: false, section: null, text: 'Family Code 32.003 lets a pregnant child consent to pregnancy care; it has no ground for contraception, so a parent, managing conservator, or guardian consents under the sections read here. Federally funded family-planning programs have their own rules, not covered here.' };
  if (s === 'sud' || s === 'moud-otp') return { may: true, section: 'Family Code 32.003(a)(5)', text: 'A child may consent to examination and treatment for drug or chemical addiction or dependency, or any condition directly related to drug or chemical use.' };
  if (s === 'sexual-assault') return { may: false, section: 'Code of Criminal Procedure 56A.303', text: 'For a forensic examination of a minor, consent may come from the minor where Family Code 32.003 or 32.005 allows, a person authorized to act for the minor, or the Department of Family and Protective Services. Section 32.005 is not read here, so the tile does not decide it.' };
  if (yes(o.confined)) return { may: true, section: 'Family Code 32.003(a)(7)', text: 'A child serving a term of confinement in a Department of Criminal Justice facility may consent to treatment.' };
  return { may: false, section: null, text: 'None of the Family Code 32.003 grounds read here covers this child and service; a parent, managing conservator, or guardian consents.' };
}

export function minorSelfConsent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !MSC_STATES.some((s) => s.value === o.state)) return { valid: false, message: 'Choose California or Texas. New York and New Jersey are not offered until their law is read.' };
  const age = Number(String(o.age ?? '').trim());
  if (isBlank(o.age) || !Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years.' };
  if (age >= 18) return { valid: false, message: 'At 18 or older the patient is an adult and consents for themselves.' };
  if (isBlank(o.service) || !SERVICES.some((s) => s.value === o.service)) return { valid: false, message: 'Choose the service. Each state lets a minor consent alone only for certain services.' };

  const r = o.state === 'CA' ? ca(o, age) : tx(o, age);
  if (r.unanswered) return { valid: false, message: r.unanswered };
  const parentNote = o.state === 'TX'
    ? 'A physician, dentist, or psychologist may tell the parents of the treatment, with or without the child\'s consent (32.003(d)).'
    : null;
  return {
    valid: true,
    state: o.state,
    mayConsent: r.may,
    section: r.section,
    abnormal: !r.may,
    bandLabel: r.may ? `May consent alone${r.section ? ` (${r.section})` : ''}` : 'A parent or guardian consents',
    band: r.text,
    parentNote: r.may ? parentNote : null,
    postureNote: scopeSentence(MSC_VERIFIED),
  };
}
