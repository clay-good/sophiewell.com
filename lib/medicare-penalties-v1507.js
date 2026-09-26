// spec-v1507 tools 2 and 3: the Medicare Part B and Part D late enrollment penalties.
//
// Read on 2026-09-26:
//   42 CFR 408.22: the Part B standard premium "is increased by ten percent for each full twelve
//     months" of late enrollment (the months counted under 408.24 and 408.25).
//   CMS fact sheet "2026 Medicare Parts A & B Premiums and Deductibles": the 2026 standard Part B
//     premium is $202.90.
//   42 CFR 423.46(a): the Part D penalty applies to "a continuous period of 63 days or longer" after the
//     initial enrollment period without Part D or creditable coverage; 423.286(d)(3): 1 percent of the
//     base beneficiary premium for each uncovered month.
//   Medicare.gov, "Part D costs": 1% of the national base beneficiary premium ($38.99 in 2026) times
//     the full uncovered months, "rounded to the nearest $.10". CMS, July 28, 2026: the 2027 base
//     beneficiary premium is $41.33.
//
// Pure: no DOM (the caller passes `now`).

import { inputFault } from './num.js';
import { parseIsoStrict } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';
import { longDate } from './partd-appeals-v1503.js';

export const DATED_PREMIUMS = {
  'partb-premium-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'billing-medicare-cost-share', source: { label: 'the CMS 2026 Parts A and B fact sheet', url: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles' }, values: { premium: 202.9 } },
  'partd-base-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'medicare-partd-base-premium', source: { label: 'Medicare.gov', url: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs' }, values: { base: 38.99 } },
  'partd-base-2027': { edition: '2027', validThrough: '2027-12-31', route: 'B', ledgerId: 'medicare-partd-base-premium', source: { label: 'the CMS 2027 Part D bid announcement', url: 'https://www.cms.gov/newsroom/fact-sheets/medicare-part-d-2027-national-average-monthly-bid-amount-information' }, values: { base: 41.33 } },
};
const money = (x) => `$${x.toFixed(2)}`;

// A year's figure: the published one for that year (it never goes stale for that year), else the
// reader's. A year with no published figure asks, so a new year fails closed.
function figure(prefix, key, year, override, label) {
  const raw = String(override ?? '').trim();
  if (raw) {
    const f = inputFault([[label, raw, null, 10000, 'dollars']]);
    return f ? { error: f } : { value: Number(raw), from: 'the amount entered' };
  }
  const id = `${prefix}-${year}`;
  if (!DATED_PREMIUMS[id]) return { error: `Enter the ${year} ${label}: no published figure for ${year} is on file.` };
  const v = datedValue(id, key, new Date(Date.UTC(year, 6, 1)), DATED_PREMIUMS);
  if (v.expired) return { error: `The ${v.edition} ${label} was ${money(v.lastValue)}. Enter the current figure from ${v.source.label}.` };
  return { value: v.value, from: `the ${v.edition} figure from ${v.source.label}` };
}

export function partbLatePenalty(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the months late (not counting months covered by a special enrollment period)', o.monthsLate, 0, 1200, '']]);
  if (f) return { valid: false, message: f };
  const months = Number(o.monthsLate);
  if (!Number.isInteger(months)) return { valid: false, message: 'Enter the months late as a whole number.' };
  const yr = String(o.year ?? '').trim();
  const year = yr ? Number(yr) : todayUtc(now).getUTCFullYear();
  if (!Number.isInteger(year) || year < 1966 || year > 2100) return { valid: false, message: 'Enter the premium year as a four-digit year.' };
  const yearNote = yr ? [] : [`A premium year was not entered, so this year's (${year}) figure is used.`];
  const p = figure('partb-premium', 'premium', year, o.premium, 'standard Part B premium');
  if (p.error) return { valid: false, message: p.error };
  const periods = Math.floor(months / 12);
  const pct = 10 * periods;
  const add = Math.round(p.value * pct) / 100;
  return {
    valid: true,
    percent: pct,
    monthlyPenalty: add,
    band: pct
      ? `Part B late penalty ${pct}% (${periods} full 12-month period${periods === 1 ? '' : 's'} in ${months} months late): ${money(add)} a month on a ${money(p.value)} premium, ${money(p.value + add)} in all.`
      : `No Part B late penalty: ${months} month${months === 1 ? '' : 's'} late is less than a full 12 months.`,
    bandLabel: pct ? `${pct}% penalty` : 'No penalty',
    notes: [
      ...yearNote,
      `Premium used: ${money(p.value)}, ${p.from}.`,
      'The penalty lasts for as long as the person has Part B, and it grows with the premium each year.',
      'Months in a special enrollment period (for example, while covered by a current employer\'s plan) are not counted as late.',
    ],
    note: 'This is the rule\'s arithmetic (42 CFR 408.22), not a Social Security decision; the notice from Social Security controls.',
  };
}

const GAPS = [1, 2, 3];
// Full calendar months lying wholly inside [a, b].
function fullMonths(a, b) {
  let n = 0;
  let m = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + (a.getUTCDate() === 1 ? 0 : 1), 1));
  for (;;) {
    const last = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0));
    if (last > b) break;
    n += 1;
    m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
  }
  return n;
}

export function partdLatePenalty(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const gaps = [];
  for (const g of GAPS) {
    const s = String(o[`gap${g}Start`] ?? '').trim();
    const e = String(o[`gap${g}End`] ?? '').trim();
    if (!s && !e) continue;
    if (!s || !e) return { valid: false, message: `Enter both the first and the last day of gap ${g} without coverage.` };
    let a;
    let b;
    try { a = parseIsoStrict(s); b = parseIsoStrict(e); } catch { return { valid: false, message: `Enter gap ${g}'s dates as YYYY-MM-DD.` }; }
    if (b < a) return { valid: false, message: `Enter gap ${g} again: its last day is before its first.` };
    const days = Math.round((b - a) / 86400000) + 1;
    gaps.push({ g, a, b, days, counts: days >= 63, months: days >= 63 ? fullMonths(a, b) : 0 });
  }
  if (!gaps.length) return { valid: false, message: 'Enter the first and last day of at least one period without Part D or creditable drug coverage after the initial enrollment period.' };
  const y = String(o.year ?? '').trim();
  const year = y ? Number(y) : todayUtc(now).getUTCFullYear();
  if (!Number.isInteger(year) || year < 2006 || year > 2100) return { valid: false, message: 'Enter the premium year as a four-digit year.' };
  const b = figure('partd-base', 'base', year, o.base, 'national base beneficiary premium');
  if (b.error) return { valid: false, message: b.error };
  const months = gaps.reduce((s, x) => s + x.months, 0);
  const yearNote = y ? [] : [`A premium year was not entered, so this year's (${year}) base premium is used.`];
  const raw = 0.01 * b.value * months;
  const pen = Math.round(raw * 10) / 10;
  const notes = [...yearNote, ...gaps.map((x) => `Gap ${x.g}, ${longDate(x.a)} to ${longDate(x.b)}: ${x.days} days, ${x.counts ? `counts; ${x.months} full month${x.months === 1 ? '' : 's'} uncovered` : 'shorter than 63 days, so it does not count'}.`)];
  notes.push(`Base premium: ${money(b.value)}, ${b.from}. The penalty is recomputed each year from that year's base premium and lasts as long as the person has Part D.`);
  notes.push('Leave out months with creditable drug coverage (coverage the plan says is at least as good as Part D, for example from an employer, TRICARE or the VA); people with Extra Help do not pay the penalty (42 CFR 423.46(a), 423.780(e)).');
  return {
    valid: true,
    uncoveredMonths: months,
    monthlyPenalty: pen,
    band: months
      ? `Part D late penalty ${money(pen)} a month in ${year}: 1% of the ${money(b.value)} base premium × ${months} uncovered month${months === 1 ? '' : 's'} = ${money(raw)}, rounded to the nearest 10 cents.`
      : 'No Part D late penalty: no gap of 63 days or more contains a full uncovered month.',
    bandLabel: months ? `${money(pen)} a month` : 'No penalty',
    notes,
    note: 'This is the rule\'s arithmetic (42 CFR 423.46, 423.286(d)(3)), not a plan or CMS decision; the plan\'s notice controls.',
  };
}
