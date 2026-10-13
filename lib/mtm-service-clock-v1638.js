// spec-v1638 tool 2: MTM review due dates and the CMR completion rate.
//
// Sources, re-read October 12, 2026:
//   42 CFR 423.153(d)(1)(vii): the MTM program "Must offer a minimum level of medication therapy
//     management services for each beneficiary enrolled in the MTM program that includes ... (B)
//     Annual comprehensive medication review with written summaries ... (C) Quarterly targeted
//     medication reviews with follow-up interventions when necessary."
//   CMS, CY 2025 MTM program guidance memo: "Sponsors should successfully offer to provide a CMR to
//     newly targeted beneficiaries (i.e., beneficiaries not enrolled in the sponsors' MTM program
//     during the previous contract year) as soon as possible after enrollment into the MTM program,
//     but no later than 60 days after being enrolled in the MTM program. For MTM enrollees who were
//     enrolled in the MTM program during the previous contract year ... sponsors should successfully
//     offer the CMR within one year of the last CMR offer." "The TMRs must occur at least quarterly
//     beginning immediately upon enrollment in the MTM program".
//   CMS, 2026 Star Ratings Technical Notes, measure D11 (MTM Program Completion Rate for CMR):
//     denominator, beneficiaries "at least 18 years or older as of the beginning of the reporting
//     period and who were enrolled in the MTM program for at least 60 days during the reporting
//     period", meeting the contract's CMS targeting criteria, not "in hospice at any point"; those
//     enrolled "for less than 60 days ... are only included in the denominator and the numerator if
//     they received a CMR within this timeframe"; "The date of enrollment is counted towards the 60
//     days but the opt-out date is not." Numerator: "received a CMR at any time during their period
//     of MTM enrollment in the reporting period."
//   CMS, 2027 Star Ratings Technical Notes: the measure "was transitioned to the display page for
//     measurement years 2025 and 2026 and will return to the Star Ratings as a new measure beginning
//     with the 2029 Star Ratings (measurement year 2027)."
//
// The 60-day and one-year CMR offer lines are CMS guidance ("should"), not regulation text, and are
// labeled so. No star cut point is printed.
//
// Pure: no DOM, no clock (the as-of date is entered), no network.

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';

const DAY = 86400000;
const POSTURE = 'This applies CMS\'s published method and guidance to the list entered. It is not CMS\'s rate, and the offer dates are guidance, not regulation.';
const lines = (t) => String(t ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
const yn = (v) => { const c = String(v).toLowerCase(); return c === 'yes' ? true : c === 'no' ? false : null; };
function dates(cell, what, i) { const out = []; for (const part of String(cell).split(/[;|]/).map((x) => x.trim()).filter(Boolean)) { const d = date(part); if (!d) return { message: `Enter the ${what} on enrollee line ${i + 1} as YYYY-MM-DD, separated by semicolons.` }; out.push(d.getTime()); } return { out }; }

export function mtmServiceClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const yf = inputFault([['the contract year', o.contractYear, 2020, 2100, '']]);
  if (yf) return { valid: false, message: yf };
  const year = Number(o.contractYear);
  if (!Number.isInteger(year)) return { valid: false, message: 'Enter the contract year as a whole year, such as 2026.' };
  const asOf = date(o.asOf);
  if (!asOf) return { valid: false, message: 'Enter the as-of date.' };
  const start = Date.UTC(year, 0, 1); const end = Date.UTC(year, 11, 31);
  if (asOf.getTime() < start || asOf.getTime() > end) return { valid: false, message: `Enter an as-of date inside ${year}.` };
  const rowsIn = lines(o.enrollees);
  if (!rowsIn.length) return { valid: false, message: 'Enter the enrollees, one per line: enrollee, MTM enrollment date, enrolled last year (yes or no), last CMR offer date, CMR dates, TMR dates, opt-out date, age at the start of the year, hospice (yes or no), met CMS criteria (yes or no).' };
  if (rowsIn.length > 2000) return { valid: false, message: 'Enter at most 2,000 enrollees.' };
  const list = []; const seen = new Set();
  for (const [i, row] of rowsIn.entries()) {
    const c = row.split(/[,\t]/).map((x) => x.trim());
    const [id = '', enr = '', prior = '', lastOffer = '', cmrs = '', tmrs = '', opt = '', age = '', hospice = '', met = ''] = c;
    if (!id) return { valid: false, message: `Enter an enrollee reference on line ${i + 1}.` };
    if (seen.has(id)) return { valid: false, message: `Enter each enrollee once: "${id}" appears twice.` };
    seen.add(id);
    const e = date(enr);
    if (!e || e.getTime() > end) return { valid: false, message: `Enter the MTM enrollment date on enrollee line ${i + 1} as YYYY-MM-DD, not after ${year}.` };
    const p = yn(prior); const h = yn(hospice); const m = yn(met);
    if (p === null || h === null || m === null) return { valid: false, message: `Enter yes or no for enrolled last year, hospice and met CMS criteria on enrollee line ${i + 1}.` };
    const af = inputFault([[`the age on enrollee line ${i + 1}`, age, 0, 120, 'years']]);
    if (af) return { valid: false, message: af };
    const lo = lastOffer ? date(lastOffer) : null;
    if (lastOffer && !lo) return { valid: false, message: `Enter the last CMR offer date on enrollee line ${i + 1} as YYYY-MM-DD, or leave it blank.` };
    const od = opt ? date(opt) : null;
    if (opt && !od) return { valid: false, message: `Enter the opt-out date on enrollee line ${i + 1} as YYYY-MM-DD, or leave it blank.` };
    const cm = dates(cmrs, 'CMR dates', i); if (cm.message) return { valid: false, message: cm.message };
    const tm = dates(tmrs, 'TMR dates', i); if (tm.message) return { valid: false, message: tm.message };
    list.push({ id, enrolled: e.getTime(), prior: p, lastOffer: lo ? lo.getTime() : null, cmrs: cm.out, tmrs: tm.out, optOut: od ? od.getTime() : null, age: Number(age), hospice: h, met: m });
  }
  const out = []; let den = 0; let num = 0; const excluded = {};
  const bump = (k) => { excluded[k] = (excluded[k] || 0) + 1; };
  for (const e of list) {
    const from = Math.max(e.enrolled, start);
    const lastDay = e.optOut !== null ? Math.min(e.optOut - DAY, end) : end;
    const days = lastDay >= from ? Math.round((lastDay - from) / DAY) + 1 : 0;
    const cmrIn = e.cmrs.filter((t) => t >= from && t <= lastDay);
    const r = { enrollee: e.id, daysEnrolled: days, cmrInYear: cmrIn.length > 0 };
    // CMR offer due (guidance).
    if (!r.cmrInYear && (e.optOut === null || e.optOut > asOf.getTime())) {
      if (!e.prior) { const due = e.enrolled + 60 * DAY; r.cmrOfferDue = new Date(due).toISOString().slice(0, 10); r.daysLeft = Math.round((due - asOf.getTime()) / DAY); r.basis = '60 days after MTM enrollment'; }
      else if (e.lastOffer !== null) { const d0 = new Date(e.lastOffer); const due = Date.UTC(d0.getUTCFullYear() + 1, d0.getUTCMonth(), d0.getUTCDate()); r.cmrOfferDue = new Date(due).toISOString().slice(0, 10); r.daysLeft = Math.round((due - asOf.getTime()) / DAY); r.basis = 'one year after the last CMR offer'; }
      else r.basis = 'carried over from last year with no last CMR offer date entered';
    }
    // Quarters with no TMR, through the as-of date.
    const through = Math.min(lastDay, asOf.getTime());
    r.quartersWithoutTmr = [];
    for (let q = 0; q < 4; q += 1) {
      const qs = Date.UTC(year, q * 3, 1); const qe = Date.UTC(year, q * 3 + 3, 0);
      if (qe < from || qs > through) continue;
      if (!e.tmrs.some((t) => t >= qs && t <= qe)) r.quartersWithoutTmr.push(`Q${q + 1}`);
    }
    // Completion rate.
    let why = null;
    if (e.age < 18) why = 'under 18 at the start of the year';
    else if (!e.met) why = 'did not meet the CMS targeting criteria';
    else if (e.hospice) why = 'in hospice during the year';
    else if (days < 60 && !r.cmrInYear) why = 'enrolled under 60 days with no CMR';
    r.inDenominator = why === null; r.reason = why;
    if (why === null) { den += 1; if (r.cmrInYear) num += 1; } else bump(why);
    out.push(r);
  }
  const work = out.filter((r) => r.daysLeft !== undefined).sort((a, b) => a.daysLeft - b.daysLeft);
  const overdue = work.filter((r) => r.daysLeft < 0).length;
  const rate = den ? Math.round((num / den) * 1000) / 10 : null;
  const notes = [`As of ${say(asOf)}, contract year ${year}: ${list.length} enrollee${list.length === 1 ? '' : 's'}.`];
  notes.push(den ? `CMR completion rate: ${num} of ${den} (${rate}%).` : 'CMR completion rate: no enrollee is in the denominator.');
  const ex = Object.entries(excluded);
  if (ex.length) notes.push(`Left out of the rate: ${ex.map(([k, n]) => `${n} ${k}`).join('; ')}.`);
  for (const r of work) notes.push(`${r.enrollee}: CMR offer due ${say(new Date(r.cmrOfferDue + 'T00:00:00Z'))} (${r.basis}); ${r.daysLeft < 0 ? `${-r.daysLeft} day${r.daysLeft === -1 ? '' : 's'} past` : `${r.daysLeft} day${r.daysLeft === 1 ? '' : 's'} left`}.`);
  for (const r of out) {
    if (r.basis && r.cmrOfferDue === undefined) notes.push(`${r.enrollee}: ${r.basis}, so no offer date is shown.`);
    if (r.quartersWithoutTmr.length) notes.push(`${r.enrollee}: no TMR on record in ${r.quartersWithoutTmr.join(', ')}.`);
    if (!r.cmrInYear) notes.push(`${r.enrollee}: no CMR in ${year} during MTM enrollment.`);
  }
  notes.push('The regulation requires an annual CMR and quarterly TMRs (42 CFR 423.153(d)(1)(vii)). The 60-day offer for a newly targeted member and the one-year offer for a continuing member are CMS guidance ("should"), not regulation text. A quarter still under way is listed if it has no TMR yet.');
  notes.push(`Days enrolled count the enrollment date and not the opt-out date. The completion measure is on CMS's display page for measurement years 2025 and 2026 and returns to the Star Ratings with the 2029 ratings (measurement year 2027); no star cut point is shown.`);
  notes.push(POSTURE);
  return { valid: true, contractYear: year, denominator: den, numerator: num, ratePercent: rate, overdueOffers: overdue, rows: out, flag: overdue ? 'offers-past-due' : 'worklist', abnormal: overdue > 0,
    band: `${overdue} CMR offer${overdue === 1 ? '' : 's'} past due; completion ${den ? `${num} of ${den} (${rate}%)` : 'has no denominator'}.`, bandLabel: `${work.length} on the offer worklist`, notes, note: notes.join(' ') };
}
