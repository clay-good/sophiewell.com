// spec-v1504: appeal and request document builders. Each builder fills in everything that is a rule or a
// date, cites the rule that grants the right to ask, and leaves the clinical argument as a bracketed blank
// for a person to write. A blank the reader did not fill stays visible as [bracketed text], and the answer
// counts them. No builder states an outcome, a success rate, or a clinical fact the reader did not supply.
//
// Part D redetermination (42 CFR 423.580-423.590, read 2026-09-26): a written request within 60 calendar
// days after receipt of the coverage determination notice, receipt presumed 5 days after its date
// (423.582(b)); after that, only with a written good-cause request stating why it is late (423.582(c)).
// Expedited when a prescriber indicates the standard timeframe may seriously jeopardize the enrollee's life
// or health or ability to regain maximum function (423.584(c)(2)); decisions in 7 days, 14 for payment,
// 72 hours expedited (423.590).
// Employer plan appeal (29 CFR 2560.503-1(h), read 2026-09-26): at least 180 days after receiving the
// denial (h)(3)(i); the right to submit comments and documents (h)(2)(ii), to free copies of everything
// relevant (h)(2)(iii), to a review with no deference by someone not involved in the denial (h)(3)(ii), to a
// consultation with a health care professional for a medical judgment (h)(3)(iii), and to the names of the
// experts consulted (h)(3)(iv).
//
// Pure: no DOM, no clock (the caller passes `now`).

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { longDate } from './partd-appeals-v1503.js';
import { acaExternalReviewClock } from './aca-external-review-v1503.js';

const txt = (v, blank) => (String(v ?? '').trim() ? String(v).trim() : `[${blank}]`);
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const CLAIM_KINDS = [
  { value: 'pre', text: 'Pre-service (approval before care)' },
  { value: 'post', text: 'Post-service (a claim for care already given)' },
  { value: 'urgent', text: 'Urgent care' },
];

function blanks(sections) {
  const all = sections.flatMap((s) => [...(s.paragraphs || []), ...(s.items || [])]).join(' ');
  return (all.match(/\[[^\]]+\]/g) || []).length;
}

function finish(title, sections, due, rule, warnings, notes, lead = '') {
  const n = blanks(sections);
  const band = `${lead}${due ? `${rule} ${longDate(due)}. ` : ''}${n ? `${n} blank${n === 1 ? '' : 's'} left to fill before sending.` : 'No blanks left; review before sending.'}`;
  return { valid: true, title, sections, warnings, blanks: n, deadline: due ? due.toISOString().slice(0, 10) : null, band, bandLabel: n ? `${n} blank${n === 1 ? '' : 's'} left` : 'Ready to review', abnormal: n > 0, notes, note: 'A template that states the rules and dates; it makes no clinical claim the reader did not supply. The plan\'s notice and the regulation control.' };
}

export function partdRedeterminationRequest(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const notice = date(o.noticeDate);
  if (!notice) return { valid: false, message: 'Enter the date on the coverage determination notice (YYYY-MM-DD).' };
  const today = String(o.requestDate ?? '').trim() ? date(o.requestDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the request date as YYYY-MM-DD, or leave it blank for today.' };
  const received = String(o.receivedDate ?? '').trim() ? date(o.receivedDate) : addCalendarDaysUtc(notice, 5);
  if (!received) return { valid: false, message: 'Enter the date the notice was received as YYYY-MM-DD, or leave it blank to presume 5 days after its date.' };
  const due = addCalendarDaysUtc(received, 60);
  const late = today > due;
  const goodCause = o.goodCause === 'yes';
  if (late && !goodCause) return { valid: false, message: `The 60-day window closed on ${longDate(due)}. Mark that you are asking for a good-cause extension to add the paragraph 42 CFR 423.582(c) requires.` };
  const expedited = o.expedited === 'yes';
  const prescriberStatement = o.prescriberStatement === 'yes';
  const notes = [];
  if (!String(o.receivedDate ?? '').trim()) notes.push(`Receipt is presumed 5 days after the notice date, on ${longDate(received)} (42 CFR 423.582(b)(1)).`);
  const body = [
    'To the Part D plan sponsor:',
    `I request a redetermination of the coverage determination dated ${longDate(notice)} that denied coverage of ${txt(o.drug, 'drug, strength and quantity')} for ${txt(o.enrollee, 'enrollee name')}, member ID ${txt(o.memberId, 'member ID')}, under 42 CFR 423.580-423.590.`,
    `Reason the drug is needed: [clinical reason, written by the prescriber or the enrollee]`,
    'Please consider the enclosed information, whether or not it was submitted with the original request.',
  ];
  if (expedited) {
    body.push(prescriberStatement
      ? 'I request an expedited redetermination. As the prescriber, I indicate that applying the standard timeframe may seriously jeopardize the enrollee\'s life or health or ability to regain maximum function (42 CFR 423.584(c)(2)(ii)).'
      : 'I request an expedited redetermination because applying the standard timeframe may seriously jeopardize my life or health or my ability to regain maximum function (42 CFR 423.584(c)(2)(i)).');
    notes.push('An expedited decision is due within 72 hours of the plan receiving the request (42 CFR 423.590(d)).');
  } else notes.push('A standard decision is due within 7 calendar days of the plan receiving the request, or 14 days for a payment request (42 CFR 423.590(a)-(b)).');
  if (late) body.push(`This request is filed after the 60-day period, which ended ${longDate(due)}. I ask the plan to extend the time for filing for good cause: [why the request was not filed on time] (42 CFR 423.582(c)).`);
  body.push('Sincerely,', `${txt(o.requester, 'name of enrollee or prescriber')}`);
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, 'plan name')}, redeterminations (the address on the coverage determination notice)`, `Re: ${txt(o.enrollee, 'enrollee name')}, member ID ${txt(o.memberId, 'member ID')}`] },
    { heading: 'Request', paragraphs: body },
    { heading: 'Enclosures', items: ['The coverage determination notice', 'The prescriber\'s supporting statement', 'Records supporting the reason above'] },
  ];
  return finish('Request for Redetermination of a Part D Coverage Determination', sections, late ? null : due, 'The request is due by', ['A template; check the plan\'s address and deadline on the notice.'], notes);
}

export function erisaAppealLetter(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const denial = date(o.denialReceived);
  if (!denial) return { valid: false, message: 'Enter the date the denial was received (YYYY-MM-DD).' };
  const kind = CLAIM_KINDS.some((k) => k.value === o.claimKind) ? o.claimKind : null;
  if (!kind) return { valid: false, message: 'Choose the kind of claim: pre-service, post-service or urgent care.' };
  const today = String(o.requestDate ?? '').trim() ? date(o.requestDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the letter date as YYYY-MM-DD, or leave it blank for today.' };
  const due = addCalendarDaysUtc(denial, 180);
  if (today > due) return { valid: false, message: `The plan must allow at least 180 days after the denial is received, which ran to ${longDate(due)}; check the plan document for a longer period before sending.` };
  const decision = { pre: '30 days', post: '60 days', urgent: '72 hours' }[kind];
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, 'plan name')}, claims appeals (the named fiduciary on the denial notice)`, `Re: ${txt(o.claimant, 'claimant name')}, member ID ${txt(o.memberId, 'member ID')}, claim ${txt(o.claimId, 'claim or reference number')}`] },
    { heading: 'Appeal', paragraphs: [
      'To the plan:',
      `I appeal the adverse benefit determination I received on ${longDate(denial)} denying ${txt(o.service, 'the service, drug or item')}.`,
      'Under 29 CFR 2560.503-1(h), I ask for:',
      'A full and fair review that gives no deference to the denial, by a named fiduciary who did not make it and is not that person\'s subordinate ((h)(3)(ii)).',
      'Free copies of all documents, records and other information relevant to my claim, including the plan provisions, guidelines and criteria relied on ((h)(2)(iii)).',
      'Consultation with a health care professional with appropriate training and experience in the field, if the denial rests on a medical judgment ((h)(3)(iii)), and the names of any medical experts the plan consulted ((h)(3)(iv)).',
      'Consideration of everything I submit, whether or not it was part of the original claim ((h)(2)(iv)).',
      'Why the denial should be reversed: [the clinical or coverage argument, written by the claimant or the provider]',
      `Please decide within ${decision}, as the regulation requires for this kind of claim.`,
      'Sincerely,',
      `${txt(o.claimant, 'claimant name')}`,
    ] },
    { heading: 'Enclosures', items: ['The denial notice', 'Records and letters supporting the argument above'] },
  ];
  const notes = [`The plan must allow at least 180 days after the denial is received: until ${longDate(due)} at the earliest (29 CFR 2560.503-1(h)(3)(i)).`];
  if (kind === 'urgent') notes.push('An urgent-care appeal may be made orally, and the plan must use a fast method such as telephone or fax ((h)(3)(vi)).');
  notes.push('Some plans have two appeal levels; each then has half the time. After the final internal decision, external review may be available (45 CFR 147.136).');
  return finish('Appeal of an Adverse Benefit Determination (Employer Plan)', sections, due, 'The plan must accept the appeal through at least', ['A template; check the plan\'s appeal address and any shorter plan deadline for a second level.'], notes);
}

// Medicare Advantage reconsideration (42 CFR 422.578-422.590, read 2026-09-26): a written request within 60
// calendar days after receipt of the organization determination, receipt presumed 5 days after its date
// (422.582(b)); after that only with a written good-cause request (422.582(c)); expedited when a physician
// indicates the standard timeframe could seriously jeopardize the enrollee's life or health or ability to
// regain maximum function (422.584(c)(2)), not for a payment request; decisions in 30 days for a service,
// 60 for payment, 7 for a Part B drug, 72 hours expedited (422.590).
export const MA_ITEMS = [
  { value: 'service', text: 'A service or item' },
  { value: 'partb-drug', text: 'A Part B drug' },
  { value: 'payment', text: 'Payment for care already received' },
];
export function maReconsiderationRequest(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const notice = date(o.noticeDate);
  if (!notice) return { valid: false, message: 'Enter the date on the organization determination notice (YYYY-MM-DD).' };
  const item = MA_ITEMS.some((x) => x.value === o.item) ? o.item : null;
  if (!item) return { valid: false, message: 'Choose what was denied: a service, a Part B drug, or payment.' };
  const today = String(o.requestDate ?? '').trim() ? date(o.requestDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the request date as YYYY-MM-DD, or leave it blank for today.' };
  const received = String(o.receivedDate ?? '').trim() ? date(o.receivedDate) : addCalendarDaysUtc(notice, 5);
  if (!received) return { valid: false, message: 'Enter the date the notice was received as YYYY-MM-DD, or leave it blank to presume 5 days after its date.' };
  const due = addCalendarDaysUtc(received, 60);
  const late = today > due;
  if (late && o.goodCause !== 'yes') return { valid: false, message: `The 60-day window closed on ${longDate(due)}. Mark that you are asking for a good-cause extension to add the paragraph 42 CFR 422.582(c) requires.` };
  const expedited = o.expedited === 'yes';
  if (expedited && item === 'payment') return { valid: false, message: 'A payment request cannot be expedited; choose standard, or choose the service or drug itself.' };
  const notes = [];
  if (!String(o.receivedDate ?? '').trim()) notes.push(`Receipt is presumed 5 days after the notice date, on ${longDate(received)} (42 CFR 422.582(b)(1)).`);
  const what = txt(o.service, item === 'partb-drug' ? 'the Part B drug' : 'the service or item');
  const body = [
    'To the Medicare Advantage organization:',
    `I request reconsideration of the organization determination dated ${longDate(notice)} that denied ${item === 'payment' ? `payment for ${what}` : what} for ${txt(o.enrollee, 'enrollee name')}, member ID ${txt(o.memberId, 'member ID')}, under 42 CFR 422.578-422.590.`,
    'Why the determination should be reversed: [clinical reason, written by the physician or the enrollee]',
  ];
  if (expedited) {
    body.push(o.physicianStatement === 'yes'
      ? 'I request an expedited reconsideration. As the physician, I indicate that applying the standard timeframe could seriously jeopardize the enrollee\'s life or health or ability to regain maximum function (42 CFR 422.584(c)(2)(ii)).'
      : 'I request an expedited reconsideration because applying the standard timeframe could seriously jeopardize my life or health or my ability to regain maximum function (42 CFR 422.584(c)(2)(i)).');
    notes.push(`An expedited decision is due within 72 hours of the plan receiving the request (42 CFR 422.590(e)).`);
  } else notes.push(`A standard decision is due within ${{ service: '30 days', 'partb-drug': '7 days', payment: '60 days' }[item]} of the plan receiving the request (42 CFR 422.590).`);
  if (late) body.push(`This request is filed after the 60-day period, which ended ${longDate(due)}. I ask the plan to extend the time for filing for good cause: [why the request was not filed on time] (42 CFR 422.582(c)).`);
  body.push('Sincerely,', txt(o.requester, 'name of enrollee or physician'));
  notes.push('If the plan upholds any part of the denial, it must send the case to the independent review entity automatically; the enrollee does not file a second request.');
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, 'plan name')}, reconsiderations (the address on the notice)`, `Re: ${txt(o.enrollee, 'enrollee name')}, member ID ${txt(o.memberId, 'member ID')}`] },
    { heading: 'Request', paragraphs: body },
    { heading: 'Enclosures', items: ['The organization determination notice', 'Records supporting the reason above'] },
  ];
  return finish('Request for Reconsideration of a Medicare Advantage Organization Determination', sections, late ? null : due, 'The request is due by', ['A template; check the plan\'s address and deadline on the notice.'], notes);
}

// External review (45 CFR 147.136, read 2026-09-26): the request within 4 months of receiving the final
// internal denial, first day of the fifth month when no date matches, moved past a weekend or federal
// holiday (the aca-external-review-clock computation). Expedited when the standard timeframe would seriously
// jeopardize the claimant's life or health or ability to regain maximum function. Deemed exhaustion: a plan
// that fails to strictly adhere to the internal-appeal rules leaves the claimant deemed to have exhausted
// them, free to request external review ((b)(2)(ii)(F)(1)); the reader marks it, the tool does not judge it.
export function externalReviewRequest(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const clock = acaExternalReviewClock({ noticeReceived: o.denialReceived });
  if (!clock.valid) return clock;
  const due = parseIsoStrict(clock.deadline);
  const today = String(o.requestDate ?? '').trim() ? date(o.requestDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the request date as YYYY-MM-DD, or leave it blank for today.' };
  if (today > due) return { valid: false, message: `The four-month window closed on ${longDate(due)} (45 CFR 147.136). Ask the plan or the state whether a late request can be accepted before sending.` };
  const body = [
    'To the plan or issuer:',
    `I request an external review of the final adverse benefit determination I received on ${longDate(parseIsoStrict(String(o.denialReceived).trim()))} denying ${txt(o.service, 'the service, drug or item')} for ${txt(o.claimant, 'claimant name')}, member ID ${txt(o.memberId, 'member ID')}, under 45 CFR 147.136.`,
    'Why the denial should be reversed: [the clinical or coverage argument, written by the claimant or the provider]',
  ];
  if (o.expedited === 'yes') body.push('I request an expedited external review: the standard timeframe would seriously jeopardize my life or health or my ability to regain maximum function (45 CFR 147.136).');
  if (o.deemedExhaustion === 'yes') body.push('The plan did not strictly adhere to the internal claims and appeals requirements, so I am deemed to have exhausted the internal process and may request external review now (45 CFR 147.136(b)(2)(ii)(F)(1)). The failure: [what the plan failed to do, and when]');
  body.push('Sincerely,', txt(o.claimant, 'claimant name'));
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, 'plan or issuer name')}, external review (the address on the final denial, or the state's external review office)`, `Re: ${txt(o.claimant, 'claimant name')}, member ID ${txt(o.memberId, 'member ID')}`] },
    { heading: 'Request', paragraphs: body },
    { heading: 'Enclosures', items: ['The final internal denial', 'Records supporting the argument above'] },
  ];
  const notes = [...clock.notes.filter((n) => !/deemed to have exhausted|judgment this tool/.test(n))];
  notes.push('An insured plan may use the state\'s external review process; a self-funded plan uses the federal process. The final denial notice says which.');
  return finish('Request for External Review', sections, due, 'The request is due by', ['A template; check where the final denial says to send it.'], notes);
}

// Medicaid appeal or fair hearing (42 CFR 438.402-438.420, 431.221, read 2026-09-26): a managed care plan
// appeal within 60 days of the notice (438.402(c)(2)(ii)); a fee-for-service fair hearing within the state's
// window, at most 90 days from the notice mailing (431.221(d)). Continued benefits when asked within 10 days
// of the notice being sent, or by the action's effective date if later (438.420); if the final decision goes
// against the enrollee, the plan may recover the cost of those services (438.420(d)).
export const MEDICAID_KINDS = [
  { value: 'plan', text: 'Managed care plan appeal' },
  { value: 'hearing', text: 'State fair hearing (fee-for-service)' },
];
export function medicaidHearingRequest(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = MEDICAID_KINDS.some((k) => k.value === o.kind) ? o.kind : null;
  if (!kind) return { valid: false, message: 'Choose a managed care plan appeal or a fee-for-service fair hearing.' };
  const notice = date(o.noticeDate);
  if (!notice) return { valid: false, message: 'Enter the date on the notice (YYYY-MM-DD).' };
  const today = String(o.requestDate ?? '').trim() ? date(o.requestDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the request date as YYYY-MM-DD, or leave it blank for today.' };
  let days = 60;
  const notes = [];
  if (kind === 'hearing') {
    if (!String(o.stateDays ?? '').trim()) return { valid: false, message: 'Enter the state\'s fair hearing window in days (at most 90 from the notice mailing, 42 CFR 431.221(d)).' };
    const n = Number(o.stateDays);
    if (!Number.isInteger(n) || n < 1 || n > 90) return { valid: false, message: 'Enter the state\'s window as whole days from 1 to 90 (42 CFR 431.221(d)).' };
    days = n;
  }
  const due = addCalendarDaysUtc(notice, days);
  if (today > due) return { valid: false, message: `The ${days}-day window closed on ${longDate(due)}. Ask the ${kind === 'plan' ? 'plan' : 'state'} whether a late request can be accepted before sending.` };
  const keep = o.keepBenefits === 'yes';
  const tenDay = addCalendarDaysUtc(notice, 10);
  const body = [
    kind === 'plan' ? 'To the Medicaid managed care plan:' : 'To the state Medicaid agency, fair hearings:',
    `I ${kind === 'plan' ? 'appeal' : 'request a fair hearing on'} the notice dated ${longDate(notice)} about ${txt(o.service, 'the service or benefit')} for ${txt(o.enrollee, 'enrollee name')}, Medicaid ID ${txt(o.memberId, 'Medicaid ID')}${kind === 'plan' ? ', under 42 CFR 438.402' : ', under 42 CFR 431.221'}.`,
    'Why the decision is wrong: [the reason, written by the enrollee or the provider]',
  ];
  if (keep) {
    body.push('I ask that my benefits continue while this is decided (42 CFR 438.420).');
    notes.push(`To keep benefits, the request must be filed by ${longDate(tenDay)} (10 days after the notice was sent), or by the effective date of the action if later (42 CFR 438.420).`);
    notes.push('If the final decision upholds the denial, the plan may recover the cost of services given while it was pending, as the state allows (42 CFR 438.420(d)).');
  }
  if (kind === 'plan' && o.expedited === 'yes') {
    body.push('I request an expedited appeal: taking the time for a standard resolution could seriously jeopardize my life, physical or mental health, or ability to attain, maintain, or regain maximum function (42 CFR 438.410(a)).');
    notes.push('An expedited plan appeal is resolved within 72 hours (42 CFR 438.408(b)(3)).');
  } else if (kind === 'plan') notes.push('A standard plan appeal is resolved within 30 days, extendable by 14 (42 CFR 438.408).');
  body.push('Sincerely,', txt(o.enrollee, 'enrollee name'));
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, kind === 'plan' ? 'plan name' : 'state Medicaid agency')} (the address on the notice)`, `Re: ${txt(o.enrollee, 'enrollee name')}, Medicaid ID ${txt(o.memberId, 'Medicaid ID')}`] },
    { heading: 'Request', paragraphs: body },
    { heading: 'Enclosures', items: ['The notice', 'Records supporting the reason above'] },
  ];
  return finish(kind === 'plan' ? 'Medicaid Managed Care Appeal' : 'Request for a Medicaid Fair Hearing', sections, due, 'The request is due by', ['A template; check the address and any shorter state deadline on the notice.'], notes);
}

// Part D exception request (42 CFR 423.566-423.578, read 2026-09-26). The prescriber's supporting statement
// must say, for a tiering exception, that the preferred drug(s) would not be as effective, would have
// adverse effects, or both (423.578(a)(4)); for a non-formulary drug, that all covered drugs on any tier
// would not be as effective, would have adverse effects, or both ((b)(5)(i)); for step therapy, that the
// required alternative has been or is likely to be ineffective or harmful ((b)(5)(ii)); for a dose
// restriction, that the doses allowed have been or are likely to be ineffective ((b)(5)(iii)). The decision
// is due 72 hours (24 expedited) after the plan receives the statement (423.568(b), 423.572(a)); a late
// decision is an adverse one, forwarded to the independent review entity ((c)(2)).
export const EXCEPTION_TYPES = [
  { value: 'tiering', text: 'Tiering (a lower cost-sharing tier)' },
  { value: 'formulary', text: 'Non-formulary drug' },
  { value: 'step', text: 'Step therapy requirement' },
  { value: 'dose', text: 'Dose or quantity restriction' },
];
export const BASES = [
  { value: 'effective', text: 'The alternatives would not be as effective' },
  { value: 'adverse', text: 'The alternatives would have adverse effects' },
  { value: 'both', text: 'Both' },
];
const STATEMENT = {
  tiering: (b) => `the preferred drug(s) for the treatment of the enrollee's condition ${b === 'effective' ? 'would not be as effective for the enrollee as the requested drug' : b === 'adverse' ? 'would have adverse effects for the enrollee' : 'would not be as effective for the enrollee as the requested drug and would have adverse effects for the enrollee'} (42 CFR 423.578(a)(4))`,
  formulary: (b) => `all of the covered Part D drugs on any tier of the plan's formulary for the same condition ${b === 'effective' ? 'would not be as effective for the enrollee as the non-formulary drug' : b === 'adverse' ? 'would have adverse effects for the enrollee' : 'would not be as effective for the enrollee and would have adverse effects'} (42 CFR 423.578(b)(5)(i))`,
  step: (b) => `the formulary alternative required by step therapy ${b === 'adverse' ? 'has caused, or is likely to cause, an adverse reaction or other harm to the enrollee' : b === 'effective' ? 'has been, or is likely to be, ineffective in treating the enrollee\'s condition' : 'has been, or is likely to be, ineffective and has caused, or is likely to cause, harm to the enrollee'} (42 CFR 423.578(b)(5)(ii))`,
  dose: () => 'the number of doses available under the dose restriction has been, or is likely to be, ineffective in treating the enrollee\'s condition (42 CFR 423.578(b)(5)(iii))',
};
export function partdExceptionRequest(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const type = EXCEPTION_TYPES.some((t) => t.value === o.type) ? o.type : null;
  if (!type) return { valid: false, message: 'Choose the kind of exception.' };
  const basis = BASES.some((b) => b.value === o.basis) ? o.basis : null;
  if (!basis && type !== 'dose') return { valid: false, message: 'Choose the basis the prescriber states: not as effective, adverse effects, or both.' };
  const today = String(o.requestDate ?? '').trim() ? date(o.requestDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the request date as YYYY-MM-DD, or leave it blank for today.' };
  const hasStatement = o.statement === 'yes';
  const expedited = o.expedited === 'yes';
  const notes = [];
  const body = [
    'To the Part D plan sponsor:',
    `I request ${type === 'tiering' ? 'a tiering exception' : type === 'formulary' ? 'a formulary exception to cover a non-formulary drug' : type === 'step' ? 'an exception to the step therapy requirement' : 'an exception to the dose restriction'} for ${txt(o.drug, 'drug, strength and quantity')} for ${txt(o.enrollee, 'enrollee name')}, member ID ${txt(o.memberId, 'member ID')}, under 42 CFR 423.578.`,
  ];
  if (expedited) body.push('I request an expedited decision: applying the standard timeframe may seriously jeopardize the enrollee\'s life or health or ability to regain maximum function (42 CFR 423.570(c)(2)(ii)).');
  body.push('Sincerely,', txt(o.requester, 'name of enrollee or prescriber'));
  const statement = hasStatement
    ? [`As the prescriber, I state that ${STATEMENT[type](basis)}.`, 'Clinical basis: [the enrollee\'s history, the alternatives tried or ruled out, and the results, written by the prescriber]', `Prescriber: ${txt(o.prescriber, 'prescriber name and NPI')}`]
    : ['[Missing: the prescriber\'s supporting statement. The plan\'s decision clock does not start until it arrives.]'];
  if (!hasStatement) notes.push('Without the prescriber\'s supporting statement the plan\'s clock does not start; it runs 72 hours (24 expedited) from when the statement arrives (42 CFR 423.568(b), 423.572(a)).');
  else notes.push(`The plan must decide within ${expedited ? '24' : '72'} hours of receiving the supporting statement (42 CFR ${expedited ? '423.572(a)' : '423.568(b)'}).`);
  notes.push('A decision not made in time counts as a denial and goes to the independent review entity within 24 hours (42 CFR 423.578(c)(2)).');
  if (type === 'tiering') notes.push('An approved tiering exception covers refills without a new request for the rest of the enrollment period, as long as the prescriber keeps prescribing it and it stays safe (42 CFR 423.578(c)(3)).');
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, 'plan name')}, coverage determinations`, `Re: ${txt(o.enrollee, 'enrollee name')}, member ID ${txt(o.memberId, 'member ID')}`] },
    { heading: 'Request', paragraphs: body },
    { heading: 'Prescriber\'s supporting statement', paragraphs: statement },
  ];
  const lead = hasStatement ? `The plan decides within ${expedited ? '24' : '72'} hours of receiving the supporting statement. ` : 'The prescriber\'s supporting statement is missing, so the plan\'s clock has not started. ';
  return finish('Request for a Part D Coverage Determination (Exception)', sections, null, '', ['A template; the supporting statement must come from the prescriber.'], notes, lead);
}

// Letter of medical necessity for a drug: the diagnosis, the drug and its use, the prior therapies, and the
// payer's criteria with where the evidence is, as the reader supplies them; the clinical rationale is always a
// blank for the prescriber. It states the FDA-approved indication only when the reader marks it approved.
export function medicalNecessityLetter(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.drug ?? '').trim()) return { valid: false, message: 'Enter the drug, dose and schedule.' };
  if (!String(o.diagnosis ?? '').trim()) return { valid: false, message: 'Enter the diagnosis with its ICD-10-CM code.' };
  const today = String(o.letterDate ?? '').trim() ? date(o.letterDate) : todayUtc(now);
  if (!today) return { valid: false, message: 'Enter the letter date as YYYY-MM-DD, or leave it blank for today.' };
  const approved = o.labeled === 'yes' ? 'is an FDA-approved indication for this drug (see the enclosed prescribing information)' : o.labeled === 'no' ? 'is not in the FDA-approved labeling; the supporting compendia and literature are enclosed' : '[whether this is an FDA-approved indication]';
  const lines = (v) => String(v ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const prior = lines(o.priorTherapies);
  const criteria = lines(o.criteria);
  const sections = [
    { heading: 'Heading', paragraphs: [`Date: ${longDate(today)}`, `${txt(o.plan, 'plan name')}, pharmacy or medical review`, `Re: ${txt(o.patient, 'patient name')}, member ID ${txt(o.memberId, 'member ID')}`] },
    { heading: 'Request', paragraphs: [
      `I am writing to request coverage of ${o.drug.trim()} for my patient, ${txt(o.patient, 'patient name')}.`,
      `Diagnosis: ${o.diagnosis.trim()}${String(o.diagnosisDate ?? '').trim() ? `, diagnosed ${o.diagnosisDate.trim()}` : ''}. This ${approved}.`,
      'Why this drug is medically necessary for this patient: [clinical rationale, written by the prescriber]',
    ] },
    { heading: 'Prior therapies', items: prior.length ? prior : ['[each prior drug, the dates, and why it stopped]'] },
    { heading: 'Payer criteria and where the evidence is', items: criteria.length ? criteria : ['[each criterion of the plan\'s policy, and where the record shows it]'] },
    { heading: 'Signature', paragraphs: ['Sincerely,', txt(o.prescriber, 'prescriber name, credentials and NPI')] },
  ];
  const notes = ['The Step Therapy History Check and the Payer Criteria Checklist produce the prior-therapy and criteria lists this letter takes, one per line.'];
  return finish('Letter of Medical Necessity', sections, null, '', ['A template; every clinical statement must come from the prescriber.'], notes, `Letter of medical necessity for ${o.drug.trim()}. `);
}
