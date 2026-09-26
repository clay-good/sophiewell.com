// spec-v1506 tools 1 and 2: a Part D drug's cost through the year, and the Medicare Prescription Payment
// Plan monthly bill.
//
// Read on 2026-09-26:
//   Medicare.gov, "Part D costs": no plan may have a deductible above $615 in 2026 ($700 in 2027); after the
//     deductible the enrollee pays 25% coinsurance until out-of-pocket spending reaches $2,100 in 2026
//     ($2,400 in 2027), then $0 in the catastrophic stage.
//   42 CFR 423.137(c)(1): the first month's cap is "the annual out-of-pocket threshold ... minus the
//     incurred costs of the enrollee ... divided by the number of months remaining in the plan year",
//     billing "the lesser of the participant's actual out-of-pocket costs or the first month's maximum
//     monthly cap"; later months, the unbilled balance plus new costs, over the months remaining (the
//     rule's own example: $2,000 in January billed $166.67). (e)(1)(i): likely to benefit at $600 or more
//     for a single drug, or $2,000 in the first nine months of the prior year. (f)(9): the election
//     renews automatically.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const r2 = (x) => Math.round(x * 100) / 100;

export const DATED_PARTD = {
  'partd-standard-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'medicare-partd-base-premium', source: { label: 'Medicare.gov', url: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs' }, values: { deductible: 615, threshold: 2100, coinsurance: 25 } },
  'partd-standard-2027': { edition: '2027', validThrough: '2027-12-31', route: 'B', ledgerId: 'medicare-partd-base-premium', source: { label: 'Medicare.gov', url: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs' }, values: { deductible: 700, threshold: 2400, coinsurance: 25 } },
};
function params(o, now) {
  const yr = String(o.year ?? '').trim();
  const year = yr ? Number(yr) : todayUtc(now).getUTCFullYear();
  if (!Number.isInteger(year) || year < 2006 || year > 2100) return { error: 'Enter the plan year as a four-digit year.' };
  const id = `partd-standard-${year}`;
  if (!DATED_PARTD[id]) return { error: `Enter the ${year} out-of-pocket threshold: none for ${year} is on file.` };
  return { year, entered: Boolean(yr), p: datedValue(id, 'threshold', new Date(Date.UTC(year, 6, 1)), DATED_PARTD) && DATED_PARTD[id].values };
}

export function partdYearCost(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the drug\'s monthly cost (the plan\'s price)', o.monthlyCost, null, 1e6, 'dollars'], ['the first month filled', o.startMonth, 1, 12, '']]);
  if (f) return { valid: false, message: f };
  const pr = params(o, now);
  if (pr.error) return { valid: false, message: pr.error };
  const { year, p } = pr;
  const notes = pr.entered ? [] : [`A plan year was not entered, so ${year} is used.`];
  let ded = p.deductible;
  if (String(o.deductible ?? '').trim()) {
    const df = inputFault([['the plan deductible', o.deductible, 0, p.deductible, 'dollars']]);
    if (df) return { valid: false, message: df.replace(/between 0 and [\d.]+/, `between 0 and ${p.deductible} (the ${year} maximum)`) };
    ded = Number(o.deductible);
  } else notes.push(`The plan deductible was not entered, so the ${year} maximum (${money(p.deductible)}) is used; many plans have less.`);
  const cost = Number(o.monthlyCost);
  const start = Number(o.startMonth);
  if (!Number.isInteger(start)) return { valid: false, message: 'Enter the first month filled as a number from 1 to 12.' };
  let dedLeft = ded;
  let oop = 0;
  let capMonth = null;
  const rows = [];
  for (let m = start; m <= 12; m += 1) {
    let pay = 0;
    let rest = cost;
    if (oop < p.threshold) {
      const d = Math.min(dedLeft, rest);
      pay += d; dedLeft -= d; rest -= d;
      pay += rest * p.coinsurance / 100;
      pay = Math.min(pay, p.threshold - oop);
    }
    pay = r2(pay);
    oop = r2(oop + pay);
    if (capMonth === null && oop >= p.threshold) capMonth = m;
    rows.push(`${MONTHS[m - 1]} ${money(pay)}`);
  }
  notes.push(`By month: ${rows.join('; ')}.`);
  notes.push('This models the standard benefit: the deductible, then 25% coinsurance, then $0 once out-of-pocket costs reach the threshold. Plans that use copays instead will differ; covered insulin is capped at $35 a month and recommended vaccines cost $0.');
  return {
    valid: true,
    annual: oop,
    capMonth,
    band: capMonth
      ? `${money(oop)} for the year: the ${year} out-of-pocket cap of ${money(p.threshold)} is reached in ${MONTHS[capMonth - 1]}, and later fills cost $0.`
      : `${money(oop)} for the year, below the ${year} out-of-pocket cap of ${money(p.threshold)}.`,
    bandLabel: `${money(oop)} a year`,
    notes,
    note: 'This is the standard benefit\'s arithmetic, not the plan\'s price; the plan\'s coverage and Plan Finder price control.',
  };
}

export function m3pMonthlyBill(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the month of opting in', o.optInMonth, 1, 12, ''], ['the out-of-pocket costs already paid this year (0 if none)', o.priorOop, 0, 1e6, 'dollars'], ['the out-of-pocket cost each month from opting in', o.monthlyOop, 0, 1e6, 'dollars']]);
  if (f) return { valid: false, message: f };
  const pr = params(o, now);
  if (pr.error) return { valid: false, message: pr.error };
  const { year, p } = pr;
  const start = Number(o.optInMonth);
  if (!Number.isInteger(start)) return { valid: false, message: 'Enter the month of opting in as a number from 1 to 12.' };
  let incurred = Number(o.priorOop);
  if (incurred >= p.threshold) return { valid: true, band: `The ${year} out-of-pocket cap of ${money(p.threshold)} is already reached, so further Part D costs are $0 and the payment plan has nothing to spread.`, bandLabel: 'Cap already reached', notes: [], note: 'This is the rule\'s arithmetic, not the plan\'s bill.' };
  const monthly = Number(o.monthlyOop);
  const extra = String(o.firstMonthExtra ?? '').trim() ? Number(o.firstMonthExtra) : 0;
  if (!Number.isFinite(extra) || extra < 0) return { valid: false, message: 'Enter the first month\'s extra cost in dollars, 0 or more, or leave it blank.' };
  const notes = pr.entered ? [] : [`A plan year was not entered, so ${year} is used.`];
  let unbilled = 0;
  let billed = 0;
  const rows = [];
  for (let m = start; m <= 12; m += 1) {
    const left = 13 - m;
    let cost = monthly + (m === start ? extra : 0);
    cost = Math.min(cost, Math.max(0, p.threshold - incurred));
    incurred += cost;
    let bill;
    if (m === start) {
      const cap = (p.threshold - Number(o.priorOop)) / left;
      bill = r2(Math.min(cost, cap));
    } else {
      bill = r2((unbilled + cost) / left);
    }
    // Carried in cents, so the last month settles the balance exactly (months left is then 1).
    unbilled = r2(unbilled + cost - bill);
    billed = r2(billed + bill);
    rows.push(`${MONTHS[m - 1]} ${money(bill)}`);
  }
  const atCounter = r2(incurred - Number(o.priorOop));
  notes.push(`Monthly bills: ${rows.join('; ')}.`);
  notes.push(`Paying at the pharmacy instead would total the same ${money(atCounter)}; the plan spreads the cost, it does not reduce it.`);
  notes.push('Plans must reach out to people likely to benefit: $600 or more for one drug, or $2,000 in the first nine months of the prior year. From 2026 the election renews automatically each year (42 CFR 423.137(e), (f)(9)).');
  return {
    valid: true,
    firstBill: Number(rows[0].split('$')[1].replace(/,/g, '')),
    total: billed,
    band: `First bill ${rows[0].replace(/^\w+ /, '')} in ${MONTHS[start - 1]}; ${money(billed)} billed through December for ${money(atCounter)} of costs (42 CFR 423.137(c)).`,
    bandLabel: `First bill ${rows[0].replace(/^\w+ /, '')}`,
    notes,
    note: 'This is the rule\'s arithmetic, not the plan\'s bill; the plan\'s statement controls.',
  };
}
