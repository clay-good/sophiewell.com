// spec-v1511 tools 3-5: controlled-substance refills, C-II partial-fill and emergency deadlines, and
// multiple C-II prescriptions.
//
// Read in the eCFR on 2026-09-26 (21 CFR part 1306):
//   1306.12(a) "The refilling of a prescription for a controlled substance listed in Schedule II is
//     prohibited." 1306.12(b)(1) multiple prescriptions for "a total of up to a 90-day supply", each
//     (other than a first one to be filled at once) carrying "the earliest date on which a pharmacy may
//     fill" it.
//   1306.22(a) Schedule III or IV: not "filled or refilled more than six months after the date on which
//     such prescription was issued", and not "refilled more than five times".
//   1306.23 partial fills of Schedule III, IV or V: each recorded as a refill, the total not exceeding
//     the quantity prescribed, and "No dispensing occurs after 6 months after the date on which the
//     prescription was issued".
//   1306.13(a) a C-II the pharmacy cannot fully supply: the remainder "within 72 hours of the first
//     partial filling"; (b) a partial fill the patient or prescriber asks for: remaining portions "not
//     later than 30 days after the date on which the prescription is written" (72 hours after issue
//     for an emergency oral prescription); long-term care or terminal illness: "valid for a period not
//     to exceed 60 days from the issue date".
//   1306.11(d)(4) emergency oral C-II: "Within 7 days after authorizing" it, the prescriber delivers
//     the written prescription.
// Schedule V refills have no federal count or time limit (1306.22 covers III and IV only); states may be
// stricter. These are federal floors.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, addMonthsUtc, fmtUtc } from './deadline.js';
import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the federal rule\'s arithmetic (21 CFR part 1306). State law can be stricter and then controls.';
export const SCHEDULES = [
  { value: 'II', text: 'Schedule II' }, { value: 'III', text: 'Schedule III' }, { value: 'IV', text: 'Schedule IV' }, { value: 'V', text: 'Schedule V' },
];
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };

export function csRefillValidity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sch = SCHEDULES.some((s) => s.value === o.schedule) ? o.schedule : null;
  if (!sch) return { valid: false, message: 'Choose the schedule.' };
  const issued = date(o.issued);
  if (!issued) return { valid: false, message: 'Enter the date the prescription was issued (YYYY-MM-DD).' };
  const today = date(o.checkDate);
  if (!today) return { valid: false, message: 'Enter the date of the fill being checked (YYYY-MM-DD).' };
  if (today < issued) return { valid: false, message: 'Enter the dates again: the fill cannot come before the prescription was issued.' };
  if (sch === 'II') {
    return { valid: true, refillsLeft: 0, band: 'Schedule II: no refills are allowed (21 CFR 1306.12(a)). A new prescription is needed; up to 90 days can be written as multiple prescriptions.', bandLabel: 'No refills', notes: [], note: POSTURE };
  }
  const f = inputFault([['the refills authorized', o.authorized, 0, 99, ''], ['the refills already dispensed', o.dispensed, 0, 99, '']]);
  if (f) return { valid: false, message: f };
  const auth = Number(o.authorized);
  const done = Number(o.dispensed);
  if (!Number.isInteger(auth) || !Number.isInteger(done)) return { valid: false, message: 'Enter the refills as whole numbers.' };
  const notes = ['Partial fills count against the total quantity prescribed, and each is recorded like a refill (21 CFR 1306.23).'];
  if (sch === 'V') {
    const left = Math.max(0, auth - done);
    notes.push('Schedule V has no federal limit on refills or their timing; partial fills still stop 6 months after issue (21 CFR 1306.23). State law may be stricter.');
    return { valid: true, refillsLeft: left, band: `Schedule V: ${left} of ${auth} authorized refill${auth === 1 ? '' : 's'} left, with no federal time limit.`, bandLabel: `${left} refills left`, notes, note: POSTURE };
  }
  const last = addMonthsUtc(issued, 6);
  const cap = Math.min(auth, 5);
  const left = Math.max(0, cap - done);
  if (auth > 5) notes.push(`${auth} refills were authorized, but the federal limit is 5 (21 CFR 1306.22(a)).`);
  if (today > last) {
    return { valid: true, refillsLeft: 0, lastFillDate: fmtUtc(last), band: `Expired: the 6-month limit ended ${longDate(last)}, so nothing more may be dispensed on this prescription (21 CFR 1306.22(a)).`, bandLabel: 'Expired (6 months)', notes, note: POSTURE };
  }
  if (!left) return { valid: true, refillsLeft: 0, lastFillDate: fmtUtc(last), band: `No refills left: ${done} of the ${cap} allowed have been dispensed.`, bandLabel: 'No refills left', notes, note: POSTURE };
  return {
    valid: true,
    refillsLeft: left,
    lastFillDate: fmtUtc(last),
    band: `Schedule ${sch}: ${left} refill${left === 1 ? '' : 's'} left, dispensable until ${longDate(last)}, 6 months after issue; whichever runs out first ends the prescription (21 CFR 1306.22(a)).`,
    bandLabel: `${left} refill${left === 1 ? '' : 's'} left`,
    notes,
    note: POSTURE,
  };
}

export const C2_CASES = [
  { value: 'short-stock', text: 'The pharmacy could not supply the full quantity' },
  { value: 'requested', text: 'The patient or prescriber asked for a partial fill' },
  { value: 'ltc', text: 'Long-term care or terminally ill patient' },
  { value: 'emergency', text: 'Emergency oral prescription' },
];

export function c2FillDeadlines(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const c = C2_CASES.some((x) => x.value === o.case) ? o.case : null;
  if (!c) return { valid: false, message: 'Choose which case applies.' };
  const w = parseDateTime(o.start);
  if (w === null) {
    const what = { 'short-stock': 'the first partial fill', requested: 'the date the prescription was written', ltc: 'the date the prescription was issued', emergency: 'the time the oral prescription was authorized' }[c];
    return { valid: false, message: `Enter ${what} as YYYY-MM-DDTHH:MM.` };
  }
  let end;
  let band;
  const notes = [];
  if (c === 'short-stock') {
    end = addHours(w, 72).endWall;
    band = `Fill the remainder by ${formatDeadline(w, end, 'the partial fill')} (21 CFR 1306.13(a)). After that, no more may be supplied without a new prescription, and the prescriber must be told.`;
  } else if (c === 'requested') {
    const d = addCalendarDaysUtc(parseIsoStrict(o.start.slice(0, 10)), 30);
    band = `Fill the remaining portions no later than ${longDate(d)}, 30 days after the date written (21 CFR 1306.13(b)). The total of the partial fills cannot exceed the quantity prescribed.`;
    notes.push('For an emergency oral prescription, the remaining portions must instead be filled within 72 hours of issue.');
    end = null;
    return { valid: true, deadline: fmtUtc(d), band, bandLabel: `By ${fmtUtc(d)}`, notes, note: POSTURE };
  } else if (c === 'ltc') {
    const d = addCalendarDaysUtc(parseIsoStrict(o.start.slice(0, 10)), 60);
    return { valid: true, deadline: fmtUtc(d), band: `Partial fills may continue until ${longDate(d)}, 60 days from issue, unless the medication is stopped sooner (21 CFR 1306.13(b)).`, bandLabel: `Through ${fmtUtc(d)}`, notes: ['The pharmacist records on the prescription that the patient is in long-term care or terminally ill.'], note: POSTURE };
  } else {
    const d = addCalendarDaysUtc(parseIsoStrict(o.start.slice(0, 10)), 7);
    return { valid: true, deadline: fmtUtc(d), band: `The prescriber must deliver the written prescription for the emergency quantity by ${longDate(d)}, 7 days after authorizing it (21 CFR 1306.11(d)(4)); if it does not arrive, the pharmacist must notify the DEA.`, bandLabel: `Written Rx by ${fmtUtc(d)}`, notes: ['A mailed prescription counts if it is postmarked within the 7 days; it must say "Authorization for Emergency Dispensing" and give the date of the oral order.'], note: POSTURE };
  }
  return { valid: true, deadline: new Date(end).toISOString().slice(0, 16), band, bandLabel: `By ${new Date(end).toISOString().slice(0, 16).replace('T', ' ')}`, notes, note: POSTURE };
}

const SERIES = [1, 2, 3];
export function c2MultipleRxSeries(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const issued = date(o.issued);
  if (!issued) return { valid: false, message: 'Enter the date the prescriptions were issued (YYYY-MM-DD).' };
  const rx = [];
  for (const n of SERIES) {
    const ds = String(o[`rx${n}Days`] ?? '').trim();
    const ef = String(o[`rx${n}Earliest`] ?? '').trim();
    if (!ds && !ef) continue;
    const f = inputFault([[`prescription ${n}'s days supply`, ds, null, 90, 'days']]);
    if (f) return { valid: false, message: f };
    const e = ef ? date(ef) : null;
    if (ef && !e) return { valid: false, message: `Enter prescription ${n}'s earliest fill date as YYYY-MM-DD.` };
    rx.push({ n, days: Number(ds), earliest: e });
  }
  if (!rx.length) return { valid: false, message: 'Enter the days supply of at least the first prescription in the series.' };
  const total = rx.reduce((s, r) => s + r.days, 0);
  const problems = [];
  const checks = [];
  if (total > 90) problems.push(`the series totals ${total} days, over the 90-day limit`);
  rx.forEach((r, i) => {
    if (i > 0 && !r.earliest) problems.push(`prescription ${r.n} has no earliest fill date`);
    if (i > 0 && r.earliest) {
      const prev = rx[i - 1];
      const start = prev.earliest || issued;
      const runsOut = addCalendarDaysUtc(start, prev.days);
      if (r.earliest < runsOut) checks.push(`prescription ${r.n} may be filled ${longDate(r.earliest)}, before prescription ${prev.n}'s supply runs out on ${longDate(runsOut)}`);
    }
  });
  const cal = rx.map((r) => `Rx ${r.n}: ${r.days} days from ${r.earliest ? longDate(r.earliest) : `${longDate(issued)} (fill at once)`}`);
  return {
    valid: true,
    totalDays: total,
    ok: !problems.length,
    band: problems.length ? `Not valid as written: ${problems.join('; ')} (21 CFR 1306.12(b)).` : `Valid: ${rx.length} prescription${rx.length === 1 ? '' : 's'} totaling ${total} days, each after the first with an earliest fill date (21 CFR 1306.12(b)).${checks.length ? ` Check the dates: ${checks.join('; ')}.` : ''}`,
    bandLabel: problems.length ? 'Not valid' : checks.length ? `Valid, ${total} days; check dates` : `Valid, ${total} days`,
    notes: [cal.join('; ') + '.', ...(checks.length ? ['The rule sets the 90-day total and requires the earliest fill dates; overlapping dates are not themselves prohibited, but they let the supplies stack.'] : []), 'Multiple prescriptions are allowed only where state law permits them; the prescriber must judge that they do not create an undue risk of diversion.'],
    note: POSTURE,
  };
}
