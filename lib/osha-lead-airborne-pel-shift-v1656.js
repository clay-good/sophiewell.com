// spec-v1656 tool 6: the OSHA airborne lead limit for a work day longer than 8 hours.
//
// Source: 29 CFR 1910.1025, read on the eCFR (title 29 current to October 16, 2026) on October 19, 2026:
//   (b): the action level is "an airborne concentration of lead of 30 micrograms per cubic meter of
//     air (30 µg/m3) averaged over an 8-hour period."
//   (c)(1): no exposure "greater than fifty micrograms per cubic meter of air (50 µg/m3) averaged over
//     an 8-hour period."
//   (c)(2): "If an employee is exposed to lead for more than 8 hours in any work day, the permissible
//     exposure limit, as a time weighted average (TWA) for that day, shall be reduced ...
//     Maximum permissible limit (in µg/m3) = 400 ÷ hours worked in the day."
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const round1 = (n) => Math.round(n * 10) / 10;

export function oshaLeadAirbornePelShift(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the hours worked in the day', o.hours, null, 24, 'hours']]);
  if (f) return { valid: false, message: f };
  const h = Number(o.hours);
  const pel = h > 8 ? round1(400 / h) : 50;
  const basis = h > 8
    ? `${h} hours is more than 8, so the limit is 400 ÷ ${h} = ${pel} µg/m³ (§1910.1025(c)(2)).`
    : `${h} hours is not more than 8, so the limit is the unreduced 50 µg/m³ (§1910.1025(c)(1)).`;
  const raw = o.measuredTwa;
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return {
      valid: true, pel, exceeded: null, actionLevel: null, abnormal: false,
      band: `Permissible exposure limit for the day: ${pel} µg/m³. ${basis}`,
      bandLabel: `${pel} µg/m³`, notes: [], note: 'Enter the measured TWA for the day to compare it with the limit and the 30 µg/m³ action level.',
    };
  }
  const g = inputFault([['the measured TWA', raw, 0, 10000, 'µg/m³']]);
  if (g) return { valid: false, message: g };
  const m = Number(raw);
  const exceeded = m > pel;
  const actionLevel = m >= 30;
  return {
    valid: true, pel, exceeded, actionLevel, abnormal: exceeded || actionLevel,
    band: `Measured ${m} µg/m³ ${exceeded ? 'exceeds' : 'does not exceed'} the day's limit of ${pel} µg/m³. ${basis}`,
    bandLabel: exceeded ? 'Over the limit' : 'Within the limit',
    notes: [actionLevel
      ? 'At or above the action level of 30 µg/m³ averaged over 8 hours (§1910.1025(b)).'
      : 'Below the action level of 30 µg/m³ averaged over 8 hours (§1910.1025(b)).'],
    note: 'Under 29 CFR 1910.1025 (general industry). The measured value is compared as entered; the respirator protection factors that (c)(3) allows for compliance are not applied. It does not certify compliance.',
  };
}
