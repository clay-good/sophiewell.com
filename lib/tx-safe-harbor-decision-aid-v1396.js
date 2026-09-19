// spec-v1396: Texas nurse Safe Harbor -- how to request a peer review determination and what it
// protects, Occupations Code 303.005.
//
// Source: official mirror tcss.legis.texas.gov, Occupations Code ch. 303, read 2026-09-19.
//   (b) A nurse asked to engage in conduct the nurse believes violates a duty to a patient may request
//     a nursing peer review committee determination on a Board of Nursing form (or one meeting its
//     standards). (b-1) If immediate patient care needs prevent completing the form, the nurse may
//     request it by orally notifying the supervisor, who records in writing: (1) the nurse's name;
//     (2) the date and time; (3) the location of the conduct or assignment; (4) who requested the
//     conduct or made the assignment; (5) the recording supervisor's name; (6) a brief explanation of
//     why; (7) the collaboration between nurse and supervisor. (b-2) The record is valid only if
//     signed and attested by both.
//   (c) A nurse who requests in good faith may not be disciplined or discriminated against for the
//     request; may engage in the conduct pending review; is not subject to the Chapter 301 reporting
//     requirement for it; and may not be disciplined by the board for that conduct while review is
//     pending. (d) If the nurse refuses the conduct pending review, the committee's determination is
//     considered in any employer discipline, but is not binding if a nurse administrator believes in
//     good faith it is wrong. (e) A question about a physician order's medical reasonableness goes to
//     the medical staff or medical director, whose determination controls. (f) A contract cannot
//     nullify these rights. (h) No retaliation against the nurse or anyone who told them of the right.
//
// Board rule 22 TAC 217.20 (Cornell LII copy, last amended effective October 22, 2019; read
// 2026-09-19; the Secretary of State copy did not load):
//   (c)(1) applies where a person regularly employs or contracts 8 or more nurses (for review of an
//     RN, at least 4 of the 8 are RNs). (d)(1) invoke it BEFORE engaging in the conduct: when it is
//     requested or assigned, when the assignment changes enough that harm may result, or when
//     refusing. (d)(3) the written quick request also carries the nurse's signature. (d)(4) a
//     comprehensive written request (six items) is due before leaving the work setting at the end of
//     the work period. (g)(1) the nurse may decline pending review only if (A) they lack the basic
//     knowledge, skills, and abilities to do it at a minimally competent level, so it would expose
//     patients to an unjustifiable risk of harm, or (B) it would be unprofessional or criminal
//     conduct; (g)(2) after declining under (A), nurse and supervisor try to find an acceptable
//     assignment and document it. (i)(1) the committee decides and notifies the CNO within 14
//     calendar days of the request; (i)(2) the CNO tells the nurse within 48 hours of receiving it,
//     and whether they believe it correct; (i)(3) board protection for doing the assignment ends 48
//     hours after the nurse is told. Retaliation protection does not expire.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const SH_VERIFIED = '2026-09-19';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const PLAN = [
  { value: 'proceed', text: 'Do the assignment while the review is pending' },
  { value: 'refuse', text: 'Decline the assignment while the review is pending' },
];

const ORAL = [
  'your name',
  'the date and time of the request',
  'where the conduct or assignment happened',
  'who asked for the conduct or made the assignment',
  'the name of the supervisor recording it',
  'a brief explanation of why you are requesting review',
  'how you and the supervisor worked through it together',
];

const COMPREHENSIVE = 'Before you leave at the end of your shift, submit a comprehensive written request: the assignment and who made it; the practice setting, resources, and circumstances; how it would violate your duty to a patient; if you declined, why; any documents you have; and your name, title, and relationship to the supervisor. Keep a copy (217.20(d)(4), (d)(5)).';
const TIMELINE = 'The peer review committee decides within 14 calendar days of your request. Within 48 hours of receiving it, the chief nursing officer tells you the decision and whether they believe it is correct (217.20(i)(1), (2)).';
const REFUSE_LIMIT = 'You may decline while the review is pending only if you lack the basic knowledge, skills, and abilities to do it at a minimally competent level, so doing it would put patients at unjustifiable risk, or if it would be unprofessional or criminal conduct. If you decline because it is beyond your competence, you and the supervisor try to find an acceptable assignment and document it (217.20(g)).';

export function txSafeHarborDecisionAid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.canWrite !== 'yes' && o.canWrite !== 'no') return { valid: false, message: 'Answer whether you can complete the written request form now, or whether patient care needs prevent it.' };
  const plan = PLAN.find((p) => p.value === o.plan);
  if (!plan) return { valid: false, message: 'Choose whether you will do the assignment or decline it while the review is pending. The protections differ.' };
  const physicianOrder = o.physicianOrder === 'yes';

  const how = o.canWrite === 'yes'
    ? 'Before you do the assignment, request a nursing peer review committee determination in writing and sign it, on the Board of Nursing form or one that meets its standards (303.005(b); 217.20(d)).'
    : 'Tell your supervisor orally that you are requesting peer review. The supervisor writes down seven things, and you both sign it; without both signatures the request is not valid (303.005(b-1), (b-2)):';
  const protections = plan.value === 'proceed'
    ? ['You may not be disciplined or discriminated against for making the request in good faith.', 'You may do the assignment while the review is pending, and the board may not discipline you for it during that time. That board protection ends 48 hours after you are told the committee\'s decision; the protection against retaliation does not (217.20(i)(3)).', 'You are not subject to the Chapter 301 duty to report for that conduct.']
    : ['You may not be disciplined or discriminated against for making the request in good faith.', REFUSE_LIMIT, 'If you decline, the committee\'s decision is considered in any discipline, but it is not binding if a nurse administrator believes in good faith it is wrong (303.005(d)).'];
  return {
    valid: true,
    abnormal: plan.value === 'refuse',
    bandLabel: o.canWrite === 'yes' ? 'Request in writing' : 'Request orally; supervisor records seven items',
    band: how,
    oralItems: o.canWrite === 'no' ? ORAL : [],
    comprehensiveNote: COMPREHENSIVE,
    timelineNote: TIMELINE,
    protections,
    orderNote: physicianOrder ? 'The question is whether a physician order is medically reasonable: the medical staff or medical director decides that, and their determination controls (303.005(e)).' : null,
    limitsNote: 'A contract cannot take these rights away, and no one may retaliate against you or against someone who told you about them (303.005(f), (h)). The rule applies where an employer regularly uses 8 or more nurses (217.20(c)(1)). Safe Harbor must be invoked before you do the assignment, not after.',
    postureNote: scopeSentence(SH_VERIFIED),
  };
}
