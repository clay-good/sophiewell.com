// spec-v1604 tool 5: does this direct primary care arrangement keep HSA
// eligibility?
//
// IRC 223(c)(1)(E), added by section 71308 of the 2025 reconciliation act
// (Pub. L. 119-21), and IRS Notice 2026-5, read on September 29, 2026. From
// months beginning after December 31, 2025, a direct primary care service
// arrangement (DPCSA) is not a health plan that ends HSA eligibility when:
//   - its care is primary care services only, by primary care practitioners
//     (physicians in family, internal, geriatric or pediatric medicine; nurse
//     practitioners, clinical nurse specialists, physician assistants);
//   - its sole compensation is a fixed periodic fee (Notice A-11: an
//     arrangement that also bills its members for its services is not one);
//   - it does not include procedures requiring general anesthesia,
//     prescription drugs other than vaccines, or laboratory services not
//     typically administered in an ambulatory primary care setting; and
//   - the aggregate fees for all such arrangements for the month are at most
//     $150, or $300 for an arrangement covering more than one person
//     (indexed after 2026). Fees billed for longer periods count on an
//     annualized basis (A-13: $1,800 a year, $900 for six months).
// Over the limit, the individual cannot contribute to an HSA for the months
// enrolled, but the fees are still HSA-reimbursable qualified medical
// expenses (A-20). Fees an employer pays are not the individual's expense and
// cannot be reimbursed (A-18). An HDHP may not itself pay DPC fees before the
// deductible (A-15).
//
// Pure: no DOM; the limit is a dated constant read through datedValue().

import { datedValue } from './dated-data.js';

const SRC = { label: 'IRS Notice 2026-5', url: 'https://www.irs.gov/pub/irs-drop/n-26-05.pdf' };

// Route B: the statute states the 2026 figures; later years are indexed and
// published by the IRS. A year with no row asks for its limit.
export const DATED_DPC = {
  'dpc-limit-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', source: SRC, values: { one: 150, more: 300 } },
  // Rev. Proc. 2026-24 section 3.01(2), read October 7, 2026: the first indexed year leaves both limits unchanged.
  'dpc-limit-2027': { edition: '2027', validThrough: '2027-12-31', route: 'B', source: { label: 'IRS Rev. Proc. 2026-24', url: 'https://www.irs.gov/pub/irs-drop/rp-26-24.pdf' }, values: { one: 150, more: 300 } },
};

export const COVERS = [
  { value: 'one', text: 'One person' },
  { value: 'more', text: 'More than one person (a family arrangement)' },
];
export const PERIODS = [
  { value: '1', text: 'Month' },
  { value: '3', text: 'Quarter (3 months)' },
  { value: '6', text: 'Six months' },
  { value: '12', text: 'Year' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const PAYERS = [
  { value: 'member', text: 'I pay it' },
  { value: 'employer', text: 'My employer pays it (including through a cafeteria plan)' },
];

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function dpcHsaCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const year = Number(o.year);
  if (!Number.isInteger(year) || year < 2026 || year > 2100) return { valid: false, message: 'Enter the year, 2026 or later (the rule applies to months after December 31, 2025).' };
  const covers = pick(COVERS, o.covers);
  if (!covers) return { valid: false, message: 'Choose whether the arrangement covers one person or more than one.' };
  const period = pick(PERIODS, String(o.period ?? ''));
  if (!period) return { valid: false, message: 'Choose how often the fee is billed.' };
  const feeText = String(o.fee ?? '').trim();
  const fee = Number(feeText);
  if (feeText === '' || !Number.isFinite(fee) || fee < 0 || fee > 1e6) return { valid: false, message: 'Enter the total fee for each billing period, in dollars, for all your direct primary care arrangements together.' };

  let limit;
  let edition;
  const limitText = String(o.limit ?? '').trim();
  if (limitText !== '') {
    limit = Number(limitText);
    if (!Number.isFinite(limit) || limit <= 0 || limit > 10000) return { valid: false, message: 'Enter the monthly limit in dollars, or leave it blank to use the published figure.' };
    edition = `${year}, as entered`;
  } else {
    const id = `dpc-limit-${year}`;
    if (!DATED_DPC[id]) return { valid: false, message: `The ${year} monthly limit is indexed and not published here yet. Enter it from the IRS (it was $150 for one person and $300 for more than one in 2026 and 2027).` };
    const v = datedValue(id, covers, new Date(Date.UTC(year, 6, 1)), DATED_DPC);
    limit = v.expired ? v.lastValue : v.value;
    edition = v.edition;
  }
  const monthly = fee / Number(period);
  const notes = [];
  const note = 'This checks the arrangement as you describe it; the arrangement\'s terms, not the services you use, decide (Notice 2026-5 A-14).';

  const answers = { practitioners: o.practitioners, fixedFee: o.fixedFee, anesthesia: o.anesthesia, drugs: o.drugs, labs: o.labs };
  for (const [k, v] of Object.entries(answers)) if (v !== '' && v != null && !pick(YES_NO, v)) return { valid: false, message: `Answer ${k} with yes or no, or leave it blank.` };
  const failed = [];
  if (o.practitioners === 'no') failed.push('its care is not given only by primary care practitioners');
  if (o.fixedFee === 'no') failed.push('it bills members for its services on top of the fee (A-11)');
  if (o.anesthesia === 'yes') failed.push('it includes procedures that need general anesthesia');
  if (o.drugs === 'yes') failed.push('it includes prescription drugs other than vaccines');
  if (o.labs === 'yes') failed.push('it includes lab services not typical of an office primary care practice');
  const unanswered = [];
  if (!o.practitioners) unanswered.push('whether only primary care practitioners provide the care');
  if (!o.fixedFee) unanswered.push('whether the fee is the only charge for its services');
  if (!o.anesthesia) unanswered.push('whether it includes procedures under general anesthesia');
  if (!o.drugs) unanswered.push('whether it includes prescription drugs other than vaccines');
  if (!o.labs) unanswered.push('whether it includes lab services beyond an office primary care practice');

  if (o.payer === 'employer') notes.push('Fees your employer pays, including through a cafeteria plan, are not your expense and cannot be reimbursed from your HSA (Notice 2026-5 A-18).');
  notes.push('An HDHP may not itself pay direct primary care fees before its deductible (A-15), and fees you pay do not count toward the HDHP deductible (A-16).');
  const feeLine = `${money(monthly)} a month${period !== '1' ? ` (${money(fee)} every ${period} months)` : ''} against the ${edition} limit of ${money(limit)} for ${covers === 'one' ? 'one person' : 'more than one person'}`;

  if (failed.length) {
    return { valid: true, verdict: 'not-dpcsa', band: `Not a direct primary care service arrangement under IRC 223(c)(1)(E): ${failed.join('; ')}. The safe harbor does not apply, so if the arrangement is other health coverage, HSA contributions stop while you are enrolled.`, bandLabel: 'Not in the safe harbor', abnormal: true, notes, note };
  }
  if (monthly > limit + 1e-9) {
    notes.unshift(`The fees are still qualified medical expenses: ${o.payer === 'employer' ? 'had you paid them yourself, they could be reimbursed from an HSA' : 'you can pay them from your HSA'} (Notice 2026-5 A-20).`);
    // Over the limit decides it whatever the terms: an arrangement outside the
    // safe harbor is no better. Unanswered terms are named, not read as yes.
    const terms = unanswered.length ? ` Its terms were not assessed (${unanswered.join('; ')}); over the limit, they do not change this.` : '';
    return { valid: true, verdict: 'over-limit', band: `Over the limit: ${feeLine}. You cannot contribute to an HSA for the months you are enrolled (IRC 223(c)(1)(E)(ii)).${terms}`, bandLabel: 'Contributions stop', abnormal: true, notes, note };
  }
  if (unanswered.length) {
    return { valid: true, verdict: 'not-assessed', band: `The fee is within the limit: ${feeLine}. Whether the arrangement qualifies still depends on ${unanswered.join('; ')}.`, bandLabel: 'Within the limit; terms not assessed', abnormal: false, notes, note };
  }
  if (o.payer !== 'employer') notes.unshift('You can pay the fees from your HSA (IRC 223(d)(2)(C)).');
  return { valid: true, verdict: 'compatible', band: `Compatible: ${feeLine}, and its terms meet IRC 223(c)(1)(E). Enrollment does not end HSA eligibility.`, bandLabel: 'Keeps HSA eligibility', abnormal: false, notes, note };
}
