// spec-v1637 tool 22: the expiration date for a solid oral drug repackaged into unit-dose
// containers by a commercial repackager.
//
// Source: FDA, "Expiration Dating of Unit-Dose Repackaged Solid Oral Dosage Form Drug Products",
// guidance for industry, July 2020, re-read October 12, 2026.
//   Scope: "solid oral dosage form drugs into unit-dose containers by commercial pharmaceutical
//     repackaging firms that are required to register with FDA". It "does not address" other
//     dosage forms (for example liquids) or "Products repackaged by State-licensed pharmacies,
//     Federal facilities, and outsourcing facilities".
//   Section III: FDA "generally does not intend to take action" if the product carries "an
//     expiration date that does not exceed (1) 6 months from the date of repackaging, or (2) 25
//     percent of the time between the date of repackaging and the expiration date on the container
//     of the original manufacturer's product, whichever time period is shorter, and if all the
//     following circumstances are present": (1) a USP <671> Class A or Class B container; (2) for
//     a light-sensitive product, light protection equal to or greater than the original; (3) the
//     original container "has not been opened previously and the entire contents are repackaged in
//     one operation"; (4) repackaging and storage consistent with the labeled conditions; (5) the
//     labeling "does not caution against repackaging".
//   The guidance also describes a longer date supported by stability data, which the tool does not
//     compute.
//
// The guidance does not say how to round a fractional day of the 25 percent; the tool rounds
// down. A month-and-year expiration date is read as the last day of that month.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const CONDITIONS = [
  { arg: 'container', dom: 'udr-container', ask: 'The unit-dose container meets USP <671> Class A or Class B', fail: 'the unit-dose container does not meet USP <671> Class A or Class B' },
  { arg: 'light', dom: 'udr-light', ask: 'Light protection equals or exceeds the original container (answer Yes if the label does not say to protect from light)', fail: 'the product is light-sensitive and the unit-dose container gives less light protection than the original' },
  { arg: 'unopened', dom: 'udr-unopened', ask: 'Original container unopened, and all of it repackaged in one operation', fail: 'the original container had been opened before, or its contents were not all repackaged in one operation' },
  { arg: 'storage', dom: 'udr-storage', ask: 'Repackaging and storage met the conditions on the original labeling', fail: 'repackaging or storage did not meet the conditions on the original labeling' },
  { arg: 'noCaution', dom: 'udr-caution', ask: 'The labeling does not caution against repackaging', fail: 'the labeling cautions against repackaging' },
];
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
// "2027-06" -> the last day of June 2027; "2027-06-30" -> that day.
function expiry(v) {
  const s = String(v ?? '').trim();
  const m = /^(\d{4})-(\d{2})$/.exec(s);
  if (m) { if (+m[2] < 1 || +m[2] > 12 || +m[1] < 1900 || +m[1] > 2200) return null; return { d: new Date(Date.UTC(+m[1], +m[2], 0)), monthOnly: true }; }
  const d = date(s); return d ? { d, monthOnly: false } : null;
}

export function unitDoseRepackExpiry(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const repacked = date(o.repackaged);
  if (!repacked) return { valid: false, message: 'Enter the date of repackaging.' };
  const mfr = expiry(o.manufacturerExpiry);
  if (!mfr) return { valid: false, message: 'Enter the expiration date on the manufacturer\'s container, as a date or as a year and month (2027-06).' };
  if (mfr.d.getTime() <= repacked.getTime()) return { valid: false, message: 'Enter a manufacturer\'s expiration date that is after the date of repackaging: an expired product has no time left to take 25 percent of.' };
  const failed = [];
  for (const c of CONDITIONS) {
    const a = String(o[c.arg] ?? '').trim();
    if (a !== 'yes' && a !== 'no') return { valid: false, message: `Choose yes or no: ${c.ask.charAt(0).toLowerCase()}${c.ask.slice(1)}. The policy applies only when all five circumstances are present.` };
    if (a === 'no') failed.push(c.fail);
  }
  const between = Math.round((mfr.d.getTime() - repacked.getTime()) / 86400000);
  const quarterDays = Math.floor(between * 0.25);
  const byQuarter = addCalendarDaysUtc(repacked, quarterDays);
  const bySix = addMonthsUtc(repacked, 6);
  const quarterBinds = byQuarter.getTime() <= bySix.getTime();
  const latest = quarterBinds ? byQuarter : bySix;
  const notes = ['Scope: this is FDA\'s enforcement policy for solid oral dosage forms repackaged into unit-dose containers by commercial repackagers registered with FDA. It does not address liquids, or repackaging by state-licensed pharmacies, federal facilities or outsourcing facilities, which FDA addresses separately; a pharmacy\'s own date under state law or its board\'s rule is not this one.'];
  notes.push(`Repackaged ${say(repacked)}; manufacturer's expiration ${say(mfr.d)}${mfr.monthOnly ? ' (a month and year is read as the last day of that month)' : ''}: ${between} days between them.`);
  notes.push(`Six months from repackaging is ${say(bySix)}. Twenty-five percent of ${between} days is ${between * 0.25} days, ${Number.isInteger(between * 0.25) ? '' : `rounded down to ${quarterDays}, `}which is ${say(byQuarter)}. The shorter period governs: ${quarterBinds ? 'the 25 percent' : 'the 6 months'}.`);
  notes.push('The guidance does not say how to round a fractional day; this rounds down.');
  const out = { valid: true, latestExpiration: fmtUtc(latest), sixMonths: fmtUtc(bySix), twentyFivePercent: fmtUtc(byQuarter), daysBetween: between, binding: quarterBinds ? '25-percent' : '6-months', failedConditions: failed };
  if (failed.length) {
    notes.push(`Not all five circumstances are present: ${failed.join('; ')}. The policy's date does not apply without them; the expiration date then rests on stability data under 21 CFR 211.137 and 211.166.`);
    return { ...out, flag: 'circumstances-not-all-present', abnormal: true, band: `The policy does not apply: ${failed.length} of its five circumstances ${failed.length === 1 ? 'is' : 'are'} not present.`, bandLabel: 'Policy does not apply', notes, note: notes.join(' ') };
  }
  notes.push('All five circumstances were answered yes. The guidance also allows a later date when supported by stability data, which this does not compute. It is nonbinding guidance on FDA\'s enforcement, not a regulation.');
  return { ...out, flag: 'expiration-date', abnormal: false, band: `Expiration date no later than ${say(latest)}.`, bandLabel: quarterBinds ? 'Bound by 25 percent of the time remaining' : 'Bound by 6 months', notes, note: notes.join(' ') };
}
