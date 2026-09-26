// spec-v1506 tool 3: copay card, accumulator and maximizer impact, fill by fill.
//
// Whether a commercial plan counts manufacturer copay assistance toward the deductible and out-of-pocket
// maximum depends on the plan and on state law. A federal court vacated the 2021 rule that let plans
// exclude it (HIV and Hepatitis Policy Institute v. HHS, D.D.C., September 29, 2023), reviving the 2020
// rule, while the eCFR still prints the vacated text; the tool does not decide which applies. It runs the year both ways
// when the reader does not know. Manufacturer copay cards cannot be used with Medicare or Medicaid, so
// those plan types are refused with that reason.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const r2 = (x) => Math.round(x * 100) / 100;
export const PLAN_TYPES = [
  { value: 'commercial', text: 'Commercial or employer plan' },
  { value: 'federal', text: 'Medicare or Medicaid' },
];
export const COUNTS = [
  { value: 'yes', text: 'Yes: the card counts toward the deductible and out-of-pocket maximum' },
  { value: 'no', text: 'No: an accumulator (the card does not count)' },
  { value: 'unknown', text: 'Not known: show both' },
];

function runYear(p, counts) {
  let accrued = 0;
  let card = p.cardMax;
  let total = 0;
  let firstBill = null;
  const fills = [];
  for (let i = 1; i <= p.fills; i += 1) {
    const dedPart = Math.max(0, Math.min(p.cost, p.deductible - accrued));
    let share = dedPart + (p.cost - dedPart) * p.coins / 100;
    share = r2(Math.max(0, Math.min(share, p.oopMax - accrued)));
    let cardPays = Math.min(share, card, p.perFill ?? Infinity);
    cardPays = r2(Math.max(0, cardPays));
    card = r2(card - cardPays);
    const patient = r2(share - cardPays);
    total = r2(total + patient);
    accrued = r2(accrued + (counts ? share : patient));
    if (firstBill === null && patient > 0) firstBill = { fill: i, amount: patient };
    fills.push(patient);
  }
  return { total, firstBill, cardLeft: card, fills };
}

export function copayCardRunout(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pt = PLAN_TYPES.some((x) => x.value === o.planType) ? o.planType : null;
  if (!pt) return { valid: false, message: 'Choose the plan type.' };
  if (pt === 'federal') return { valid: false, message: 'Choose a commercial plan: manufacturer copay cards cannot be used with Medicare or Medicaid, so there is nothing to model.' };
  const f = inputFault([
    ['the cost of each fill', o.costPerFill, null, 1e7, 'dollars'],
    ['the fills a year', o.fills, 1, 52, ''],
    ['the copay card\'s annual maximum', o.cardMax, 0, 1e7, 'dollars'],
    ['the plan deductible', o.deductible, 0, 1e6, 'dollars'],
    ['the plan coinsurance', o.coinsurance, 0, 100, 'percent'],
    ['the plan out-of-pocket maximum', o.oopMax, 0, 1e6, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const counts = COUNTS.some((x) => x.value === o.counts) ? o.counts : null;
  if (!counts) return { valid: false, message: 'Choose whether the plan counts the card toward the deductible and out-of-pocket maximum (or "Not known").' };
  const p = { cost: Number(o.costPerFill), fills: Number(o.fills), cardMax: Number(o.cardMax), deductible: Number(o.deductible), coins: Number(o.coinsurance), oopMax: Number(o.oopMax), perFill: null };
  if (!Number.isInteger(p.fills)) return { valid: false, message: 'Enter the fills a year as a whole number.' };
  if (String(o.perFillMax ?? '').trim()) {
    const pf = inputFault([['the card\'s per-fill maximum', o.perFillMax, 0, 1e7, 'dollars']]);
    if (pf) return { valid: false, message: pf };
    p.perFill = Number(o.perFillMax);
  }
  const yes = runYear(p, true);
  const no = runYear(p, false);
  const say = (r) => (r.firstBill ? `the first bill is ${money(r.firstBill.amount)} at fill ${r.firstBill.fill}, and the patient pays ${money(r.total)} for the year` : `the card covers every fill, and the patient pays ${money(r.total)} for the year`);
  const used = (r) => money(p.cardMax - r.cardLeft);
  const notes = [counts === 'unknown'
    ? `The card pays ${used(yes)} of its ${money(p.cardMax)} if it counts, and ${used(no)} with an accumulator.`
    : `The card pays ${used(counts === 'yes' ? yes : no)} of its ${money(p.cardMax)} over the year.`, 'A plan that counts the card lets it satisfy the deductible and out-of-pocket maximum; an accumulator does not, so once the card runs out the patient still owes the full deductible and coinsurance.'];
  let band;
  let label;
  if (counts === 'yes') { band = `If the card counts: ${say(yes)}.`; label = `${money(yes.total)} a year`; }
  else if (counts === 'no') { band = `With an accumulator: ${say(no)}.`; label = `${money(no.total)} a year`; }
  else {
    band = `If the card counts, ${say(yes)}. With an accumulator, ${say(no)}.`;
    label = `${money(yes.total)} or ${money(no.total)}`;
  }
  notes.push('A maximizer program, which spreads the card evenly over the year, is not modeled.');
  if (counts === 'unknown') notes.push('Whether the plan counts the card depends on the plan and state law; the plan\'s summary of benefits or member services can say which.');
  return { valid: true, yearCounts: yes.total, yearAccumulator: no.total, band, bandLabel: label, notes, note: 'This is arithmetic on the plan and card terms entered, not a coverage decision; the plan and the card program control.' };
}
