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
//     trimester "consistent with any guidance and regulations issued by the commissioner". The
//     Department's guidance (the week, and any delivery test) did not load, nor did New York's
//     prenatal HIV and hepatitis B rules.
//   NJ N.J.S.A. 26:4-49.1 (FindLaw, current as of January 1, 2024): syphilis at the first
//     examination and at delivery of a live infant (mother's blood or cord blood). New Jersey's
//     prenatal HIV rule (N.J.A.C. 8:61) was not read.
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
    NY: { prenatal: ['syphFirst', ...(ga >= 28 ? ['syph3'] : [])], delivery: [], ed: [] },
    NJ: { prenatal: ['syphFirst'], delivery: [], ed: [] } }[o.state][setting.value];
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
      if (no('syphFirst')) due.push('Syphilis at the first examination (PHL 2308).');
      if (ga >= 28 && no('syph3')) due.push('Third-trimester syphilis (PHL 2308), timed by the Commissioner\'s guidance, which did not load here.');
      else if (ga < 28) next.push('Syphilis in the third trimester (PHL 2308); the week comes from the Commissioner\'s guidance, not read here.');
    } else {
      notes.push('PHL 2308 sets the first-visit and third-trimester syphilis tests. The Department\'s delivery and emergency department guidance did not load here; follow your facility\'s protocol.');
    }
    notes.push('New York\'s prenatal HIV and hepatitis B rules are not covered here.');
  } else {
    if (setting.value === 'prenatal') {
      if (no('syphFirst')) due.push('Syphilis at the first examination (N.J.S.A. 26:4-49.1).');
      next.push('Syphilis again at delivery, from the mother or cord blood (N.J.S.A. 26:4-49.1).');
    } else if (setting.value === 'delivery') {
      due.push('Syphilis at delivery of a live infant, from the mother or cord blood (N.J.S.A. 26:4-49.1).');
    } else {
      notes.push('N.J.S.A. 26:4-49.1 sets no emergency department rule.');
    }
    notes.push('New Jersey\'s prenatal HIV rule (N.J.A.C. 8:61) is not covered here.');
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
