// spec-v1516 tool 1: denial, what to do next and by when.
//
// An original mapping, written for this tool, from a reviewed set of claim adjustment reason codes (CARC,
// checked active on x12.org on 2026-09-26) to a category and its usual next step. It reproduces no X12
// description text. A code outside the set gets "no mapping", never a guess. The group code matters: PR puts
// the amount on the patient (for example, under a valid advance beneficiary notice), so the next step is to
// bill the patient or dispute the assignment.
// Deadlines come from each payer type's rules, the same windows the appeal tools verify: Original Medicare
// redetermination within 120 days of receiving the notice, presumed 5 days after its date (42 CFR 405.942);
// Medicare Advantage reconsideration and Part D redetermination within 60 days of receipt (422.582,
// 423.582); employer and Marketplace plans at least 180 days (29 CFR 2560.503-1(h)(3)(i), 45 CFR 147.136).
// A corrected Medicare claim is due within 1 calendar year of the date of service (42 CFR 424.44). Medicaid
// provider appeal windows are set by each state or plan contract, so the tool asks for them.
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';
import { inputFault } from './num.js';

const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };

export const GROUPS = [
  { value: 'CO', text: 'CO (contractual obligation)' },
  { value: 'PR', text: 'PR (patient responsibility)' },
  { value: 'OA', text: 'OA (other adjustment)' },
  { value: 'PI', text: 'PI (payer-initiated reduction)' },
];
export const PAYERS = [
  { value: 'medicare', text: 'Original Medicare' },
  { value: 'ma', text: 'Medicare Advantage' },
  { value: 'partd', text: 'Part D plan' },
  { value: 'medicaid', text: 'Medicaid (fee-for-service or managed care)' },
  { value: 'employer', text: 'Employer plan' },
  { value: 'marketplace', text: 'Marketplace or individual plan' },
  { value: 'other', text: 'Other' },
];

const CATEGORIES = {
  patient: { name: 'Patient responsibility', step: 'Bill the patient their share; there is nothing to appeal.', kind: 'none' },
  eligibility: { name: 'Eligibility or coverage', step: 'Verify coverage on the date of service and send the claim to the right payer.', kind: 'rebill' },
  cob: { name: 'Coordination of benefits', step: 'Bill the primary payer first, then this one with the primary\'s remittance (the Coordination of Benefits tool).', kind: 'rebill' },
  auth: { name: 'Authorization or referral', step: 'Ask for a retroactive authorization if the plan allows one; otherwise appeal.', kind: 'appeal' },
  coding: { name: 'Coding or bundling', step: 'Send a corrected claim if the coding was wrong (check the NCCI edit and MUE tools); appeal if it was right.', kind: 'rebill' },
  info: { name: 'Missing or invalid claim information', step: 'Send a corrected or complete claim, with the documentation asked for.', kind: 'rebill' },
  necessity: { name: 'Medical necessity or coverage', step: 'Appeal with the medical records that support the service.', kind: 'appeal' },
  timely: { name: 'Timely filing', step: 'Appeal only with proof the claim was first filed on time (a clearinghouse acceptance report, for example).', kind: 'appeal' },
  duplicate: { name: 'Duplicate', step: 'Check the status of the original claim; do not rebill.', kind: 'none' },
  contract: { name: 'Contractual adjustment', step: 'Write off the difference; check the allowed amount against the contract rate.', kind: 'none' },
};
// Original mapping, CARC number -> category key.
export const CARC_CATEGORY = {
  1: 'patient', 2: 'patient', 3: 'patient',
  4: 'coding', 5: 'coding', 6: 'coding', 11: 'coding', 97: 'coding', 236: 'coding',
  16: 'info', 252: 'info',
  18: 'duplicate',
  22: 'cob', 23: 'cob',
  24: 'eligibility', 26: 'eligibility', 27: 'eligibility', 31: 'eligibility', 109: 'eligibility', 204: 'eligibility',
  29: 'timely',
  45: 'contract',
  50: 'necessity', 151: 'necessity', 167: 'necessity',
  197: 'auth', 198: 'auth', 242: 'auth',
};

const APPEAL = {
  medicare: { days: 120, receipt: 5, rule: 'redetermination within 120 days of receiving the notice, presumed 5 days after its date (42 CFR 405.942)' },
  ma: { days: 60, receipt: 5, rule: 'reconsideration within 60 days of receiving the notice (42 CFR 422.582); a contracted provider follows the plan contract' },
  partd: { days: 60, receipt: 5, rule: 'redetermination within 60 days of receiving the notice (42 CFR 423.582)' },
  employer: { days: 180, receipt: 0, rule: 'at least 180 days after the denial is received (29 CFR 2560.503-1(h)(3)(i)); the plan may allow more' },
  marketplace: { days: 180, receipt: 0, rule: 'at least 180 days after the denial is received (45 CFR 147.136)' },
};

export function denialNextStep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const group = GROUPS.some((g) => g.value === o.group) ? o.group : null;
  if (!group) return { valid: false, message: 'Choose the group code on the remittance (CO, PR, OA or PI).' };
  const code = String(o.carc ?? '').trim().toUpperCase().replace(/^(CO|PR|OA|PI)-?/, '');
  if (!/^\d{1,3}$/.test(code)) return { valid: false, message: 'Enter the claim adjustment reason code as its number (for example, 50).' };
  const payer = PAYERS.some((p) => p.value === o.payer) ? o.payer : null;
  if (!payer) return { valid: false, message: 'Choose the payer type: the deadline depends on it.' };
  const remit = date(o.remitDate);
  if (!remit) return { valid: false, message: 'Enter the remittance date (YYYY-MM-DD).' };
  const key = CARC_CATEGORY[Number(code)];
  const notes = [];
  if (!key) {
    return { valid: true, category: null, band: `No mapping for reason code ${code}: read the remark codes and the payer's notice for what it wants.`, bandLabel: 'No mapping', notes: ['The mapping covers a reviewed set of common reason codes and never guesses at the rest.'], note: 'The payer\'s notice controls.' };
  }
  const cat = CATEGORIES[key];
  let step = cat.step;
  if (group === 'PR' && key !== 'patient') {
    step = 'The payer put this amount on the patient (for example, under a valid advance beneficiary notice or waiver): bill the patient, or dispute the assignment if no valid notice was given.';
  }
  let deadline = null;
  let when = '';
  if (cat.kind === 'appeal' || (group === 'PR' && key !== 'patient')) {
    const a = APPEAL[payer];
    if (a) {
      deadline = addCalendarDaysUtc(remit, a.days + a.receipt);
      when = ` Appeal by ${longDate(deadline)}: ${a.rule}.`;
    } else if (String(o.windowDays ?? '').trim()) {
      const f = inputFault([['the appeal window', o.windowDays, 1, 730, 'days']]);
      if (f) return { valid: false, message: f };
      deadline = addCalendarDaysUtc(remit, Number(o.windowDays));
      when = ` Appeal by ${longDate(deadline)}, ${o.windowDays} days after the remittance, the window entered.`;
    } else {
      when = ' Enter the appeal window from the state rules or the plan contract to get the date.';
      notes.push(payer === 'medicaid' ? 'Medicaid provider appeal windows are set by each state and each managed care contract.' : 'This payer\'s appeal window was not entered.');
    }
  } else if (cat.kind === 'rebill') {
    const dos = date(o.serviceDate);
    if (payer === 'medicare' && dos) {
      deadline = addCalendarDaysUtc(dos, 365);
      when = ` A corrected or new claim is due by ${longDate(deadline)}, 1 calendar year after the date of service (42 CFR 424.44).`;
    } else if (payer === 'medicare') {
      when = ' A corrected or new Medicare claim is due within 1 calendar year of the date of service (42 CFR 424.44); enter the date of service for the date.';
    } else {
      when = ' The corrected claim is due within the payer\'s timely filing limit (the Claim Timely-Filing Deadline tool).';
    }
  }
  return {
    valid: true,
    category: cat.name,
    deadline: deadline ? deadline.toISOString().slice(0, 10) : null,
    band: `${group}-${code}: ${cat.name}. ${step}${when}`,
    bandLabel: cat.name,
    notes,
    note: 'An original mapping of common reason codes to a next step; the remark codes and the payer\'s notice control.',
  };
}
