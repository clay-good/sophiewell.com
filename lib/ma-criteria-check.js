// spec-v1603 tool 1: was this Medicare Advantage denial allowed to use these
// criteria?
//
// A process check, never a medical-necessity finding. Every rule was read in
// the eCFR on September 29, 2026:
//
//   42 CFR 422.101(b)-(c)(1)(i)(A): an MA plan follows NCDs, Traditional
//     Medicare's coverage and benefit conditions, and the local contractors'
//     LCDs, and may not deny basic benefits on criteria not specified there.
//   422.101(b)(6): internal coverage criteria are allowed only when Medicare's
//     are not fully established -- (i)(A) general provisions need unspecified
//     criteria to be applied consistently; (B) an NCD or LCD explicitly allows
//     coverage beyond its listed indications; (C) no applicable statute,
//     regulation, NCD or LCD sets criteria -- and (ii) only when the criteria,
//     a summary of the evidence, its sources and the rationale are public.
//   422.566(d): an adverse medical-necessity decision is reviewed before it
//     issues by a physician or other health care professional with expertise
//     appropriate for the services at issue (not necessarily the treating
//     provider's specialty).
//   422.112(b)(8)(i)(A): for coordinated care plans, an approved course of
//     treatment stays approved as long as medically necessary; (B) a new
//     enrollee in an active course of treatment has at least 90 days before
//     the plan may disrupt it or require reauthorization.
//
// An unanswered question is "unknown", never "met".
//
// Pure: no DOM, no clock.

export const BENEFITS = [
  { value: 'basic', text: 'A service Original Medicare covers (a basic benefit)' },
  { value: 'supplemental', text: 'An extra benefit only the plan offers (dental, vision, gym)' },
];
export const DENIALS = [
  { value: 'medical-necessity', text: 'Not medically necessary (or similar wording)' },
  { value: 'other', text: 'Something else (not a covered benefit, paperwork, out of network)' },
];
export const SOURCES = [
  { value: 'medicare', text: 'A Medicare rule, NCD or LCD' },
  { value: 'internal', text: 'The plan\'s own criteria (or a vendor\'s, like InterQual or MCG)' },
];
export const MEDICARE_CRITERIA = [
  { value: 'full', text: 'Yes: an NCD, LCD or Medicare rule sets the criteria for this service' },
  { value: 'flex', text: 'An NCD or LCD applies but explicitly allows coverage beyond its listed indications' },
  { value: 'general', text: 'Only general Medicare rules apply, and they need more criteria to be applied consistently' },
  { value: 'none', text: 'No Medicare statute, regulation, NCD or LCD sets criteria for it' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const REVIEWERS = [
  { value: 'expert', text: 'A physician or other professional with expertise for this service' },
  { value: 'not-expert', text: 'Someone without that expertise, or no clinician' },
];
export const COURSES = [
  { value: 'none', text: 'No: this was a new request' },
  { value: 'approved', text: 'Yes: the plan had approved this course of treatment' },
  { value: 'new-enrollee', text: 'Yes: I was already in this treatment when I joined the plan' },
];

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const opt = (list, v) => (v === '' || v == null ? null : pick(list, v));

export function maCriteriaCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const benefit = pick(BENEFITS, o.benefit);
  if (!benefit) return { valid: false, message: 'Choose whether the service is one Original Medicare covers.' };
  const denial = pick(DENIALS, o.denial);
  if (!denial) return { valid: false, message: 'Choose the reason the denial gave.' };
  const source = pick(SOURCES, o.source);
  if (!source) return { valid: false, message: 'Choose whose criteria the denial cites.' };
  const answers = { medicareCriteria: [MEDICARE_CRITERIA, o.medicareCriteria], posted: [YES_NO, o.posted], evidence: [YES_NO, o.evidence], reviewer: [REVIEWERS, o.reviewer], course: [COURSES, o.course] };
  for (const [k, [list, v]] of Object.entries(answers)) if (v !== '' && v != null && !pick(list, v)) return { valid: false, message: `Answer ${k} with one of its choices, or leave it blank.` };
  const medicareCriteria = opt(MEDICARE_CRITERIA, o.medicareCriteria);
  const posted = opt(YES_NO, o.posted);
  const evidence = opt(YES_NO, o.evidence);
  const reviewer = opt(REVIEWERS, o.reviewer);
  const course = opt(COURSES, o.course);
  let days = null;
  if (String(o.days ?? '').trim() !== '') {
    days = Number(o.days);
    if (!Number.isInteger(days) || days < 0 || days > 3650) return { valid: false, message: 'Enter the whole number of days from joining the plan to the denial, or leave it blank.' };
  }
  const note = 'This checks the plan\'s process, not whether the service is medically necessary: that is for the plan and, on appeal, the reviewer.';

  if (benefit === 'supplemental') {
    return { valid: true, verdict: 'does-not-apply', band: 'These rules govern basic benefits, the services Original Medicare covers (42 CFR 422.101(b)-(c)). A supplemental benefit follows the plan\'s own terms in its Evidence of Coverage.', bandLabel: 'Rules do not apply', abnormal: false, rows: [], notes: [], note };
  }

  const rows = [];
  // 1. Whose criteria, 422.101(b)(6) and (c)(1)(i)(A).
  if (source === 'medicare') {
    rows.push({ status: 'met', rule: '42 CFR 422.101(b)', text: 'The denial rests on Medicare\'s own coverage criteria.' });
  } else if (medicareCriteria === 'full') {
    rows.push({ status: 'not-met', rule: '42 CFR 422.101(b)(6) and (c)(1)(i)(A)', text: 'The plan used its own criteria where Medicare\'s are fully established; it may not deny a basic benefit on criteria Medicare does not specify.' });
  } else if (medicareCriteria) {
    const allowed = {
      flex: ['(b)(6)(i)(B)', 'the NCD or LCD allows coverage beyond its listed indications'],
      general: ['(b)(6)(i)(A)', 'general provisions need more criteria, and the plan must show the added criteria\'s benefits highly likely outweigh their harms, including from delayed care'],
      none: ['(b)(6)(i)(C)', 'no Medicare statute, regulation, NCD or LCD sets criteria'],
    }[medicareCriteria];
    rows.push({ status: 'met', rule: `42 CFR 422.101${allowed[0]}`, text: `Internal criteria are allowed here: ${allowed[1]}.` });
  } else {
    rows.push({ status: 'unknown', rule: '42 CFR 422.101(b)(6)', text: 'Whether internal criteria were allowed depends on whether an NCD, LCD or Medicare rule fully sets the criteria for this service: answer that question (the Medicare Coverage Database lists them).' });
  }
  // 2. Public criteria and evidence, 422.101(b)(6)(ii).
  if (source === 'internal' && medicareCriteria !== 'full') {
    if (posted === 'no' || evidence === 'no') {
      const miss = [posted === 'no' && 'the criteria are not public', evidence === 'no' && 'there is no public summary of the evidence, its sources and the rationale'].filter(Boolean).join(', and ');
      rows.push({ status: 'not-met', rule: '42 CFR 422.101(b)(6)(ii)', text: `Internal criteria must be publicly accessible with their evidence: ${miss}.` });
    } else if (posted === 'yes' && evidence === 'yes') {
      rows.push({ status: 'met', rule: '42 CFR 422.101(b)(6)(ii)', text: 'The internal criteria and a summary of their evidence are public.' });
    } else {
      const open = [posted === null && 'whether the criteria are posted publicly', evidence === null && 'whether a summary of their evidence, its sources and the rationale is posted'].filter(Boolean).join(', and ');
      rows.push({ status: 'unknown', rule: '42 CFR 422.101(b)(6)(ii)', text: `${open[0].toUpperCase()}${open.slice(1)} was not assessed.` });
    }
  }
  // 3. Reviewer, 422.566(d).
  if (denial === 'medical-necessity') {
    if (reviewer === 'expert') rows.push({ status: 'met', rule: '42 CFR 422.566(d)', text: 'A reviewer with expertise appropriate for the service reviewed it before the denial issued.' });
    else if (reviewer === 'not-expert') rows.push({ status: 'not-met', rule: '42 CFR 422.566(d)', text: 'A medical-necessity denial must be reviewed first by a physician or other professional with expertise appropriate for the service (not necessarily the same specialty as your doctor).' });
    else rows.push({ status: 'unknown', rule: '42 CFR 422.566(d)', text: 'Who reviewed the denial was not assessed. The denial notice or the case file names the reviewer; you can ask the plan for it.' });
  }
  // 4. Ongoing treatment, 422.112(b)(8).
  if (course === 'approved') {
    rows.push({ status: 'unknown', rule: '42 CFR 422.112(b)(8)(i)(A)', text: 'An approved course of treatment stays approved as long as it is medically necessary. Whether it still is, this cannot judge; if the plan ended it early, ask for the reason in writing.' });
  } else if (course === 'new-enrollee') {
    if (days === null) rows.push({ status: 'unknown', rule: '42 CFR 422.112(b)(8)(i)(B)', text: 'How many days after you joined the plan it denied was not assessed. For the first 90 days it may not disrupt an active course of treatment or require reauthorization.' });
    else if (days < 90) rows.push({ status: 'not-met', rule: '42 CFR 422.112(b)(8)(i)(B)', text: `Day ${days} of your enrollment is inside the 90-day transition: the plan may not disrupt an active course of treatment or require reauthorization, even out of network.` });
    else rows.push({ status: 'met', rule: '42 CFR 422.112(b)(8)(i)(B)', text: `Day ${days} is past the 90-day transition period.` });
  }

  const notMet = rows.filter((r) => r.status === 'not-met');
  const unknown = rows.filter((r) => r.status === 'unknown');
  const notes = [];
  if (course) notes.push('The course-of-treatment rules apply to coordinated care plans (HMOs, PPOs and similar), which most Medicare Advantage plans are (422.112(b)).');
  notes.push('To challenge it, ask the plan for a reconsideration and cite the rule; Which Appeal Rules Apply? gives the deadline.');
  if (notMet.length) {
    return { valid: true, verdict: 'not-met', band: `${notMet.length === 1 ? 'A process requirement was' : `${notMet.length} process requirements were`} not met: ${notMet.map((r) => r.rule).join('; ')}. That is a ground for reconsideration; it does not decide medical necessity.`, bandLabel: 'Not met', abnormal: true, rows, notes, note };
  }
  if (unknown.length) {
    return { valid: true, verdict: 'unknown', band: `Nothing you answered shows a process failure, but ${unknown.length === 1 ? 'one requirement is' : `${unknown.length} requirements are`} not assessed: ${unknown.map((r) => r.rule).join('; ')}.`, bandLabel: 'Not assessed', abnormal: false, rows, notes, note };
  }
  return { valid: true, verdict: 'met', band: 'Each process requirement you answered was met. That does not make the denial right on medical necessity, which an appeal can still challenge.', bandLabel: 'Met', abnormal: false, rows, notes, note };
}
