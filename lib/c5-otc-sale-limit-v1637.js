// spec-v1637 tool 10: the 48-hour limit on a nonprescription controlled-substance sale.
//
// Source: 21 CFR 1306.26, read on eCFR as current October 8, 2026 (re-read October 12, 2026).
//   (a)  "only by a pharmacist ... and not by a nonpharmacist employee even if under the
//     supervision of a pharmacist".
//   (b)  "Not more than 240 cc. (8 ounces) of any such controlled substance containing opium, nor
//     more than 120 cc. (4 ounces) of any other such controlled substance nor more than 48 dosage
//     units of any such controlled substance containing opium, nor more than 24 dosage units of
//     any other such controlled substance may be dispensed at retail to the same purchaser in any
//     given 48-hour period".
//   (c)  "The purchaser is at least 18 years of age".
//   (d), (e)  identification for a purchaser not known to the pharmacist; a bound record book with
//     the purchaser's name and address, the name and quantity, the date, and the pharmacist's name
//     or initials.
//   (f)  "A prescription is not required for distribution or dispensing of the substance pursuant
//     to any other Federal, State or local law."
//   (g)  central fill pharmacies may not dispense under this section.
//
// Each of the four limits is its own class. The tool counts earlier sales of the class chosen and
// says that sales of another class are not in the count. A sale exactly 48 hours earlier is
// counted as inside the period, the stricter reading.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const STATE_RULE = [
  { value: 'no-prescription-required', text: 'No: no federal, state or local law requires a prescription for it' },
  { value: 'prescription-required', text: 'Yes: state or local law requires a prescription' },
];
export const CONTENTS = [
  { value: 'contains-opium', text: 'Contains opium' },
  { value: 'no-opium', text: 'Any other such controlled substance' },
];
export const FORMS = [
  { value: 'liquid-ml', text: 'Liquid, in mL' },
  { value: 'solid-dosage-units', text: 'Solid, in dosage units' },
];
const LIMIT = { 'contains-opium|liquid-ml': 240, 'no-opium|liquid-ml': 120, 'contains-opium|solid-dosage-units': 48, 'no-opium|solid-dosage-units': 24 };
const HOURS_48 = 48 * 3600000;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// "2026-10-12T14:30" or "2026-10-12 14:30" -> ms on a clock with no time zone; else null.
function stamp(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})$/.exec(String(raw ?? '').trim());
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const d = new Date(t);
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3] || +m[4] > 23 || +m[5] > 59 || +m[1] < 1900 || +m[1] > 2200) return null;
  return t;
}
const sayAt = (t) => { const d = new Date(t); return `${d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })} at ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };

export function c5OtcSaleLimit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rule = STATE_RULE.find((x) => x.value === String(o.stateRule ?? '').trim());
  if (!rule) return { valid: false, message: 'Choose whether state or local law requires a prescription for this product. Many states do, and then this section does not apply.' };
  if (rule.value === 'prescription-required') {
    const notes = ['21 CFR 1306.26 applies only where a prescription is not required under any other federal, state or local law (1306.26(f)). With a prescription required, there is no nonprescription sale to count.'];
    return { valid: true, flag: 'section-does-not-apply', abnormal: true, band: 'No nonprescription sale: state or local law requires a prescription.', bandLabel: 'Section does not apply', notes, note: notes.join(' ') };
  }
  const contents = CONTENTS.find((x) => x.value === String(o.contents ?? '').trim());
  if (!contents) return { valid: false, message: 'Choose whether the product contains opium: the limit is doubled for one that does.' };
  const form = FORMS.find((x) => x.value === String(o.form ?? '').trim());
  if (!form) return { valid: false, message: 'Choose liquid or solid: the limit is in mL for one and dosage units for the other.' };
  const unit = form.value === 'liquid-ml' ? 'mL' : 'dosage units';
  const f = inputFault([['the quantity requested', o.requested, 0, 10000, unit], ['the purchaser\'s age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const at = stamp(o.saleTime);
  if (at === null) return { valid: false, message: 'Enter the date and time of this sale.' };
  const earlier = [];
  for (const line of String(o.earlierSales ?? '').split(/\n+/).map((x) => x.trim()).filter(Boolean)) {
    const parts = line.split(',').map((x) => x.trim());
    const t = stamp(parts[0]); const q = Number(parts[1]);
    if (t === null || parts.length < 2 || parts[1] === '' || !Number.isFinite(q) || q < 0) return { valid: false, message: `Enter each earlier sale as a date and time, a comma, then the quantity (2026-10-11 09:30, 120). "${line.slice(0, 30)}" was not read.` };
    earlier.push({ t, q });
  }
  if (earlier.length > 50) return { valid: false, message: 'Enter no more than 50 earlier sales.' };
  const limit = LIMIT[`${contents.value}|${form.value}`];
  const requested = Number(o.requested); const age = Number(o.age);
  const inWindow = earlier.filter((s) => s.t <= at && s.t >= at - HOURS_48).sort((a, b) => a.t - b.t);
  const later = earlier.filter((s) => s.t > at).length;
  const sold = inWindow.reduce((n, s) => n + s.q, 0);
  const left = Math.max(0, limit - sold);
  const notes = [`Limit: not more than ${limit} ${unit} of a product ${contents.value === 'contains-opium' ? 'containing opium' : 'not containing opium'} to the same purchaser in any 48-hour period (21 CFR 1306.26(b)).`];
  notes.push(`Sold to this purchaser in the 48 hours before ${sayAt(at)}: ${sold} ${unit}${earlier.length ? ` (${inWindow.length} of the ${earlier.length} sale${earlier.length === 1 ? '' : 's'} entered)` : '; no earlier sale was entered'}. Remaining: ${left} ${unit}.`);
  if (later) notes.push(`${later} sale${later === 1 ? ' is' : 's are'} dated after this one and ${later === 1 ? 'was' : 'were'} not counted.`);
  const out = { valid: true, limit, soldInWindow: sold, remaining: left };
  const under18 = age < 18;
  const over = requested > left;
  if (over && requested <= limit) {
    // Drop the oldest sales until the request fits; it fits just after the last one dropped leaves the period.
    let running = sold; let reopen = null;
    for (const s of inWindow) { running -= s.q; reopen = s.t + HOURS_48; if (requested <= limit - running) break; }
    out.fitsAfter = new Date(reopen).toISOString().slice(0, 16);
    notes.push(`${requested} ${unit} is more than the ${left} remaining. It would fit after ${sayAt(reopen)}, when enough of the earlier sales are more than 48 hours old.`);
  } else if (over) notes.push(`${requested} ${unit} is more than the ${limit} the rule allows in any 48-hour period, whatever was sold before.`);
  else notes.push(`${requested} ${unit} fits within the ${left} remaining.`);
  if (under18) notes.push(`The purchaser must be at least 18 years of age (1306.26(c)); ${age} was entered.`);
  notes.push('Earlier sales of another class (the other form, or with or without opium) are not in this count: each of the rule\'s four limits stands on its own.');
  notes.push('Only a pharmacist may make the sale (a nonpharmacist may finish the payment or delivery afterward); a purchaser not known to the pharmacist shows identification; and the bound record book takes the purchaser\'s name and address, the name and quantity of the product, the date, and the pharmacist\'s name or initials (1306.26(a), (d), (e)). A central fill pharmacy may not sell under this section (1306.26(g)).');
  const blocked = over || under18;
  return { ...out, flag: under18 ? 'purchaser-under-18' : over ? 'over-the-limit' : 'within-the-limit', abnormal: blocked, band: `${left} ${unit} remain of the ${limit} allowed to this purchaser in 48 hours.`, bandLabel: under18 ? 'Purchaser under 18' : over ? 'Over the limit' : 'Within the limit', notes, note: notes.join(' ') };
}
