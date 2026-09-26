// spec-v1503 tools 3 and 4: Medicare Advantage organization-determination clock and appeal ladder.
//
// Read in the eCFR on 2026-09-25 (title 42, part 422, subpart M):
//   422.568(b)(1) standard organization determination: "(i) For a service or item not subject to
//     the prior authorization rules in § 422.122, 14 calendar days after receiving the request ...
//     (ii) Beginning on or after January 1, 2026, for a service or item subject to the prior
//     authorization rules in § 422.122, 7 calendar days". (b)(2) "may extend the timeframe by up to
//     14 calendar days" (enrollee asks, non-contract information, extraordinary circumstances).
//     (b)(3) Part B drug: "72 hours after receipt of the request. This 72-hour period may not be
//     extended".
//   422.572 expedited: "72 hours after receiving the request", extendable "by up to 14 calendar
//     days"; Part B drug "24 hours".
//   422.570(d): a refused expedite is processed "using the 14-day timeframe for standard
//     determinations" -- wording the 2026 prior-authorization change did not update.
//   422.582(b) reconsideration filed "within 60 calendar days after receipt", receipt "presumed to
//     be 5 calendar days after the date of the written organization determination".
//   422.590: 30 calendar days (service), 60 (payment), 7 (Part B drug, not extendable), 72 hours
//     expedited (Part B drug not extendable); a decision that "affirms, in whole or in part" goes to
//     the independent entity within the same deadline.
//   422.602: ALJ hearing "within 60 calendar days of receipt of the notice of a reconsidered
//     determination", receipt presumed 5 calendar days after its date.
//
// Pure: no DOM, no clock.

import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { longDate, aicFor } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The plan\'s notice and contract control.';

export const MA_REQUESTS = [
  { value: 'standard-service', text: 'Standard, item or service without prior authorization' },
  { value: 'standard-pa', text: 'Standard, item or service needing prior authorization' },
  { value: 'standard-partb', text: 'Standard, Part B drug' },
  { value: 'expedited-service', text: 'Expedited, item or service' },
  { value: 'expedited-partb', text: 'Expedited, Part B drug' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const SPEC = {
  'standard-service': { days: 14, ext: true, rule: '42 CFR 422.568(b)(1)(i)' },
  'standard-pa': { days: 7, ext: true, rule: '42 CFR 422.568(b)(1)(ii)' },
  'standard-partb': { hours: 72, ext: false, rule: '42 CFR 422.568(b)(3)' },
  'expedited-service': { hours: 72, ext: true, rule: '42 CFR 422.572' },
  'expedited-partb': { hours: 24, ext: false, rule: '42 CFR 422.572' },
};

export function maOrgDeterminationClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = SPEC[o.requestType];
  if (!s) return { valid: false, message: 'Choose the kind of request.' };
  const rec = parseDateTime(o.received);
  if (rec === null) return { valid: false, message: 'Enter the date and time the plan received the request (YYYY-MM-DDTHH:MM).' };
  const extended = o.extended === 'yes' || o.extended === 'no' ? o.extended : null;
  const notes = [];
  let days = s.days;
  if (o.requestType === 'standard-pa' && o.received.slice(0, 10) < '2026-01-01') {
    days = 14;
    notes.push('Received before January 1, 2026, so the 14-day window applied; 7 days applies from that date.');
  }
  const at = (extra) => {
    if (s.hours) return { wall: addHours(rec, s.hours + extra * 24).endWall, text: null };
    const d = addCalendarDaysUtc(parseIsoStrict(o.received.slice(0, 10)), days + extra);
    return { date: d, text: `${longDate(d)} (${days + extra} calendar days after receipt)` };
  };
  const show = (r) => (r.text ? r.text : formatDeadline(rec, r.wall, 'receipt'));
  const isoT = (r) => (r.date ? fmtUtc(r.date) : new Date(r.wall).toISOString().slice(0, 16));
  const iso = (r) => isoT(r).replace('T', ' ');
  const base = at(0);
  let band;
  let label;
  let deadline;
  if (!s.ext) {
    band = `${s.rule}: decision due ${show(base, 0)}. This window cannot be extended.`;
    label = `Due ${iso(base)}`;
    deadline = isoT(base);
    if (extended === 'yes') notes.push('An extension was entered, but this window cannot be extended, so it was not applied.');
  } else {
    const ext = at(14);
    if (extended === 'yes') {
      band = `${s.rule}: decision due ${show(ext, 14)}, with the 14-day extension, which needs written notice to the enrollee.`;
      label = `Due ${iso(ext)} (extended)`; deadline = isoT(ext);
    } else if (extended === 'no') {
      band = `${s.rule}: decision due ${show(base, 0)}.`;
      label = `Due ${iso(base)}`; deadline = isoT(base);
    } else {
      band = `${s.rule}: decision due ${show(base, 0)}; with a 14-day extension noticed in writing, ${show(ext, 14)}.`;
      label = `Due ${iso(base)}, or ${iso(ext)} if extended`; deadline = isoT(base);
      notes.push('No extension was entered, so both dates are given: choose whether the plan extended to get one.');
    }
    notes.push('An extension is allowed only when the enrollee asks for it, or when the plan needs information from a non-contract provider or faces extraordinary circumstances, and the extension is in the enrollee\'s interest.');
  }
  if (o.requestType === 'standard-pa') {
    notes.push('A discrepancy in the rule: 42 CFR 422.570(d) still describes a refused expedite as moving to "the 14-day timeframe", although prior-authorization requests now carry 7 days. This tool applies the 7 days.');
  }
  notes.push('A plan that misses the deadline has made an adverse decision that the enrollee may appeal; unlike Part D, the case is not forwarded automatically at this level.');
  return { valid: true, deadline, band, bandLabel: label, notes, note: POSTURE };
}

export const MA_LEVELS = [
  { value: 'organization', text: 'Organization determination (plan)' },
  { value: 'reconsideration', text: 'Reconsideration (plan, or the independent entity)' },
];

function receiptOf(o) {
  let notice;
  try { notice = parseIsoStrict(String(o.noticeDate ?? '').trim(), 'the notice date'); } catch { return { error: 'Enter the date printed on the decision notice (YYYY-MM-DD).' }; }
  if (!String(o.receivedDate ?? '').trim()) {
    const r = addCalendarDaysUtc(notice, 5);
    return { notice, receipt: r, text: `${longDate(r)}, presumed 5 calendar days after the notice date` };
  }
  let r;
  try { r = parseIsoStrict(String(o.receivedDate).trim(), 'the receipt date'); } catch { return { error: 'Enter the receipt date as YYYY-MM-DD, or leave it blank to use the 5-day presumption.' }; }
  if (r < notice) return { error: 'Enter the receipt date again: it cannot come before the notice date.' };
  return { notice, receipt: r, text: `${longDate(r)}, the receipt date entered (it replaces the 5-day presumption only with evidence of later receipt)` };
}

export function maAppealLadder(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const level = MA_LEVELS.some((l) => l.value === o.level) ? o.level : null;
  if (!level) return { valid: false, message: 'Choose the level whose decision notice you have.' };
  const r = receiptOf(o);
  if (r.error) return { valid: false, message: r.error };
  const due = addCalendarDaysUtc(r.receipt, 60);
  const notes = [`Receipt: ${r.text}.`];
  let band;
  let label = `File by ${fmtUtc(due)}`;
  if (level === 'organization') {
    band = `42 CFR 422.582: request reconsideration by the plan within 60 calendar days of receiving the notice, so by ${longDate(due)}.`;
    notes.push('The plan decides within 30 calendar days for an item or service, 60 for a payment request, 7 for a Part B drug (not extendable), or 72 hours expedited (42 CFR 422.590).');
    notes.push('If the plan upholds any part of the denial, it must send the case to the independent review entity itself, within that same deadline; so must a plan that misses its deadline. The entity\'s own decision time is set by its CMS contract, not by a regulation.');
  } else {
    band = `42 CFR 422.602: request an ALJ hearing within 60 calendar days of receiving the reconsidered determination, so by ${longDate(due)}.`;
    const raw = String(o.amount ?? '').trim();
    const aic = aicFor(due);
    if (aic.expired) notes.push(`No amount in controversy is published yet for requests filed in ${aic.year}.`);
    else if (raw === '') notes.push(`An ALJ hearing needs at least $${aic.value} in controversy (${aic.edition}). Enter the amount at stake to check it.`);
    else {
      const amt = Number(raw);
      if (!Number.isFinite(amt) || amt < 0 || amt > 1e9) return { valid: false, message: 'Enter the amount at stake in dollars, 0 or more.' };
      const ok = amt >= aic.value;
      notes.push(`Amount at stake $${amt.toLocaleString('en-US')} ${ok ? 'meets' : 'is below'} the ${aic.edition} ALJ threshold of $${aic.value}.`);
      if (!ok) label = `Below the $${aic.value} ALJ threshold`;
    }
  }
  notes.push('Past the deadline, the next level may still accept the request for good cause; the notice explains how.');
  return { valid: true, deadline: fmtUtc(due), band, bandLabel: label, notes, note: POSTURE };
}
