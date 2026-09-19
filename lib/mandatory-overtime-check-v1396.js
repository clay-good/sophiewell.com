// spec-v1396: can a nurse be required to work overtime? New York, New Jersey, and Texas.
//
// Sources, read 2026-09-19:
//   NY Labor Law 167 (nysenate.gov): (2) no health care employer may require a nurse to work beyond
//     regularly scheduled hours except under (3): (a) a health care disaster that increases the need
//     for personnel; (b) a federal, state, or county declaration of emergency in the nurse's county or
//     a contiguous county; (c) an emergency necessary for safe patient care, defined as "an unforeseen
//     event that could not be prudently planned for by an employer and does not regularly occur"; (d)
//     an ongoing medical or surgical procedure the nurse is actively engaged in. (5)(d) Before using
//     mandatory overtime the employer makes a good faith effort to cover it voluntarily (per diems,
//     agency nurses, floats, asking off-duty staff).
//   N.J.S.A. 34:11-56a33 (FindLaw, current as of January 1, 2024): requiring a health care facility
//     employee to work beyond the agreed, regularly scheduled shift is contrary to public policy,
//     except "in the case of an unforeseeable emergent circumstance when the overtime is required only
//     as a last resort and is not used to fill vacancies resulting from chronic short staffing and the
//     employer has exhausted reasonable efforts to obtain staffing."
//   N.J.A.C. 8:43E-8.3 and 8.5 (Cornell LII, read 2026-09-19): "reasonable efforts" are four -- seek
//     volunteers among qualified staff on duty, contact qualified staff who said they are available,
//     seek qualified per diem staff, and seek qualified agency staff where permitted. Chronic short
//     staffing is vacancies unfilled 90 days or more despite active recruitment. 8.5(b): exhausting
//     reasonable efforts is NOT required in a declared national, State, or municipal emergency, or a
//     disaster or catastrophic event that substantially affects the need for care or activates the
//     facility's emergency or disaster plan. 8.5(c): up to one hour to arrange care for minor children
//     or elderly or disabled family members. 8.5(d): on-call time is not a substitute.
//   TX Health & Safety Code 258.002-258.005 (official mirror): a hospital may not require mandatory
//     overtime and a nurse may refuse it; on-call time may not substitute for it. Exceptions (258.004):
//     (1) a health care disaster unexpectedly affecting the county or a contiguous county; (2) a
//     declared emergency there; (3) an emergency or unforeseen event that does not regularly occur,
//     increases the need for staff, and could not prudently be anticipated -- with a good faith effort,
//     to the extent possible, to cover it voluntarily; (4) an ongoing procedure. 258.005: no
//     retaliation for refusing or reporting.
//
// Chronic short staffing regularly occurs and can be planned for, so it fits none of the three.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, scopeSentence } from './state-calendar.js';

export const OT_VERIFIED = '2026-09-19';
export const OT_STATES = stateOptions(['NY', 'NJ', 'TX']);
export const SITUATIONS = [
  { value: 'disaster', text: 'A health care disaster affecting this or a neighboring county' },
  { value: 'declaration', text: 'A declared federal, state, or county emergency in this or a neighboring county' },
  { value: 'unforeseen', text: 'An unforeseen emergency that does not regularly occur and could not be planned for' },
  { value: 'procedure', text: 'The nurse is in an ongoing procedure the patient needs finished' },
  { value: 'chronic', text: 'The unit is short again: vacancies, call-outs, or a thin schedule' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

export function mandatoryOvertimeCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const st = OT_STATES.find((s) => s.value === o.state);
  if (!st) return { valid: false, message: 'Choose New York, New Jersey, or Texas.' };
  const sit = SITUATIONS.find((s) => s.value === o.situation);
  if (!sit) return { valid: false, message: 'Choose the situation. "We are short again" is never an emergency under any of the three laws.' };
  const base = { valid: true, postureNote: scopeSentence(OT_VERIFIED) };

  if (sit.value === 'chronic') {
    const why = {
      NY: 'Labor Law 167(3)(c) defines an emergency as an unforeseen event that could not be prudently planned for and does not regularly occur; chronic short staffing is neither.',
      NJ: 'N.J.S.A. 34:11-56a33 bars overtime used to fill vacancies from chronic short staffing, which N.J.A.C. 8:43E-8.3 defines as positions left unfilled 90 days or more despite active recruitment.',
      TX: 'Health & Safety Code 258.004(a)(3) needs an event that does not regularly occur and could not prudently be anticipated; chronic short staffing is neither.',
    }[st.value];
    return { ...base, permitted: false, abnormal: true, bandLabel: 'Not permitted', band: `Mandatory overtime is not permitted. ${why} The nurse may volunteer.`, conditions: [] };
  }
  if (o.voluntaryTried !== 'yes' && o.voluntaryTried !== 'no') return { valid: false, message: 'Answer whether the employer first tried to cover the shift voluntarily (per diems, agency nurses, floats, asking off-duty staff).' };

  if (st.value === 'NJ') {
    const NJ_AFTER = ['Not to fill vacancies from chronic short staffing.', 'The nurse gets up to one hour to arrange care for minor children or elderly or disabled family members (N.J.A.C. 8:43E-8.5(c)).', 'On-call time may not be used as a substitute for mandatory overtime (8:43E-8.5(d)).'];
    const EFFORTS = 'Reasonable efforts are four: seek volunteers among qualified staff on duty, contact qualified staff who said they were available, seek qualified per diem staff, and seek qualified agency staff where permitted (N.J.A.C. 8:43E-8.3).';
    if (sit.value === 'disaster' || sit.value === 'declaration') {
      return { ...base, permitted: true, abnormal: false, bandLabel: 'Permitted as a last resort', band: 'In a declared national, State, or municipal emergency, or a disaster or catastrophic event that substantially affects the need for care or activates the facility\'s emergency or disaster plan, the employer need not first exhaust reasonable staffing efforts. Overtime is still a last resort for an unforeseeable emergent circumstance (N.J.A.C. 8:43E-8.5(b); N.J.S.A. 34:11-56a33).', conditions: ['Last resort only.', ...NJ_AFTER] };
    }
    if (sit.value === 'procedure') {
      return { ...base, permitted: null, abnormal: false, bandLabel: 'Only as an unforeseeable emergent circumstance', band: `New Jersey names no exception for an ongoing procedure. It qualifies only as an unforeseeable emergent circumstance, as a last resort, after reasonable efforts to staff are exhausted. ${EFFORTS}`, conditions: ['Last resort only.', 'Reasonable efforts to obtain staffing exhausted first.', ...NJ_AFTER.slice(1)] };
    }
    if (o.voluntaryTried === 'no') return { ...base, permitted: false, abnormal: true, bandLabel: 'Not yet permitted', band: `Even in an unforeseeable emergent circumstance, overtime may be required only as a last resort after the employer has exhausted reasonable efforts to obtain staffing (N.J.S.A. 34:11-56a33). ${EFFORTS}`, conditions: [] };
    return { ...base, permitted: true, abnormal: false, bandLabel: 'Permitted as a last resort', band: 'An unforeseeable emergent circumstance, with reasonable staffing efforts exhausted: overtime may be required as a last resort (N.J.S.A. 34:11-56a33; N.J.A.C. 8:43E-8.5).', conditions: NJ_AFTER };
  }

  const ref = st.value === 'NY'
    ? { disaster: '167(3)(a)', declaration: '167(3)(b)', unforeseen: '167(3)(c)', procedure: '167(3)(d)' }[sit.value]
    : { disaster: '258.004(a)(1)', declaration: '258.004(a)(2)', unforeseen: '258.004(a)(3)', procedure: '258.004(a)(4)' }[sit.value];
  const needsVoluntary = st.value === 'NY' || sit.value === 'unforeseen';
  if (needsVoluntary && o.voluntaryTried === 'no') {
    const cite = st.value === 'NY' ? 'Labor Law 167(5)(d) requires a good faith effort to cover it voluntarily before any mandatory overtime' : 'Health & Safety Code 258.004(b) requires, to the extent possible, a good faith effort to cover it voluntarily first';
    return { ...base, permitted: false, abnormal: true, bandLabel: 'Not yet permitted', band: `The situation is an exception (${ref}), but ${cite}: per diems, agency nurses, floats, or asking off-duty staff.`, conditions: [] };
  }
  const conditions = st.value === 'TX'
    ? ['On-call time may not be used as a substitute for mandatory overtime (258.003(c)).', 'Time just before or after a shift to document or hand off patient status is not mandatory overtime (258.002).', 'A hospital may not discipline a nurse for refusing to work mandatory overtime or for reporting a violation (258.005).']
    : [];
  return { ...base, permitted: true, abnormal: false, bandLabel: 'Permitted under an exception', band: `Mandatory overtime is permitted under ${st.value === 'NY' ? 'Labor Law' : 'Health & Safety Code'} ${ref}: ${sit.text.toLowerCase()}.`, conditions };
}
