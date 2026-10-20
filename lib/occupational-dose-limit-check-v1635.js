// spec-v1635 tool 35: year-to-date occupational dose against the annual limits.
//
// Source: 10 CFR 20.1201(a) and 20.1208(a), read on eCFR as current October 8, 2026 (re-read
// October 11, 2026):
//   20.1201(a)(1)  the annual limit is the more limiting of (i) a total effective dose equivalent
//                  of 5 rems (0.05 Sv), or (ii) the sum of the deep-dose equivalent and the
//                  committed dose equivalent to any individual organ or tissue other than the lens
//                  of the eye of 50 rems (0.5 Sv).
//   20.1201(a)(2)  (i) a lens dose equivalent of 15 rems (0.15 Sv); (ii) a shallow-dose equivalent
//                  of 50 rem (0.5 Sv) to the skin of the whole body or of any extremity.
//   20.1208(a)     the dose equivalent to the embryo/fetus during the entire pregnancy of a declared
//                  pregnant woman does not exceed 0.5 rem (5 mSv).
//   20.1201(f)     the allowed dose is reduced by occupational dose received while employed by any
//                  other person: the reader enters the total, not one employer's share.
// The year-end projection is plain proportion (dose to date x 12 / months elapsed); it is the
// tool's arithmetic, not a rule. ALARA investigation levels are license-specific and are not here.
//
// Pure: no DOM, no clock, no network.

import { sigSafe } from './cut-display.js';
import { inputFault } from './num.js';

export const UNITS = [{ value: 'rem', text: 'rem', perRem: 1 }, { value: 'mrem', text: 'mrem', perRem: 1000 }, { value: 'msv', text: 'mSv', perRem: 10 }];
// limit in rem
export const LIMITS = [
  { arg: 'tede', dom: 'tede', limit: 5, annual: true, text: 'Total effective dose equivalent', cite: '20.1201(a)(1)(i)' },
  { arg: 'organ', dom: 'organ', limit: 50, annual: true, text: 'Deep-dose plus committed dose equivalent to the most exposed organ or tissue (not the lens)', cite: '20.1201(a)(1)(ii)' },
  { arg: 'lens', dom: 'lens', limit: 15, annual: true, text: 'Lens dose equivalent', cite: '20.1201(a)(2)(i)' },
  { arg: 'skin', dom: 'skin', limit: 50, annual: true, text: 'Shallow-dose equivalent to the skin or an extremity', cite: '20.1201(a)(2)(ii)' },
  { arg: 'fetus', dom: 'fetus', limit: 0.5, annual: false, text: 'Embryo or fetus, whole pregnancy so far (declared pregnancy)', cite: '20.1208(a)' },
];
const NOTE = 'The limits are the NRC\'s for adults; an Agreement State, a license or an employer may set lower action levels, and planned special exposures and minors have other rules. Enter the dose from all employers this year. The projection assumes the rest of the year looks like the months so far, which is rarely exactly true.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 });

export function occupationalDoseLimitCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const given = LIMITS.filter((l) => !blank(o[l.arg]));
  if (!given.length) return { valid: false, message: 'Enter at least one year-to-date dose.' };
  const unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the unit the doses are in: rem, mrem or mSv.' };
  const f = inputFault(given.map((l) => [`the ${l.text.toLowerCase().replace(/ \(.*$/, '')}`, o[l.arg], 0, 1000 * unit.perRem, unit.text]));
  if (f) return { valid: false, message: f };
  let months = null;
  if (!blank(o.monthsElapsed)) {
    const mf = inputFault([['the months of the monitoring year elapsed', o.monthsElapsed, null, 12, '']]);
    if (mf) return { valid: false, message: mf };
    months = Number(o.monthsElapsed);
  }
  const rows = given.map((l) => {
    const rem = Number(o[l.arg]) / unit.perRem; const pct = (rem / l.limit) * 100;
    const row = { quantity: l.text, rem: Number(rem.toPrecision(6)), limitRem: l.limit, percent: sigSafe(pct, [100], 4), atLimit: rem >= l.limit, cite: l.cite };
    Object.defineProperty(row, 'shown', { value: sigSafe(pct, [100], 3).toLocaleString('en-US', { maximumSignificantDigits: 15 }), enumerable: false });
    if (months !== null && l.annual && rem > 0) {
      row.projectedRem = Number(((rem * 12) / months).toPrecision(4));
      // The month in which the running total would reach the limit at the same monthly rate.
      const reach = (l.limit / rem) * months;
      row.reachesLimitInMonth = rem >= l.limit ? null : reach <= 12 ? Math.ceil(reach - 1e-9) : null;
    }
    return row;
  });
  // Decided on the unrounded dose: 99.996% is below the limit, not at it.
  const over = rows.filter((r) => r.atLimit);
  const worst = rows.reduce((a, r) => (r.percent > a.percent ? r : a));
  const notes = rows.map((r) => {
    let line = `${r.quantity}: ${sig(r.rem)} rem (${sig(r.rem * 10)} mSv) is ${r.shown}% of the ${r.limitRem} rem limit (10 CFR ${r.cite}).`;
    if (r.projectedRem !== undefined) line += ` At the same monthly rate the year would end at ${sig(r.projectedRem)} rem${r.reachesLimitInMonth ? `, reaching the limit in month ${r.reachesLimitInMonth}` : r.atLimit ? '' : ', below the limit'}.`;
    return line;
  });
  if (given.some((l) => l.arg === 'fetus')) notes.push('The embryo or fetus limit is for the entire pregnancy, not a calendar year, so it is not projected. The licensee must also avoid substantial variation above a uniform monthly rate (20.1208(b)).');
  if (given.some((l) => l.arg === 'tede') && given.some((l) => l.arg === 'organ')) notes.push('The annual limit is the more limiting of the total effective dose equivalent and the organ sum.');
  notes.push('10 CFR 20.1201(a), 20.1208(a).');
  return {
    valid: true, flag: over.length ? 'limit-reached' : 'below-limits', abnormal: over.length > 0, rows,
    band: over.length ? `At or above the limit: ${over.map((r) => `${r.quantity.toLowerCase().replace(/ \(.*$/, '')} (${r.shown}%)`).join('; ')}.` : `Highest: ${worst.quantity.toLowerCase().replace(/ \(.*$/, '')} at ${worst.shown}% of its limit. None of the ${rows.length} entered is at its limit.`,
    bandLabel: `${worst.shown}% of limit`,
    notes, note: NOTE,
  };
}
