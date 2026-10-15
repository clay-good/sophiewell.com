// spec-v1638 tool 1: does a member meet the Part D medication therapy management targeting
// criteria?
//
// Sources, re-read October 12, 2026:
//   42 CFR 423.153(d)(2) (eCFR as current October 8, 2026). Targeted beneficiaries "meet the
//     characteristics of at least one of the following two groups: (i)(A) Have multiple chronic
//     diseases, with three chronic diseases being the maximum number a Part D plan sponsor may
//     require ...; (B) Are taking multiple Part D drugs, with eight Part D drugs being the maximum
//     number ...; and (C) Are likely to incur annual covered Part D drug costs greater than or
//     equal to the MTM cost threshold ... (ii) Beginning January 1, 2022, are at-risk
//     beneficiaries as defined in 423.100." (iii) the ten core diseases a sponsor must include;
//     (iv) sponsors "must include all Part D maintenance drugs ... and may include all Part D
//     drugs."
//   CMS, Contract Year 2025, 2026 and 2027 Part D MTM Program Guidance and Submission
//     Instructions: "the MTM cost threshold will be $1,623 for 2025", "$1,276 for 2026" and
//     "$1,340 for 2027".
//
// DATED CONSTANTS: the threshold is published each spring. For a plan year the tool has no figure
// for, it asks the reader for that year's threshold and uses no other year's.
// The tool does not decide which drugs are "maintenance"; the reader supplies the counts.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const THRESHOLDS = { 2025: 1623, 2026: 1276, 2027: 1340 };
// Route B: CMS posts each year's MTM memo on this page (re-read October 14, 2026: the newest is the contract
// year 2027 memo, v.05.04.2026). The weekly page watch lists the page when a new memo appears.
export const SOURCE = {
  edition: 'contract year 2027 memo (May 4, 2026)', route: 'B', readOn: '2026-10-14',
  source: { label: 'CMS, Medication Therapy Management', url: 'https://www.cms.gov/medicare/coverage/prescription-drug-coverage-contracting/medication-therapy-management' },
};
export const CORE_DISEASES = ['Alzheimer\'s disease', 'bone disease-arthritis', 'chronic congestive heart failure', 'diabetes', 'dyslipidemia', 'end-stage renal disease', 'HIV/AIDS', 'hypertension', 'mental health', 'respiratory disease'];
const opt = (value, text) => ({ value, text });
export const AT_RISK = [opt('at-risk-beneficiary', 'Yes: an at-risk beneficiary under a drug management program'), opt('not-at-risk', 'No')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const whole = (label, v, lo, hi) => inputFault([[label, v, lo, hi, '']]) || (Number.isInteger(Number(v)) ? null : `Enter ${label} as a whole number.`);
const money = (n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export function mtmEligibilityCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const yf = whole('the plan year', o.planYear, 2025, 2100);
  if (yf) return { valid: false, message: yf };
  const year = Number(o.planYear);
  const risk = AT_RISK.find((a) => a.value === String(o.atRisk ?? '').trim());
  if (!risk) return { valid: false, message: 'Choose whether the member is an at-risk beneficiary under a drug management program: that alone targets the member.' };
  for (const [label, v, lo, hi] of [['the plan\'s minimum number of chronic diseases', o.planMinDiseases, 2, 10], ['the plan\'s minimum number of Part D drugs', o.planMinDrugs, 2, 20], ['the member\'s chronic diseases that the plan counts', o.memberDiseases, 0, 50], ['the member\'s Part D drugs that the plan counts', o.memberDrugs, 0, 200]]) {
    const f = whole(label, v, lo, hi); if (f) return { valid: false, message: f };
  }
  const cf = inputFault([['the member\'s projected annual covered Part D drug cost', o.annualCost, 0, 1e8, 'dollars']]);
  if (cf) return { valid: false, message: cf };
  let threshold = THRESHOLDS[year] ?? null; let thresholdSource = `CMS's contract year ${year} MTM memo`;
  if (threshold === null) {
    if (blank(o.thresholdOverride)) return { valid: false, message: `Enter the MTM cost threshold CMS published for ${year}: this tool holds the figures for 2025, 2026 and 2027 only, and uses no other year's in their place.` };
    const tf = inputFault([[`the ${year} MTM cost threshold`, o.thresholdOverride, 1, 1e6, 'dollars']]);
    if (tf) return { valid: false, message: tf };
    threshold = Number(o.thresholdOverride); thresholdSource = 'as entered';
  }
  const minDis = Number(o.planMinDiseases); const minDrugs = Number(o.planMinDrugs);
  const dis = Number(o.memberDiseases); const drugs = Number(o.memberDrugs); const cost = Number(o.annualCost);
  const notes = []; const notPermitted = [];
  if (minDis > 3) notPermitted.push(`a minimum of ${minDis} chronic diseases (the most a sponsor may require is 3)`);
  if (minDrugs > 8) notPermitted.push(`a minimum of ${minDrugs} Part D drugs (the most a sponsor may require is 8)`);
  const tests = [
    { name: 'chronic diseases', met: dis >= minDis, text: `${dis} against the plan's minimum of ${minDis}` },
    { name: 'Part D drugs', met: drugs >= minDrugs, text: `${drugs} against the plan's minimum of ${minDrugs}` },
    { name: 'projected annual cost', met: cost >= threshold, text: `${money(cost)} against the ${year} threshold of ${money(threshold)} (${thresholdSource})` },
  ];
  const group1 = tests.every((t) => t.met);
  const group2 = risk.value === 'at-risk-beneficiary';
  for (const t of tests) notes.push(`${t.name.charAt(0).toUpperCase()}${t.name.slice(1)}: ${t.text}: ${t.met ? 'met' : 'not met'}.`);
  notes.push(group1 ? 'Group 1 (42 CFR 423.153(d)(2)(i)): all three tests are met.' : `Group 1 (42 CFR 423.153(d)(2)(i)): not met; the first test that fails is ${tests.find((t) => !t.met).name}.`);
  notes.push(group2 ? 'Group 2 (423.153(d)(2)(ii)): an at-risk beneficiary is targeted whatever group 1 shows.' : 'Group 2 (423.153(d)(2)(ii)): not an at-risk beneficiary.');
  if (notPermitted.length) notes.push(`The plan settings entered are not permitted by the rule: ${notPermitted.join('; ')}. The result above uses them as entered.`);
  notes.push(`The cost counted is the cost "likely to incur" for covered Part D drugs in the year. The ten core diseases a sponsor must count: ${CORE_DISEASES.join('; ')}; a plan may add others. A sponsor must count all Part D maintenance drugs and may count all Part D drugs; which drugs are maintenance is not decided here.`);
  const targeted = group1 || group2;
  return { valid: true, targeted, group1, group2, threshold, planSettingsNotPermitted: notPermitted.length > 0, flag: targeted ? (group1 && group2 ? 'targeted-both-groups' : group1 ? 'targeted-group-1' : 'targeted-group-2') : 'not-targeted', abnormal: notPermitted.length > 0, band: targeted ? `Meets the MTM targeting criteria for ${year}.` : `Does not meet the MTM targeting criteria for ${year}.`, bandLabel: targeted ? (group1 && group2 ? 'Both groups' : group1 ? 'Group 1: diseases, drugs and cost' : 'Group 2: at-risk beneficiary') : `Fails on ${tests.find((t) => !t.met).name}`, notes, note: notes.join(' ') };
}
