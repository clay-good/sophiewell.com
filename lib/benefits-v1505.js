// spec-v1505 tools 4 and 5: benefits investigation summary, and cost by site of care.
//
// Both walk the plan's cost sharing the way a claim adjudicates: the remaining deductible first, then
// coinsurance (or a copay per administration), until the remaining out-of-pocket maximum is reached, after
// which the patient pays nothing more in the plan year. For a non-grandfathered plan the out-of-pocket
// maximum caps in-network cost sharing for essential health benefits (45 CFR 156.130). Every figure is the
// reader's, from the eligibility check and the plan's allowed amounts; each output line says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const r2 = (x) => Math.round(x * 100) / 100;
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const SHARE_KINDS = [{ value: 'coinsurance', text: 'Coinsurance (percent)' }, { value: 'copay', text: 'Copay per administration (dollars)' }];

// walk(n, allowed, dedLeft, share, oopLeft) -> per-administration patient costs
export function walk(n, allowed, dedLeft, share, oopLeft) {
  const out = [];
  let ded = dedLeft;
  let oop = oopLeft;
  for (let i = 0; i < n; i += 1) {
    const toDed = Math.min(allowed, ded);
    const after = allowed - toDed;
    let pay = toDed + (share.kind === 'copay' ? Math.min(share.value, after) : after * share.value / 100);
    pay = r2(Math.max(0, Math.min(pay, oop)));
    ded = r2(ded - toDed);
    oop = r2(oop - pay);
    out.push(pay);
  }
  return out;
}

function readShare(o, prefix = '') {
  const kind = SHARE_KINDS.some((k) => k.value === o[`${prefix}shareKind`]) ? o[`${prefix}shareKind`] : null;
  if (!kind) return { error: 'Choose coinsurance or a copay.' };
  const f = inputFault([[kind === 'copay' ? 'the copay' : 'the coinsurance', o[`${prefix}share`], 0, kind === 'copay' ? 1e6 : 100, kind === 'copay' ? 'dollars' : 'percent']]);
  if (f) return { error: f };
  return { kind, value: Number(o[`${prefix}share`]) };
}

export function biSummary(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the allowed amount per administration', o.allowed, 0, 1e7, 'dollars'],
    ['the administrations in the plan year', o.perYear, 1, 366, ''],
    ['the deductible still to meet', o.deductibleLeft, 0, 1e6, 'dollars'],
    ['the out-of-pocket maximum still to meet', o.oopLeft, 0, 1e6, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const share = readShare(o);
  if (share.error) return { valid: false, message: share.error };
  const n = Math.round(Number(o.perYear));
  const allowed = Number(o.allowed);
  const costs = walk(n, allowed, Number(o.deductibleLeft), share, Number(o.oopLeft));
  const in90 = String(o.in90 ?? '').trim() ? Math.round(Number(o.in90)) : Math.min(n, Math.ceil(n * 90 / 365));
  if (String(o.in90 ?? '').trim()) { const g = inputFault([['the administrations in the first 90 days', o.in90, 1, n, '']]); if (g) return { valid: false, message: g }; }
  const sum = (a) => r2(a.reduce((s, x) => s + x, 0));
  const first = costs[0];
  const d90 = sum(costs.slice(0, in90));
  const year = sum(costs);
  const notes = [
    `Allowed ${money(allowed)} per administration, ${n} a year (${in90} in the first 90 days${String(o.in90 ?? '').trim() ? '' : ', estimated evenly'}); all figures entered by the reader from the eligibility check.`,
  ];
  if (o.priorAuth === 'yes') notes.push('Prior authorization is required: none of these costs apply until it is approved.');
  if (o.specialtyPharmacy === 'yes') notes.push('The plan requires its specialty pharmacy; another pharmacy may be out of network.');
  const capAt = costs.findIndex((_, i) => sum(costs.slice(0, i + 1)) >= Number(o.oopLeft) - 0.005);
  if (capAt >= 0 && Number(o.oopLeft) > 0) notes.push(`The out-of-pocket maximum is reached at administration ${capAt + 1}; later ones cost the patient nothing this plan year.`);
  return {
    valid: true,
    first, d90, year,
    band: `Patient pays ${money(first)} for the first administration, ${money(d90)} over the first 90 days, and ${money(year)} for the plan year.`,
    bandLabel: `${money(year)} a year`,
    notes,
    note: 'Arithmetic on the plan\'s terms as entered; the plan\'s adjudication of each claim controls. For a non-grandfathered plan, in-network cost sharing is capped by the out-of-pocket maximum (45 CFR 156.130).',
  };
}

export function siteOfCareCompare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the administrations in the plan year', o.perYear, 1, 366, '']]);
  if (f) return { valid: false, message: f };
  const n = Math.round(Number(o.perYear));
  const dedLeft = String(o.deductibleLeft ?? '').trim() ? Number(o.deductibleLeft) : 0;
  const oopLeft = String(o.oopLeft ?? '').trim() ? Number(o.oopLeft) : Infinity;
  const notes = [];
  if (!String(o.deductibleLeft ?? '').trim()) notes.push('The remaining deductible was not entered, so none is applied.');
  if (!String(o.oopLeft ?? '').trim()) notes.push('The remaining out-of-pocket maximum was not entered, so no cap is applied.');
  const sites = [];
  for (const k of [1, 2, 3, 4]) {
    const name = String(o[`site${k}`] ?? '').trim();
    const al = String(o[`allowed${k}`] ?? '').trim();
    if (!name && !al) continue;
    if (!name) return { valid: false, message: `Enter a name for site ${k}.` };
    const af = inputFault([[`the allowed amount at ${name}`, o[`allowed${k}`], 0, 1e7, 'dollars']]);
    if (af) return { valid: false, message: af };
    const share = readShare(o, `s${k}`);
    if (share.error) return { valid: false, message: `${name}: ${share.error}` };
    const allowed = Number(o[`allowed${k}`]);
    const pat = walk(n, allowed, dedLeft, share, oopLeft === Infinity ? 1e12 : oopLeft);
    const patient = r2(pat.reduce((s, x) => s + x, 0));
    const plan = r2(allowed * n - patient);
    sites.push({ name, allowed, patient, plan, total: r2(allowed * n) });
  }
  if (sites.length < 2) return { valid: false, message: 'Enter at least two sites: a name, the allowed amount per administration, and the patient\'s share.' };
  const byTotal = [...sites].sort((a, b) => a.total - b.total);
  const byPatient = [...sites].sort((a, b) => a.patient - b.patient);
  for (const s of sites) notes.push(`${s.name}: ${money(s.allowed)} per administration; for ${n} a year, the plan pays ${money(s.plan)} and the patient ${money(s.patient)} (total ${money(s.total)}).`);
  const lo = byTotal[0];
  const hi = byTotal[byTotal.length - 1];
  return {
    valid: true,
    sites,
    band: `Lowest total cost: ${lo.name}, ${money(lo.total)} a year against ${money(hi.total)} at ${hi.name} (a difference of ${money(r2(hi.total - lo.total))}). Lowest for the patient: ${byPatient[0].name}, ${money(byPatient[0].patient)} a year.`,
    bandLabel: lo.name,
    notes,
    note: 'Arithmetic on the allowed amounts and cost sharing entered for each site; the plan\'s site-of-care policy and its claims control.',
  };
}
