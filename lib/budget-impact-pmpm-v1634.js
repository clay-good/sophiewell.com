// spec-v1634 tool 30: budget impact per member per month.
//
// Source: Sullivan SD et al. Budget impact analysis -- principles of good practice: report of the ISPOR 2012 Budget
// Impact Analysis Good Practice II Task Force. Value Health. 2014;17:5-14 (not open). Built on the owner's rule of
// October 17, 2026 that what can be proved is a source. The per-member-per-month form, PMPM = budget impact /
// (members x months), is stated as an equation in Rojas-Roque C et al. Pharmacoecon Open 2024;8:585 ("PMPM = beta /
// 1,000,000 women / 12 month") and both it and Proudman D et al. JAMA Netw Open 2020;3:e2025866 reproduce from
// their own tables: 476,390 / 1,000,000 / 12 = 0.0397 (printed $0.0397); 115,604 / 1,000,000 / 12 = 0.0096
// (printed 0.010). Re-read October 17, 2026.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'Per member per month = the budget impact over the period, divided by the members covered and the months in the period, the form published budget impact analyses report it in. A health plan\'s own member count and period are the reader\'s.';
const money = (x) => `${x < 0 ? '-' : ''}$${Math.abs(x) < 1 ? Math.abs(x).toFixed(4) : Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function budgetImpactPmpm(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the budget impact', o.budgetImpact, -1e12, 1e12, 'dollars'],
    ['the number of members', o.members, 1, 1e9, ''],
    ['the number of months', o.months, 1, 600, ''],
  ]);
  if (f) return { valid: false, message: f };
  const bi = Number(o.budgetImpact); const members = Number(o.members); const months = Number(o.months);
  if (!Number.isInteger(months)) return { valid: false, message: 'Enter the period as a whole number of months.' };
  const pmpm = bi / (members * months);
  const perYear = pmpm * 12;
  return {
    valid: true, pmpm: Number(pmpm.toFixed(6)), perMemberPerYear: Number(perYear.toFixed(4)),
    band: `Budget impact ${money(pmpm)} per member per month (${money(bi)} over ${months} month${months === 1 ? '' : 's'} for ${members.toLocaleString('en-US')} members).`,
    bandLabel: `${money(pmpm)} PMPM`, abnormal: false,
    notes: [`${money(bi)} / (${members.toLocaleString('en-US')} members x ${months} months) = ${money(pmpm)}; per member per year, ${money(perYear)}.`, bi < 0 ? 'A negative budget impact is a saving.' : 'A positive budget impact is a cost to the plan.'],
    note: NOTE,
  };
}
