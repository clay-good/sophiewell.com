// spec-v1657 tool 9: volume-adjusted (flexible) budget variance for a unit's hours or dollars.
//
// The standard flexible-budget decomposition, an identity with no source number:
//   variable rate = (static budget − fixed portion) ÷ budgeted volume
//   flexible budget = fixed portion + variable rate × actual volume
//   volume variance = flexible − static (what the volume change alone allows)
//   spending variance = actual − flexible; total variance = actual − static
// For a cost, a positive spending or total variance is unfavorable (more than allowed).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r2 = (n) => Math.round(n * 100) / 100;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const fmt = (n) => r2(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt(Math.abs(n))}`;
const fav = (n) => (n > 0 ? 'unfavorable' : n < 0 ? 'favorable' : 'on budget');

export function unitBudgetVariance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the budgeted volume', o.budgetVolume, null, 1e9, ''],
    ['the actual volume', o.actualVolume, 0, 1e9, ''],
    ['the budgeted amount', o.budgetAmount, 0, 1e12, ''],
    ['the actual amount', o.actualAmount, 0, 1e12, ''],
  ]);
  if (f) return { valid: false, message: f };
  const notes = [];
  let fixed = 0;
  if (blank(o.fixedAmount)) notes.push('Enter the fixed portion of the budget (0 if it all varies with volume); until then the whole budget is treated as variable.');
  else {
    const g = inputFault([['the fixed portion', o.fixedAmount, 0, Number(o.budgetAmount), '']]);
    if (g) return { valid: false, message: `${g} It cannot exceed the budget.` };
    fixed = Number(o.fixedAmount);
  }
  const bv = Number(o.budgetVolume);
  const av = Number(o.actualVolume);
  const st = Number(o.budgetAmount);
  const act = Number(o.actualAmount);
  const rate = (st - fixed) / bv;
  const flex = fixed + rate * av;
  const vol = flex - st;
  const spend = act - flex;
  const tot = act - st;
  if (av > 0) notes.push(`Per unit of volume: budgeted ${fmt(st / bv)}, actual ${fmt(act / av)}.`);
  else notes.push('Actual volume is zero, so there is no per-unit figure.');
  return {
    valid: true, flexible: r2(flex), volumeVariance: r2(vol), spendingVariance: r2(spend), totalVariance: r2(tot), abnormal: spend > 0,
    band: `Flexible budget ${fmt(flex)} for the actual volume. Spending variance ${signed(spend)} (${fav(spend)}); volume variance ${signed(vol)}; total variance ${signed(tot)} (${fav(tot)}).`,
    bandLabel: `${signed(spend)} spending`,
    notes,
    note: 'Signs are for a cost: over the flexible budget is unfavorable. The volume variance is what the change in volume alone allowed.',
  };
}
