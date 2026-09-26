// spec-v1506 tools 5 and 8: income as a percent of the poverty guidelines, and Medicare IRMAA.
//
// Poverty guidelines, read from the ASPE poverty-guidelines API on 2026-09-26 (the refresh job's feed;
// every region is a base amount plus a fixed amount per additional person, checked at sizes 1, 2, 8, 9):
//   2025: 48 states and DC $15,650 + $5,500; Alaska $19,550 + $6,880; Hawaii $17,990 + $6,330.
//   2026: 48 states and DC $15,960 + $5,680; Alaska $19,950 + $7,100; Hawaii $18,360 + $6,530.
// 26 CFR 1.36B-1(h): for the premium tax credit, the guidelines "most recently published ... as of the
// first day of the regular enrollment period" -- so 2026 coverage uses the 2025 guidelines. Medicaid and
// most assistance programs use the current year's.
//
// IRMAA, CMS fact sheet "2026 Medicare Parts A & B Premiums and Deductibles" (read 2026-09-26): Part B
// and Part D adjustments by modified adjusted gross income, with the married-filing-separately rows. SSA
// uses the tax return from two years earlier (2024 income for 2026) and may use a more recent year after
// a life-changing event (SSA, "Premiums: Rules for Higher-Income Beneficiaries").
//
// Pure: no DOM, no clock (the caller passes `now`).

import { inputFault } from './num.js';
import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const whole = (x) => `$${Math.round(x).toLocaleString('en-US')}`;

export const DATED_INCOME = {
  'poverty-guidelines-2025': { edition: '2025', validThrough: '2025-12-31', route: 'B', ledgerId: 'aspe-poverty-guidelines', source: { label: 'the ASPE poverty guidelines', url: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines' }, values: { us: [15650, 5500], ak: [19550, 6880], hi: [17990, 6330] } },
  'poverty-guidelines-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'aspe-poverty-guidelines', source: { label: 'the ASPE poverty guidelines', url: 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines' }, values: { us: [15960, 5680], ak: [19950, 7100], hi: [18360, 6530] } },
  'irmaa-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'billing-medicare-cost-share', source: { label: 'the CMS 2026 Parts A and B fact sheet', url: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles' },
    values: {
      single: [[109000, 0, 0], [137000, 81.2, 14.5], [171000, 202.9, 37.5], [205000, 324.6, 60.4], [499999.99, 446.3, 83.3], [Infinity, 487, 91]],
      joint: [[218000, 0, 0], [274000, 81.2, 14.5], [342000, 202.9, 37.5], [410000, 324.6, 60.4], [749999.99, 446.3, 83.3], [Infinity, 487, 91]],
      mfs: [[109000, 0, 0], [390999.99, 446.3, 83.3], [Infinity, 487, 91]],
      partB: 202.9,
    } },
};

export const REGIONS = [
  { value: 'us', text: 'The 48 contiguous states and DC' },
  { value: 'ak', text: 'Alaska' },
  { value: 'hi', text: 'Hawaii' },
];
export const PROGRAMS = [
  { value: 'current', text: 'Medicaid, CHIP and most programs (this year\'s guidelines)' },
  { value: 'ptc', text: 'Marketplace premium tax credit (the prior year\'s guidelines)' },
];
export const PERIODS = [{ value: 'annual', text: 'Annual' }, { value: 'monthly', text: 'Monthly' }];

export function fplPercent(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the household size', o.size, 1, 30, 'people'], ['the income', o.income, 0, 1e8, 'dollars']]);
  if (f) return { valid: false, message: f };
  const size = Number(o.size);
  if (!Number.isInteger(size)) return { valid: false, message: 'Enter the household size as a whole number.' };
  const region = REGIONS.some((r) => r.value === o.region) ? o.region : null;
  if (!region) return { valid: false, message: 'Choose where the household lives: the 48 states and DC, Alaska, or Hawaii.' };
  const program = PROGRAMS.some((p) => p.value === o.program) ? o.program : null;
  if (!program) return { valid: false, message: 'Choose which program the percentage is for: the guideline year depends on it.' };
  const period = o.period === 'monthly' ? 'monthly' : 'annual';
  const notes = [];
  if (o.period !== 'annual' && o.period !== 'monthly') notes.push('The income period was not entered, so the income is taken as annual.');
  const yr = String(o.year ?? '').trim();
  const covYear = yr ? Number(yr) : todayUtc(now).getUTCFullYear();
  if (!Number.isInteger(covYear) || covYear < 2000 || covYear > 2100) return { valid: false, message: 'Enter the year as a four-digit year.' };
  if (!yr) notes.push(`A year was not entered, so ${covYear} is used.`);
  const gYear = program === 'ptc' ? covYear - 1 : covYear;
  const id = `poverty-guidelines-${gYear}`;
  if (!DATED_INCOME[id]) return { valid: false, message: `Enter the ${gYear} poverty guidelines: no published table for ${gYear} is on file.` };
  const [base, per] = datedValue(id, region, new Date(Date.UTC(gYear, 6, 1)), DATED_INCOME).value;
  const guideline = base + per * (size - 1);
  const annual = period === 'monthly' ? Number(o.income) * 12 : Number(o.income);
  const pct = Math.round((annual / guideline) * 1000) / 10;
  if (program === 'ptc') notes.push(`For the premium tax credit, ${covYear} coverage uses the ${gYear} guidelines, the ones published by the start of open enrollment (26 CFR 1.36B-1(h)).`);
  let label = `${pct}% of the poverty line`;
  if (String(o.threshold ?? '').trim()) {
    const tf = inputFault([['the program limit', o.threshold, 1, 2000, 'percent']]);
    if (tf) return { valid: false, message: tf };
    const lim = Number(o.threshold);
    const ok = pct <= lim;
    notes.push(`${ok ? 'Within' : 'Above'} the ${lim}% limit entered (${whole(guideline * lim / 100)} a year for this household).`);
    label = `${pct}%, ${ok ? 'within' : 'above'} ${lim}%`;
  }
  notes.push('Programs count income in their own ways (MAGI for Medicaid and the Marketplace, gross income for some others); the percentage is only as right as the income entered.');
  return {
    valid: true,
    percent: pct,
    guideline,
    band: `${pct}% of the poverty line: ${whole(annual)} a year for a household of ${size}, against the ${gYear} guideline of ${whole(guideline)} (${REGIONS.find((r) => r.value === region).text.replace(/^The /, 'the ')}).`,
    bandLabel: label,
    notes,
    note: 'This is the arithmetic of the federal poverty guidelines, not an eligibility decision. The program decides.',
  };
}

export const FILING = [
  { value: 'single', text: 'Single, head of household, or qualifying surviving spouse' },
  { value: 'joint', text: 'Married filing jointly' },
  { value: 'mfs', text: 'Married filing separately (lived with spouse during the year)' },
];

export function irmaa(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const st = FILING.some((x) => x.value === o.filing) ? o.filing : null;
  if (!st) return { valid: false, message: 'Choose the tax filing status.' };
  const f = inputFault([['the modified adjusted gross income', o.magi, 0, 1e9, 'dollars']]);
  if (f) return { valid: false, message: f };
  const magi = Number(o.magi);
  const yr = String(o.year ?? '').trim();
  const year = yr ? Number(yr) : todayUtc(now).getUTCFullYear();
  if (!Number.isInteger(year) || year < 2007 || year > 2100) return { valid: false, message: 'Enter the premium year as a four-digit year.' };
  const notes = yr ? [] : [`A premium year was not entered, so ${year} is used.`];
  const id = `irmaa-${year}`;
  if (!DATED_INCOME[id]) return { valid: false, message: `Enter the ${year} brackets from the CMS fact sheet: none for ${year} is on file yet (they are usually published in November).` };
  const v = datedValue(id, st, new Date(Date.UTC(year, 6, 1)), DATED_INCOME).value;
  const partB = DATED_INCOME[id].values.partB;
  const row = v.find(([top]) => magi <= top);
  const [, b, d] = row;
  notes.push(`SSA uses the tax return from two years earlier (${year - 2} income for ${year}).`);
  notes.push('After a life-changing event -- marriage, divorce or a spouse\'s death; stopping or reducing work; losing income-producing property or a pension; or an employer settlement -- SSA can be asked (form SSA-44) to use a more recent year.');
  return {
    valid: true,
    partBAdjustment: b,
    partDAdjustment: d,
    band: b || d
      ? `IRMAA in ${year}: ${money(b)} a month added to Part B (${money(partB + b)} in all) and ${money(d)} added to the Part D premium.`
      : `No IRMAA in ${year}: an income of ${whole(magi)} is at or below the first bracket, so the standard Part B premium (${money(partB)}) applies.`,
    bandLabel: b || d ? `+${money(b)} B, +${money(d)} D` : 'No IRMAA',
    notes,
    note: 'This is the arithmetic of the published brackets, not a Social Security determination; the notice from Social Security controls.',
  };
}
