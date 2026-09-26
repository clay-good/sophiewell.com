// spec-v1506 tools 6 and 7: the Marketplace premium tax credit, and whether an employer's offer is
// affordable.
//
// Read on 2026-09-26:
//   Rev. Proc. 2025-25 (2026) and Rev. Proc. 2026-26 (2027), the applicable percentage tables:
//     2026: under 133% 2.10; 133-150% 3.14 to 4.19; 150-200% 4.19 to 6.60; 200-250% 6.60 to 8.44;
//           250-300% 8.44 to 9.96; 300-400% 9.96. Required contribution percentage 9.96%.
//     2027: under 133% 2.15; 133-150% 3.23 to 4.30; 150-200% 4.30 to 6.78; 200-250% 6.78 to 8.66;
//           250-300% 8.66 to 10.22; 300-400% 10.22. Required contribution percentage 10.22%.
//   26 CFR 1.36B-2(b)(1): the credit is for household income "at least 100 percent but not more than
//     400 percent" of the poverty line. 1.36B-3(g)(1): within a band the applicable percentage "increases
//     on a sliding scale in a linear manner and is rounded to the nearest one-hundredth of one percent".
//     1.36B-1(h): the poverty line is the prior year's guidelines for coverage in a year.
//   26 CFR 1.36B-2(c)(3)(v)(A): employer coverage is affordable for the employee if the self-only
//     contribution, and for a related individual if the FAMILY contribution, does not exceed the
//     required contribution percentage of household income.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { todayUtc } from './pa/date.js';
import { datedValue } from './dated-data.js';
import { DATED_INCOME, REGIONS } from './income-screens-v1506.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const whole = (x) => `$${Math.round(x).toLocaleString('en-US')}`;

export const DATED_PTC = {
  'ptc-table-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'irs-36b-applicable-percentage', source: { label: 'Rev. Proc. 2025-25', url: 'https://www.irs.gov/pub/irs-drop/rp-25-25.pdf' },
    values: { bands: [[0, 133, 2.10, 2.10], [133, 150, 3.14, 4.19], [150, 200, 4.19, 6.60], [200, 250, 6.60, 8.44], [250, 300, 8.44, 9.96], [300, 400, 9.96, 9.96]], required: 9.96 } },
  'ptc-table-2027': { edition: '2027', validThrough: '2027-12-31', route: 'B', ledgerId: 'irs-36b-applicable-percentage', source: { label: 'Rev. Proc. 2026-26', url: 'https://www.irs.gov/pub/irs-drop/rp-26-26.pdf' },
    values: { bands: [[0, 133, 2.15, 2.15], [133, 150, 3.23, 4.30], [150, 200, 4.30, 6.78], [200, 250, 6.78, 8.66], [250, 300, 8.66, 10.22], [300, 400, 10.22, 10.22]], required: 10.22 } },
};

function table(year) {
  const id = `ptc-table-${year}`;
  if (!DATED_PTC[id]) return null;
  return datedValue(id, 'bands', new Date(Date.UTC(year, 6, 1)), DATED_PTC);
}
const yearOf = (o, now) => {
  const yr = String(o.year ?? '').trim();
  return { year: yr ? Number(yr) : todayUtc(now).getUTCFullYear(), entered: Boolean(yr) };
};

export function applicablePercentage(fplPct, bands) {
  const band = bands.find(([lo, hi], i) => fplPct >= lo && (fplPct < hi || (i === bands.length - 1 && fplPct <= hi)));
  if (!band) return null;
  const [lo, hi, a, b] = band;
  return Math.round((a + (b - a) * ((fplPct - lo) / (hi - lo))) * 100) / 100;
}

export function premiumTaxCredit(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the household income (MAGI)', o.magi, 0, 1e8, 'dollars'],
    ['the household size', o.size, 1, 30, 'people'],
    ['the benchmark (second-lowest-cost silver) premium', o.benchmark, 0, 100000, 'dollars a month'],
  ]);
  if (f) return { valid: false, message: f };
  const region = REGIONS.some((r) => r.value === o.region) ? o.region : null;
  if (!region) return { valid: false, message: 'Choose where the household lives: the 48 states and DC, Alaska, or Hawaii.' };
  const { year, entered } = yearOf(o, now);
  if (!Number.isInteger(year) || year < 2014 || year > 2100) return { valid: false, message: 'Enter the coverage year as a four-digit year.' };
  const t = table(year);
  if (!t) return { valid: false, message: `Enter the ${year} applicable percentages from the IRS revenue procedure: none for ${year} is on file.` };
  const gid = `poverty-guidelines-${year - 1}`;
  if (!DATED_INCOME[gid]) return { valid: false, message: `Enter the ${year - 1} poverty guidelines: none is on file.` };
  const [base, per] = DATED_INCOME[gid].values[region];
  const size = Number(o.size);
  if (!Number.isInteger(size)) return { valid: false, message: 'Enter the household size as a whole number.' };
  const guideline = base + per * (size - 1);
  const magi = Number(o.magi);
  const pct = Math.round((magi / guideline) * 10000) / 100;
  const notes = entered ? [] : [`A coverage year was not entered, so ${year} is used.`];
  notes.push(`Household income is ${pct}% of the ${year - 1} poverty guideline (${whole(guideline)} for ${size}), the guidelines used for ${year} coverage (26 CFR 1.36B-1(h)).`);
  const bench = Number(o.benchmark);
  if (pct < 100) {
    return { valid: true, credit: 0, band: `Generally no premium tax credit: income is ${pct}% of the poverty line, below the 100% floor (26 CFR 1.36B-2(b)(1)).`, bandLabel: 'Below 100%', notes: [...notes, 'Some lawfully present immigrants below 100% can still qualify; the Marketplace decides.'], note: 'This is an estimate from the IRS tables, not the Marketplace\'s determination.' };
  }
  if (pct > 400) {
    return { valid: true, credit: 0, band: `No premium tax credit in ${year}: income is ${pct}% of the poverty line, above 400% (26 CFR 1.36B-2(b)(1)).`, bandLabel: 'Above 400%', notes, note: 'This is an estimate from the IRS tables, not the Marketplace\'s determination.' };
  }
  const ap = applicablePercentage(pct, t.value);
  const contribution = Math.round(magi * ap) / 100;
  const annualBench = bench * 12;
  const credit = Math.max(0, Math.round((annualBench - contribution) * 100) / 100);
  notes.push(`Applicable percentage ${ap}% (${t.source.label}); expected contribution ${money(contribution)} a year.`);
  return {
    valid: true,
    applicablePercent: ap,
    credit,
    band: credit > 0
      ? `Estimated premium tax credit ${money(credit / 12)} a month (${money(credit)} a year): the benchmark silver plan (${money(bench)} a month) less the expected contribution of ${money(contribution / 12)} a month.`
      : `No premium tax credit: the expected contribution (${money(contribution / 12)} a month) is at least the benchmark premium (${money(bench)} a month).`,
    bandLabel: credit > 0 ? `${money(credit / 12)} a month` : 'No credit',
    notes,
    note: 'This is an estimate from the IRS tables, not the Marketplace\'s determination; advance payments are reconciled on the tax return.',
  };
}

export function employerAffordability(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the household income', o.income, 0, 1e8, 'dollars'],
    ['the employee\'s lowest-cost self-only premium', o.selfOnly, 0, 100000, 'dollars a month'],
  ]);
  if (f) return { valid: false, message: f };
  const { year, entered } = yearOf(o, now);
  if (!Number.isInteger(year) || year < 2014 || year > 2100) return { valid: false, message: 'Enter the plan year as a four-digit year.' };
  const id = `ptc-table-${year}`;
  if (!DATED_PTC[id]) return { valid: false, message: `Enter the ${year} required contribution percentage from the IRS revenue procedure: none for ${year} is on file.` };
  const req = datedValue(id, 'required', new Date(Date.UTC(year, 6, 1)), DATED_PTC).value;
  const income = Number(o.income);
  const limit = Math.round(income * req) / 100;
  const self = Number(o.selfOnly) * 12;
  const selfOk = self <= limit;
  const notes = entered ? [] : [`A plan year was not entered, so ${year} is used.`];
  notes.push(`Affordable means the annual contribution is at most ${req}% of household income: ${money(limit)} a year, or ${money(limit / 12)} a month (26 CFR 1.36B-2(c)(3)(v)).`);
  let band = `Employee: ${selfOk ? 'affordable' : 'not affordable'}: self-only coverage costs ${money(self)} a year, ${selfOk ? 'within' : 'more than'} ${req}% of household income.`;
  let label = selfOk ? 'Affordable for the employee' : 'Not affordable for the employee';
  if (String(o.family ?? '').trim()) {
    const ff = inputFault([['the family premium', o.family, 0, 100000, 'dollars a month']]);
    if (ff) return { valid: false, message: ff };
    const fam = Number(o.family) * 12;
    const famOk = fam <= limit;
    band += ` Family members: ${famOk ? 'affordable' : 'not affordable'}: family coverage costs ${money(fam)} a year.`;
    label += famOk ? '; affordable for family' : '; not for family';
    notes.push('Family members are tested against the family premium, not the self-only one.');
  } else notes.push('The family premium was not entered, so affordability for family members was not tested.');
  notes.push('Someone offered affordable, minimum-value employer coverage cannot get the premium tax credit for Marketplace coverage.');
  return { valid: true, requiredPercent: req, band, bandLabel: label, notes, note: 'This is the arithmetic of the IRS test, not the Marketplace\'s determination.' };
}
