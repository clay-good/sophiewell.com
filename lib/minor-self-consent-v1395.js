// spec-v1395: can this minor consent alone? (California, Texas, New York, New Jersey.)
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
//   NY (newyork.public.law copies of nysenate.gov text, updated August 8, 2025; read 2026-09-19):
//     PHL 2504(1) a person who is a parent, has married, or is a homeless youth (or is served by a
//       runaway and homeless youth program) consents to all their own care, including behavioral
//       health; (3) a pregnant person consents to prenatal care; (4) emergency care needs no consent.
//     PHL 2305(2) a physician may diagnose, treat, or prescribe for a person under 21 who has or was
//       exposed to a sexually transmitted disease "without the consent or knowledge of the parents".
//     MHL 33.21(c) outpatient mental health without parental consent only if the practitioner
//       determines the minor is knowingly and voluntarily seeking it, it is clinically indicated and
//       necessary, and a parent is not reasonably available, or involvement would be detrimental,
//       or a parent refused and a physician finds it necessary; the reasons are documented and the
//       minor signs a statement. (d) an initial interview needs no consent.
//     MHL 22.11(c) chemical dependence treatment without parental consent if a physician judges
//       parental involvement detrimental, or a parent refused and the physician finds it necessary,
//       or the parents cannot be located and the program director authorizes it; documented.
//     No New York statute read settles contraception, abortion, or care after sexual assault, so
//       those are left unanswered rather than guessed.
//   NJ (FindLaw, current as of January 1, 2024; read 2026-09-19):
//     N.J.S.A. 9:17A-1 a married or pregnant minor consents to care; an unmarried pregnant minor to
//       care related to the pregnancy or her child. (Its reference to a 1999 parental-notification
//       law, C.9:17A-1.1, is not applied; that law's status was not read.)
//     N.J.S.A. 9:17A-4 a minor who has or believes they have a sexually transmitted infection; who is
//       13 or older and has or believes they have HIV or AIDS; or who, in the treating professional's
//       judgment, appears to have been sexually assaulted (parents notified immediately unless the
//       professional believes that is not in the patient's best interests); substance use disorder
//       treatment, kept confidential; and at 16 or older, temporary outpatient behavioral health
//       care, excluding medication.
//     No New Jersey statute read settles contraception or abortion.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const MSC_VERIFIED = '2026-09-18';
export const MSC_STATES = stateOptions(['NY', 'NJ', 'CA', 'TX']);
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

const OPEN = (what) => ({ may: null, section: null, text: `No ${what} statute read here settles this, so it is not answered. Check your facility's counsel or policy.` });

function ny(o, age) {
  const s = o.service;
  if (s === 'pregnancy') return { may: true, section: 'Public Health Law 2504(3)', text: 'A pregnant person of any age may consent to prenatal care.' };
  if (s === 'sti') return { may: true, section: 'Public Health Law 2305(2)', text: 'A physician may diagnose, treat, or prescribe for a person under 21 who has, or was exposed to, a sexually transmitted disease, without the parents\' consent or knowledge.' };
  if (s === 'mental-health') return { may: 'conditional', section: 'Mental Hygiene Law 33.21(c)', text: 'Outpatient mental health care without a parent\'s consent only if the practitioner determines that the minor is seeking it knowingly and voluntarily, that it is clinically indicated and necessary, and that a parent is not reasonably available, or involvement would be detrimental, or a parent refused and a physician finds it necessary. The reasons are documented and the minor signs a statement. An initial interview to decide this needs no consent (33.21(d)).' };
  if (s === 'sud' || s === 'moud-otp') return { may: 'conditional', section: 'Mental Hygiene Law 22.11(c)', text: `Chemical dependence treatment without a parent's consent only if a physician judges parental involvement would be detrimental, or a parent refused and the physician finds it necessary, or the parents cannot be located and the program director authorizes it. The reasons are documented.${s === 'moud-otp' ? ' Federal rules for opioid treatment programs were not read here.' : ''}` };
  if (s === 'contraception' || s === 'abortion' || s === 'sexual-assault') return OPEN('New York');
  return { may: false, section: null, text: 'None of the New York sections read here lets this minor consent alone to this care; a parent or guardian consents.' };
}

function nj(o, age) {
  const s = o.service;
  if (s === 'pregnancy') return { may: true, section: 'N.J.S.A. 9:17A-1', text: 'A pregnant minor may consent to hospital, medical, and surgical care related to the pregnancy or her child, and a parent\'s consent is not needed.' };
  if (s === 'sti') return { may: true, section: 'N.J.S.A. 9:17A-4', text: `A minor who has or believes they have a sexually transmitted infection may consent to care. For HIV or AIDS the minor must be 13 or older${age < 13 ? ', which this minor is not' : ''}.` };
  if (s === 'sexual-assault') return { may: true, section: 'N.J.S.A. 9:17A-4', text: 'A minor who, in the treating professional\'s judgment, appears to have been sexually assaulted may consent to care and a forensic examination. The parents are notified immediately unless the professional believes that is not in the patient\'s best interests.' };
  if (s === 'sud') return { may: true, section: 'N.J.S.A. 9:17A-4', text: 'A minor may consent to substance use disorder treatment, and it is kept confidential between the clinician and the patient.' };
  if (s === 'moud-otp') return { may: null, section: 'N.J.S.A. 9:17A-4', text: 'Section 9:17A-4 lets a minor consent to substance use disorder treatment. Federal rules for opioid treatment programs were not read here, so this is not answered.' };
  if (s === 'mental-health') {
    if (age >= 16) return { may: true, section: 'N.J.S.A. 9:17A-4', text: 'At 16 or older, a minor may consent to temporary outpatient behavioral health care, not including medication.' };
    return { may: false, section: 'N.J.S.A. 9:17A-4', text: 'Under 16, New Jersey does not let a minor consent alone to outpatient behavioral health care; a parent or guardian consents.' };
  }
  if (s === 'contraception' || s === 'abortion') return OPEN('New Jersey');
  return { may: false, section: null, text: 'None of the New Jersey sections read here lets this minor consent alone to this care; a parent or guardian consents.' };
}

const STATE_NOTE = {
  NY: 'A minor who is a parent, is married, or is a homeless youth (or is served by a runaway and homeless youth program) consents to all their own care, including behavioral health (Public Health Law 2504(1)). In an emergency, care may be given without anyone\'s consent (2504(4)).',
  NJ: 'A married minor consents to their own care and their children\'s (N.J.S.A. 9:17A-1).',
};

export function minorSelfConsent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !MSC_STATES.some((s) => s.value === o.state)) return { valid: false, message: 'Choose the state: New York, New Jersey, California, or Texas.' };
  const age = Number(String(o.age ?? '').trim());
  if (isBlank(o.age) || !Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years.' };
  if (age >= 18) return { valid: false, message: 'At 18 or older the patient is an adult and consents for themselves.' };
  if (isBlank(o.service) || !SERVICES.some((s) => s.value === o.service)) return { valid: false, message: 'Choose the service. Each state lets a minor consent alone only for certain services.' };

  const r = { CA: ca, TX: tx, NY: ny, NJ: nj }[o.state](o, age);
  if (r.unanswered) return { valid: false, message: r.unanswered };
  const parentNote = o.state === 'TX'
    ? 'A physician, dentist, or psychologist may tell the parents of the treatment, with or without the child\'s consent (32.003(d)).'
    : null;
  return {
    valid: true,
    state: o.state,
    mayConsent: r.may,
    section: r.section,
    abnormal: r.may !== true,
    bandLabel: r.may === true ? `May consent alone${r.section ? ` (${r.section})` : ''}`
      : r.may === 'conditional' ? `Only if the grounds are documented (${r.section})`
        : r.may === null ? 'Not settled by the sections read here'
          : 'A parent or guardian consents',
    band: r.text,
    parentNote: r.may ? parentNote : null,
    stateNote: STATE_NOTE[o.state] || null,
    postureNote: scopeSentence(MSC_VERIFIED),
  };
}
