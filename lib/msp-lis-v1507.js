// spec-v1507 tool 5: Extra Help (Part D low-income subsidy) and Medicare Savings Program screen.
//
// Income is counted the SSI way (Social Security Act 1905(p)(1), 1612; 42 CFR 423.772 "income"): a $20
// general exclusion from unearned income (any rest from earned income), then $65 and half the remaining
// earned income. The limits are percents of the poverty guideline for the household:
//   QMB 100%, SLMB 120%, QI 135% (individual or couple), Extra Help 150% of the guideline for the family
//   size (42 CFR 423.773(a); full subsidy since 2024, 423.773(b)(1)). Each limit is the guideline share
//   rounded up to a whole dollar and tested at-or-below, which reproduces the table SSA publishes (POMS
//   HI 00815.023 prints 2026 as $1,350 / $1,616 / $1,816 for one person: the share plus the $20 exclusion).
//   The statute says "less than" for SLMB, QI and Extra Help; a screen that matched it would turn away
//   someone at exactly the printed limit, so the screen follows the printed table.
// Resources (2026): MSP $9,950 / $14,910 (POMS HI 00815.023, TN 64); Extra Help $16,590 / $33,100, or
// $18,090 / $36,100 with burial funds (CMS memo, October 31, 2025). States may disregard more income or
// resources for the MSPs (1902(r)(2)); the screen applies the federal floor and says so.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { inputFault } from './num.js';
import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';
import { DATED_INCOME, REGIONS } from './income-screens-v1506.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const DATED_MSP_LIS = {
  'msp-lis-resources-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'medicare-msp-lis-resources', source: { label: 'the CMS CY2026 LIS resource memo', url: 'https://www.cms.gov/files/document/cy2026-lis-resource-limits-memo.pdf' },
    values: { msp: [9950, 14910], lis: [16590, 33100], lisBurial: [18090, 36100] } },
};

export { REGIONS };
export const MARITAL = [
  { value: 'single', text: 'Single, or married and not living together' },
  { value: 'married', text: 'Married and living together' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

export function countableIncome(unearned, earned) {
  const general = Math.min(20, unearned);
  const rest = 20 - general;
  const earnedCounted = Math.max(0, earned - rest - 65) / 2;
  return Math.round((unearned - general + earnedCounted) * 100) / 100;
}

export function extraHelpMspScreen(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const marital = MARITAL.some((x) => x.value === o.marital) ? o.marital : null;
  if (!marital) return { valid: false, message: 'Choose single or married and living together: the limits differ.' };
  const region = REGIONS.some((r) => r.value === o.region) ? o.region : null;
  if (!region) return { valid: false, message: 'Choose where the person lives: the 48 states and DC, Alaska, or Hawaii.' };
  const f = inputFault([
    ['the monthly unearned income (Social Security, pensions and the like)', o.unearned, 0, 1e6, 'dollars'],
    ['the countable resources', o.resources, 0, 1e8, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const notes = [];
  let earned = 0;
  if (String(o.earned ?? '').trim()) {
    const ef = inputFault([['the monthly earned income', o.earned, 0, 1e6, 'dollars']]);
    if (ef) return { valid: false, message: ef };
    earned = Number(o.earned);
  } else notes.push('Earned income was not entered, so none is counted.');
  let deps = 0;
  if (String(o.dependents ?? '').trim()) {
    const df = inputFault([['the dependent relatives living in the home', o.dependents, 0, 20, '']]);
    if (df) return { valid: false, message: df };
    deps = Number(o.dependents);
    if (!Number.isInteger(deps)) return { valid: false, message: 'Enter the dependent relatives as a whole number.' };
  }
  const burial = o.burial === 'yes';
  if (o.burial !== 'yes' && o.burial !== 'no') notes.push('Whether some resources are set aside for burial was not entered, so the lower Extra Help resource limit is used.');
  const yr = String(o.year ?? '').trim();
  const year = yr ? Number(yr) : todayUtc(now).getUTCFullYear();
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return { valid: false, message: 'Enter the year as a four-digit year.' };
  if (!yr) notes.push(`A year was not entered, so ${year} is used.`);
  if (!DATED_INCOME[`poverty-guidelines-${year}`] || !DATED_MSP_LIS[`msp-lis-resources-${year}`]) {
    return { valid: false, message: `Enter a year with published limits: the ${year} poverty guidelines or resource limits are not on file.` };
  }
  const at = new Date(Date.UTC(year, 6, 1));
  const [base, per] = datedValue(`poverty-guidelines-${year}`, region, at, DATED_INCOME).value;
  const res = datedValue(`msp-lis-resources-${year}`, 'msp', at, DATED_MSP_LIS).value;
  const lisRes = datedValue(`msp-lis-resources-${year}`, burial ? 'lisBurial' : 'lis', at, DATED_MSP_LIS).value;
  const couple = marital === 'married' ? 1 : 0;
  const mspSize = 1 + couple;
  const lisSize = 1 + couple + deps;
  const line = (size) => base + per * (size - 1);
  const limit = (size, pct) => Math.ceil((line(size) * pct) / 100 / 12);
  const unearned = Number(o.unearned);
  const resources = Number(o.resources);
  const counted = countableIncome(unearned, earned);
  const mspResOk = resources <= res[couple];
  const lisResOk = resources <= lisRes[couple];
  const rows = [
    ['QMB (pays Part A and B premiums and cost sharing)', counted <= limit(mspSize, 100), limit(mspSize, 100), mspResOk, res[couple]],
    ['SLMB (pays the Part B premium)', counted <= limit(mspSize, 120), limit(mspSize, 120), mspResOk, res[couple]],
    ['QI (pays the Part B premium)', counted <= limit(mspSize, 135), limit(mspSize, 135), mspResOk, res[couple]],
  ];
  const msp = rows.find((r) => r[1] && r[3]);
  const lisIncomeOk = counted <= limit(lisSize, 150);
  const lis = Boolean(msp) || (lisIncomeOk && lisResOk);
  const lines = rows.map(([name, inc, lim, rok, rl]) => `${name}: income ${inc ? 'within' : 'above'} ${money(lim)} a month counted (${money(lim + 20)} before the $20 exclusion); resources ${rok ? 'within' : 'above'} ${money(rl)}.`);
  lines.push(`Extra Help: income ${lisIncomeOk ? 'within' : 'above'} ${money(limit(lisSize, 150))} a month counted for a family of ${lisSize}; resources ${lisResOk ? 'within' : 'above'} ${money(lisRes[couple])}${burial ? ' (with burial funds)' : ''}.`);
  notes.unshift(...lines);
  if (msp && !(lisIncomeOk && lisResOk)) notes.push('Anyone who qualifies for a Medicare Savings Program gets Extra Help automatically (42 CFR 423.773(c)).');
  notes.push('States may disregard more income or resources for the Medicare Savings Programs, and some have no resource test; a person above these federal limits may still qualify in their state.');
  const name = msp ? msp[0].split(' (')[0] : null;
  const band = msp
    ? `Likely qualifies for ${name} and, with it, Extra Help: counted income ${money(counted)} a month.`
    : lis
      ? `Likely qualifies for Extra Help but not a Medicare Savings Program on the federal limits: counted income ${money(counted)} a month.`
      : `Above the federal limits for Extra Help and the Medicare Savings Programs: counted income ${money(counted)} a month, resources ${money(resources)}.`;
  return {
    valid: true,
    countedIncome: counted,
    msp: name,
    extraHelp: lis,
    band,
    bandLabel: msp ? `${name} + Extra Help` : lis ? 'Extra Help' : 'Above federal limits',
    notes,
    note: 'This is a screen on federal limits, not a determination; Social Security decides Extra Help and the state Medicaid agency decides the Medicare Savings Programs.',
  };
}
