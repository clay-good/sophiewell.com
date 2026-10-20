// spec-v1657 tool 8: overtime and agency share of worked hours, and the premium over regular pay.
//
// Arithmetic identities, no benchmark: overtime share = overtime ÷ (regular + overtime); agency share =
// agency ÷ (regular + overtime + agency); premium = overtime × (overtime rate − regular rate) + agency ×
// (agency rate − regular rate), when the rates are entered.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r1 = (n) => Math.round(n * 10) / 10;
const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `$${(Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function overtimeAgencyShare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the regular hours', o.regular, 0, 1e8, ''],
    ['the overtime hours', o.overtime, 0, 1e8, ''],
    ['the agency hours', o.agency, 0, 1e8, ''],
  ]);
  if (f) return { valid: false, message: f };
  const reg = Number(o.regular);
  const ot = Number(o.overtime);
  const ag = Number(o.agency);
  const all = reg + ot + ag;
  if (all === 0) return { valid: false, message: 'All the hours are zero. Enter the hours worked.' };
  const employee = reg + ot;
  const otShare = employee ? r1((ot / employee) * 100) : null;
  const agShare = r1((ag / all) * 100);
  const lines = [
    otShare === null ? 'No employee hours, so no overtime share.' : `Overtime ${otShare}% of employee hours (${loc(ot)} of ${loc(employee)}).`,
    `Agency ${agShare}% of all worked hours (${loc(ag)} of ${loc(all)}).`,
  ];
  const notes = [];
  let premium = null;
  if (!blank(o.regularRate) || !blank(o.overtimeRate) || !blank(o.agencyRate)) {
    const g = inputFault([
      ['the regular hourly rate', o.regularRate, 0, 10000, 'dollars'],
      ['the overtime hourly rate', o.overtimeRate, 0, 10000, 'dollars'],
      ['the agency hourly rate', o.agencyRate, 0, 10000, 'dollars'],
    ]);
    if (g) return { valid: false, message: g };
    const rr = Number(o.regularRate);
    premium = ot * (Number(o.overtimeRate) - rr) + ag * (Number(o.agencyRate) - rr);
    lines.push(`Premium over regular pay: ${money(premium)}.`);
    notes.push(`Overtime ${money(ot * (Number(o.overtimeRate) - rr))} and agency ${money(ag * (Number(o.agencyRate) - rr))} above what the same hours cost at the regular rate.`);
  } else {
    notes.push('Enter the regular, overtime and agency hourly rates to see the premium paid over regular pay.');
  }
  return {
    valid: true, overtimeShare: otShare, agencyShare: agShare, premium: premium === null ? null : Math.round(premium * 100) / 100, abnormal: false,
    band: lines.join(' '), bandLabel: `${otShare === null ? '—' : `${otShare}%`} OT, ${agShare}% agency`, notes,
    note: 'Shares of worked hours; no benchmark is built in.',
  };
}
