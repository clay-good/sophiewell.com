// spec-v1503 tool 6: the federal external review clock for group health plans and individual coverage.
//
// Read in the eCFR on 2026-09-25, 45 CFR 147.136(d):
//   (d)(2)(i) "within four months after the date of receipt of a notice ... If there is no
//     corresponding date four months after the date of receipt of such a notice, then the request must
//     be filed by the first day of the fifth month following the receipt of the notice. For example,
//     if the date of receipt of the notice is October 30, because there is no February 30, the request
//     must be filed by March 1. If the last filing date would fall on a Saturday, Sunday, or Federal
//     holiday, the last filing date is extended to the next day that is not a Saturday, Sunday, or
//     Federal holiday."
//   (d)(2)(ii) preliminary review "within five business days following the date of receipt of the
//     external review request", then written notice "within one business day after completion".
//   (d)(2)(iv) the IRO decides "within 45 days after the IRO receives the request". (d)(3) expedited:
//     72 hours, with written confirmation "within 48 hours" of an oral decision.
//   (b)(2)(ii)(F) a plan that fails to strictly adhere to the internal-appeal rules leaves the
//     claimant "deemed to have exhausted" them.
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc, fmtUtc, nextBusinessDay, isBusinessDay, deadline } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The plan\'s notice and the external reviewer control.';

// The same date n months later; if that month has no such day, the first day of the month after.
export function monthsLaterOrFirstOfNext(dt, n) {
  const y = dt.getUTCFullYear();
  const m = dt.getUTCMonth() + n;
  const cand = new Date(Date.UTC(y, m, dt.getUTCDate()));
  if (cand.getUTCDate() === dt.getUTCDate()) return cand;
  return new Date(Date.UTC(y, m + 1, 1));
}

function dateOf(s) { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } }

export function acaExternalReviewClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rec = dateOf(o.noticeReceived);
  if (!rec) return { valid: false, message: 'Enter the date the final internal denial was received (YYYY-MM-DD).' };
  const raw = monthsLaterOrFirstOfNext(rec, 4);
  const noMatch = raw.getUTCDate() === 1 && rec.getUTCDate() !== 1;
  const last = isBusinessDay(raw) ? raw : nextBusinessDay(raw);
  const notes = [];
  if (noMatch) notes.push(`There is no date four months after ${longDate(rec)} with the same day number, so the rule uses the first day of the fifth month, ${longDate(raw)}.`);
  if (last.getTime() !== raw.getTime()) notes.push(`${longDate(raw)} is a weekend day or federal holiday, so the last filing date moves to ${longDate(last)}.`);
  if (String(o.requestReceived ?? '').trim()) {
    const req = dateOf(o.requestReceived);
    if (!req) return { valid: false, message: 'Enter the date the plan received the external review request as YYYY-MM-DD, or leave it blank.' };
    const pre = parseIsoStrict(deadline({ anchor: fmtUtc(req), days: 5, basis: 'business', now: req }).deadline);
    const notice = parseIsoStrict(deadline({ anchor: fmtUtc(pre), days: 1, basis: 'business', now: pre }).deadline);
    notes.push(`The plan's preliminary review is due by ${longDate(pre)} (5 business days), and its written notice by ${longDate(notice)} (1 business day later).`);
  }
  if (String(o.iroReceived ?? '').trim()) {
    const iro = dateOf(o.iroReceived);
    if (!iro) return { valid: false, message: 'Enter the date the reviewer received the request as YYYY-MM-DD, or leave it blank.' };
    notes.push(`The independent reviewer's decision is due by ${longDate(addCalendarDaysUtc(iro, 45))} (45 days after it received the request); an expedited review is due within 72 hours, with written confirmation within 48 hours of an oral decision.`);
  } else {
    notes.push('Once assigned, the independent reviewer decides within 45 days of receiving the request, or 72 hours when expedited.');
  }
  notes.push('A plan that did not strictly follow the internal-appeal rules may leave the claimant deemed to have exhausted them, free to go straight to external review; whether that happened is a judgment this tool does not make.');
  return {
    valid: true,
    deadline: fmtUtc(last),
    band: `45 CFR 147.136(d)(2)(i): request external review within four months of receiving the final denial, so by ${longDate(last)}.`,
    bandLabel: `File by ${fmtUtc(last)}`,
    notes,
    note: POSTURE,
  };
}
