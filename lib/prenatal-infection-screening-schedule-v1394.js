// spec-v1394: prenatal syphilis, HIV, and hepatitis B testing required by state (NY, NJ, CA, TX).
//
// Sources, read 2026-09-18:
//   TX Health & Safety Code 81.090 (official mirror): (a) syphilis, HIV, and hepatitis B at the first
//     examination; (a-1) syphilis and HIV in the third trimester, "not earlier than the 28th week";
//     (c) hepatitis B and syphilis on admission for delivery; (c-1) with no (a-1) result in the
//     record, syphilis and HIV at delivery, the HIV test expedited so results arrive "less than six
//     hours" after submission; (c-2) if that was not done before delivery, a newborn sample "less
//     than two hours after the time of birth", HIV expedited. (l) The woman may object to HIV testing;
//     for the newborn test, a parent, managing conservator, or guardian may object.
//   CA HSC 120685 (SB 306, 2021) requires syphilis testing per the latest CDPH guidelines. CDPH's
//     SB 306 fact sheet: all pregnant patients three times -- at confirmation of pregnancy or the
//     first prenatal encounter, early in the third trimester (about 28 weeks or as soon as possible
//     after), and at delivery; emergency departments and hospital-affiliated urgent care screen
//     before discharge if no syphilis result is available for this pregnancy. HSC 125085(b):
//     hepatitis B surface antigen and HIV as early as possible in prenatal care; 125090(d): if the
//     record lacks either at the final review or at labor and delivery, obtain them, fastest method,
//     with the right to decline HIV.
//   NY Public Health Law 2308 (nysenate.gov): syphilis at the first examination, and during the third
//     trimester "consistent with any guidance and regulations issued by the commissioner".
//     NYSDOH, "Syphilis Screening During Pregnancy: New York State Laws and Regulations" (publication
//     21452, February 2026; read 2026-09-19): up to three screens -- when pregnancy is first
//     diagnosed; at 28 weeks or as soon after as reasonably possible, but no later than 32 weeks
//     (PHL 2308, effective May 3, 2024); and again at delivery (10 NYCRR 69-2.2), including a
//     delivery before the third trimester. A missed screen is done as soon as possible. The
//     Department recommends, but does not require, screening in an emergency department.
//   NY hepatitis B (Cornell LII, 10 NYCRR 69-3, amended November 13, 2019): 69-3.2 the provider sends
//     an HBsAg test with the prenatal syphilis draw or another prenatal draw and records it before
//     admission for delivery; 69-3.3(b) with no result at admission, the facility sends a specimen
//     immediately, marked "mother/delivery", with the result within 24 hours of admission and never
//     later than 48.
//   NY HIV (Cornell LII): 10 NYCRR 405.21(c)(8)(i)(h) -- a hospital prenatal care program gives HIV
//     counseling and a clinical recommendation for testing, which the patient may decline (PHL
//     article 27-F). 10 NYCRR 69-1.3(n)(2) (amended November 13, 2019) -- with no HIV result
//     documented this pregnancy, the hospital immediately arranges an expedited HIV test of the
//     mother with her consent or, if she declines, an expedited HIV antibody screen of the newborn,
//     the result within 12 hours of her consent or of the birth. (405.21 still cites this as
//     69-1.3(l), the old lettering.)
//   NJ N.J.S.A. 26:4-49.1 (FindLaw, current as of January 1, 2024): syphilis at the first
//     examination and at delivery of a live infant (mother's blood or cord blood).
//   NJ HIV, N.J.A.C. 8:61-4.2 to 4.4 (Cornell LII; adopted by 57 N.J.R. 29(a), effective January 6,
//     2025; read 2026-09-19): 4.2(a)3 the prenatal provider tests as early as possible and again in
//     the third trimester unless the person has a known HIV diagnosis or specifically declines.
//     4.3(a) a pregnant person presenting to a birthing facility for any reason, including its
//     emergency room, is asked about prenatal care, and without it gets information and testing as
//     medically appropriate. 4.3(c) at admission for labor and delivery with HIV status unknown or not
//     of record, or no third-trimester test, an expedited HIV test as soon as medically appropriate.
//     4.4(a) the newborn is tested if the delivering parent's status is unknown or undocumented,
//     unless a parent objects in writing on religious grounds.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const PNS_VERIFIED = '2026-09-18';
export const PNS_STATES = stateOptions(['NY', 'NJ', 'CA', 'TX']);
export const SETTINGS = [
  { value: 'prenatal', text: 'Prenatal visit' },
  { value: 'delivery', text: 'Admission for delivery' },
  { value: 'ed', text: 'Emergency department or urgent care' },
];
export const ON_RECORD = [
  { value: 'yes', text: 'Result on record' },
  { value: 'no', text: 'No result on record' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

const ASK = {
  syphFirst: 'whether a first-visit syphilis result is on record',
  syph3: 'whether a third-trimester syphilis result is on record',
  hivFirst: 'whether a first-visit HIV result is on record',
  hiv3: 'whether a third-trimester HIV result is on record',
  hbv: 'whether a hepatitis B result is on record',
};

export function prenatalInfectionScreeningSchedule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !PNS_STATES.some((s) => s.value === o.state)) return { valid: false, message: 'Choose the state. Each sets its own schedule.' };
  const setting = SETTINGS.find((s) => s.value === o.setting);
  if (!setting) return { valid: false, message: 'Choose the setting: a prenatal visit, admission for delivery, or an emergency department.' };
  if (isBlank(o.ga)) return { valid: false, message: 'Enter the gestational age in weeks. The third-trimester tests start at 28 weeks.' };
  const ga = Number(String(o.ga).trim());
  if (!Number.isFinite(ga) || ga < 1 || ga > 45) return { valid: false, message: 'Enter a gestational age between 1 and 45 weeks.' };

  const need = { TX: { prenatal: ['syphFirst', 'hivFirst', 'hbv', ...(ga >= 28 ? ['syph3', 'hiv3'] : [])], delivery: ['syph3', 'hiv3'], ed: [] },
    CA: { prenatal: ['syphFirst', 'hivFirst', 'hbv', ...(ga >= 28 ? ['syph3'] : [])], delivery: ['hivFirst', 'hbv'], ed: ['syphFirst', 'syph3'] },
    NY: { prenatal: ['syphFirst', 'hivFirst', 'hbv', ...(ga >= 28 ? ['syph3'] : [])], delivery: ['hivFirst', 'hbv'], ed: [] },
    NJ: { prenatal: ['syphFirst', 'hivFirst', ...(ga >= 28 ? ['hiv3'] : [])], delivery: ['hiv3'], ed: ['hivFirst'] } }[o.state][setting.value];
  for (const k of need) {
    if (o[k] !== 'yes' && o[k] !== 'no') return { valid: false, message: `Answer ${ASK[k]}. A blank is not the same as none.` };
  }
  const no = (k) => o[k] === 'no';
  const due = [];
  const next = [];
  const notes = [];

  if (o.state === 'TX') {
    if (setting.value === 'prenatal') {
      const first = ['syphFirst', 'hivFirst', 'hbv'].filter(no).map((k) => ({ syphFirst: 'syphilis', hivFirst: 'HIV', hbv: 'hepatitis B' }[k]));
      if (first.length) due.push(`First-examination tests not on record: ${first.join(', ')} (81.090(a)).`);
      if (ga >= 28) {
        const third = ['syph3', 'hiv3'].filter(no).map((k) => (k === 'syph3' ? 'syphilis' : 'HIV'));
        if (third.length) due.push(`Third-trimester ${third.join(' and ')}, due now at 28 weeks or later (81.090(a-1)).`);
      } else {
        next.push(`Syphilis and HIV in the third trimester, not before 28 weeks: ${28 - ga} week${28 - ga === 1 ? '' : 's'} from now (81.090(a-1)).`);
      }
      next.push('At admission for delivery: hepatitis B and syphilis (81.090(c)).');
    } else if (setting.value === 'delivery') {
      due.push('Hepatitis B and syphilis on admission for delivery (81.090(c)).');
      if (no('syph3') || no('hiv3')) {
        due.push('The third-trimester syphilis and HIV results are not both in the record: test for syphilis and HIV now, with the HIV test expedited so the result arrives in less than 6 hours (81.090(c-1)).');
        notes.push('If that is not done before delivery, the newborn is tested for syphilis and HIV less than 2 hours after birth, the HIV test expedited to under 6 hours; a parent, managing conservator, or guardian may object to the newborn HIV test (81.090(c-2), (l)).');
      }
    } else {
      notes.push('Section 81.090 sets no emergency department rule; the prenatal and delivery schedule still applies.');
    }
    notes.push('The woman may object to HIV testing; an objection is referred to anonymous testing (81.090(k), (l)).');
  } else if (o.state === 'CA') {
    if (setting.value === 'ed') {
      if (no('syphFirst') && no('syph3')) due.push('No syphilis result for this pregnancy: screen for syphilis before discharge (CDPH guidelines under HSC 120685).');
      else notes.push('A syphilis result for this pregnancy is on record, so no emergency department screen is required by that rule.');
    } else if (setting.value === 'prenatal') {
      if (no('syphFirst')) due.push('Syphilis at confirmation of pregnancy or the first prenatal encounter (CDPH, HSC 120685).');
      if (no('hivFirst') || no('hbv')) due.push(`${[no('hivFirst') && 'HIV', no('hbv') && 'hepatitis B surface antigen'].filter(Boolean).join(' and ')}, as early as possible in prenatal care (HSC 125085(b)); HIV may be declined.`);
      if (ga >= 28) { if (no('syph3')) due.push('Third-trimester syphilis, due now: about 28 weeks or as soon as possible after (CDPH).'); }
      else next.push(`Syphilis early in the third trimester, about 28 weeks: ${28 - ga} week${28 - ga === 1 ? '' : 's'} from now (CDPH).`);
      next.push('Syphilis again at delivery (CDPH).');
    } else {
      due.push('Syphilis at delivery, for every patient (CDPH, HSC 120685).');
      if (no('hivFirst') || no('hbv')) due.push(`Not documented in the record: ${[no('hivFirst') && 'HIV', no('hbv') && 'hepatitis B'].filter(Boolean).join(' and ')}. Obtain now by the fastest method; HIV may be declined (HSC 125090(d)).`);
    }
  } else if (o.state === 'NY') {
    if (setting.value === 'prenatal') {
      if (no('syphFirst')) due.push('Syphilis now: it is required when pregnancy is first diagnosed, and as soon as possible if that was missed (PHL 2308).');
      if (no('hivFirst')) due.push('HIV: counsel and recommend testing; the patient may decline (10 NYCRR 405.21(c)(8)(i)(h)).');
      if (no('hbv')) due.push('Hepatitis B surface antigen, with the syphilis draw or another prenatal draw, recorded before admission for delivery (10 NYCRR 69-3.2).');
      if (ga >= 28 && no('syph3')) {
        due.push(ga <= 32
          ? 'Third-trimester syphilis, due now: at 28 weeks and no later than 32 (PHL 2308).'
          : 'Third-trimester syphilis is past its 32-week limit: screen as soon as possible (PHL 2308).');
      } else if (ga < 28) {
        next.push(`Third-trimester syphilis at 28 weeks, no later than 32: ${28 - ga} week${28 - ga === 1 ? '' : 's'} from now (PHL 2308).`);
      }
      next.push('Syphilis again at delivery (10 NYCRR 69-2.2).');
      notes.push('The Department encourages pairing the third-trimester syphilis screen with the recommended third-trimester HIV test.');
    } else if (setting.value === 'delivery') {
      due.push('Syphilis at delivery, for every patient, even one screened in the third trimester or delivering before it (10 NYCRR 69-2.2).');
      if (no('hivFirst')) due.push('No HIV result this pregnancy: arrange an expedited HIV test of the mother now, with her consent. If she declines, arrange an expedited HIV antibody screen of the newborn. The result is due within 12 hours of her consent, or of the birth if she declines (10 NYCRR 69-1.3(n)(2)).');
      if (no('hbv')) due.push('No hepatitis B surface antigen result: send her blood immediately, marked "mother/delivery". The result is due within 24 hours of admission and never later than 48 (10 NYCRR 69-3.3(b)).');
    } else {
      notes.push('New York sets no emergency department rule, but the Department recommends a syphilis screen when pregnancy is diagnosed in an emergency or urgent care setting.');
    }
  } else {
    if (setting.value === 'prenatal') {
      if (no('syphFirst')) due.push('Syphilis at the first examination (N.J.S.A. 26:4-49.1).');
      if (no('hivFirst')) due.push('HIV as early as possible in the pregnancy, unless the patient has a known HIV diagnosis or declines (N.J.A.C. 8:61-4.2(a)3).');
      if (ga >= 28) { if (no('hiv3')) due.push('HIV again in the third trimester, due now (N.J.A.C. 8:61-4.2(a)3).'); }
      else next.push(`HIV again in the third trimester: ${28 - ga} week${28 - ga === 1 ? '' : 's'} until 28 weeks (N.J.A.C. 8:61-4.2(a)3).`);
      next.push('Syphilis again at delivery, from the mother or cord blood (N.J.S.A. 26:4-49.1).');
    } else if (setting.value === 'delivery') {
      due.push('Syphilis at delivery of a live infant, from the mother or cord blood (N.J.S.A. 26:4-49.1).');
      if (no('hiv3')) {
        due.push('No third-trimester HIV result: an expedited HIV test as soon as medically appropriate, with the result sent to labor and delivery in time to act on it (N.J.A.C. 8:61-4.3(c)).');
        notes.push('If the delivering parent\'s HIV status is still unknown or undocumented, the newborn is tested unless a parent objects in writing on religious grounds (N.J.A.C. 8:61-4.4(a)).');
      }
    } else {
      if (no('hivFirst')) due.push('At a birthing facility, including its emergency room: ask about prenatal care, and without it give HIV information and testing as medically appropriate (N.J.A.C. 8:61-4.3(a)).');
      notes.push('N.J.S.A. 26:4-49.1 sets no emergency department syphilis rule.');
    }
    notes.push('An HIV test may be declined, and care may not be denied for declining (N.J.A.C. 8:61-4.2(d), 4.3(d)).');
  }

  const label = due.length ? `Due now: ${due.length}` : 'Nothing due now';
  return {
    valid: true,
    abnormal: due.length > 0,
    bandLabel: setting.value === 'ed' && due.length ? 'Due before discharge' : label,
    band: due.length ? due.join(' ') : 'Nothing required by these rules is due at this encounter.',
    next,
    notes,
    postureNote: scopeSentence(PNS_VERIFIED),
  };
}
