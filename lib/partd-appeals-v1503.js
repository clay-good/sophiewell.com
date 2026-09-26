// spec-v1503 tools 1 and 2: Medicare Part D coverage-determination clock and appeal ladder.
//
// Every number read in the eCFR on 2026-09-25 (title 42, part 423, subpart M):
//   423.568(b) standard coverage determination: "no later than 72 hours after receipt of the
//     request"; a standard exception, 72 hours "after receipt of the physician's or other
//     prescriber's supporting statement" or, with none, "72 hours from the end of 14 calendar days
//     from receipt of the exceptions request". 423.568(c) payment request: "14 calendar days
//     after receipt of the request". 423.568(h) and 423.572: a missed deadline "constitutes an
//     adverse coverage determination, and the plan sponsor must forward the enrollee's request to
//     the IRE within 24 hours of the expiration of the adjudication timeframe".
//   423.572(a) expedited: "no later than 24 hours after receiving the request" (exceptions: after
//     the supporting statement, or 24 hours from the end of 14 calendar days).
//   423.570(d) expedite refused: decide "within the 72-hour timeframe ... The 72-hour period begins
//     on the day the Part D plan sponsor receives the request for expedited determination", and
//     deliver written notice "within 3 calendar days".
//   423.578(a)(4) the supporting statement: the preferred drugs would not be as effective, would
//     have adverse effects, or both. 423.578(c): an approved exception continues for refills while
//     the drug is prescribed, stays safe, and the enrollment period has not expired.
//   423.582(b) redetermination: filed "within 60 calendar days after receipt" of the notice,
//     receipt "presumed to be 5 calendar days after the date" of it. 423.590: 7 calendar days
//     standard, 14 calendar days payment, 72 hours expedited. 423.600: reconsideration by the IRE
//     within 60 calendar days after receipt (same presumption), decided within the 423.590
//     deadlines. 423.2002: ALJ hearing within 60 calendar days after receipt of the IRE decision
//     (same presumption), if the amount in controversy is met. 423.2016: decided within 90
//     calendar days, 10 calendar days expedited.
//   Amounts in controversy: Federal Register 2025-21879 (CY2026: $200 ALJ, $1,960 court) and
//     2026-19016 (CY2027: $200 ALJ, $2,000 court, "effective for requests ... filed on or after
//     January 1, 2027").
//
// Pure: no DOM, no clock (the caller passes every date).

import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { datedValue } from './dated-data.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The plan\'s notice and contract control.';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (dt) => `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
const plusDaysWall = (wall, days) => wall + days * 86400000;

export const REQUEST_TYPES = [
  { value: 'standard', text: 'Standard coverage determination' },
  { value: 'exception', text: 'Standard exception (formulary or tiering)' },
  { value: 'expedited', text: 'Expedited coverage determination' },
  { value: 'expedited-exception', text: 'Expedited exception' },
  { value: 'payment', text: 'Payment (reimbursement) request' },
  { value: 'expedite-refused', text: 'Expedited request the plan refused to expedite' },
];

export function partdCoverageClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = REQUEST_TYPES.some((t) => t.value === o.requestType) ? o.requestType : null;
  if (!type) return { valid: false, message: 'Choose the kind of request.' };
  const rec = parseDateTime(o.received);
  if (rec === null) return { valid: false, message: 'Enter the date and time the plan received the request (YYYY-MM-DDTHH:MM).' };
  const exception = type === 'exception' || type === 'expedited-exception';
  const hours = type === 'expedited' || type === 'expedited-exception' ? 24 : 72;
  let stmt = null;
  if (exception && String(o.statement ?? '').trim()) {
    stmt = parseDateTime(o.statement);
    if (stmt === null) return { valid: false, message: 'Enter the supporting statement\'s date and time as YYYY-MM-DDTHH:MM, or leave it blank if none has arrived.' };
    if (stmt < rec) return { valid: false, message: 'Enter the supporting statement\'s time again: it cannot come before the request.' };
  }
  const notes = [];
  let due;
  let rule;
  let dueText;
  if (type === 'payment') {
    const d = addCalendarDaysUtc(parseIsoStrict(o.received.slice(0, 10)), 14);
    dueText = `${longDate(d)} (14 calendar days after receipt)`;
    rule = '42 CFR 423.568(c)';
  } else if (exception) {
    const day14 = plusDaysWall(rec, 14);
    const fallback = addHours(day14, hours).endWall;
    if (stmt !== null) {
      const fromStmt = addHours(stmt, hours).endWall;
      due = Math.min(fromStmt, fallback);
      dueText = formatDeadline(due === fromStmt ? stmt : day14, due, due === fromStmt ? 'the supporting statement' : 'the end of day 14');
    } else {
      due = fallback;
      dueText = formatDeadline(day14, due, 'the end of day 14');
      notes.push(`No supporting statement has arrived: the plan must still decide ${hours} hours after the end of the 14th calendar day. If the statement arrives sooner, the clock runs ${hours} hours from its arrival instead.`);
    }
    rule = hours === 24 ? '42 CFR 423.572(a)' : '42 CFR 423.568(b)';
    notes.push('The prescriber\'s statement must say the preferred drugs would not be as effective for the enrollee, would have adverse effects, or both (42 CFR 423.578(a)(4)).');
    notes.push('An approved exception continues for refills while the prescriber keeps prescribing, the drug stays safe for the condition, and the enrollment period has not expired (42 CFR 423.578(c)).');
  } else {
    due = addHours(rec, hours).endWall;
    dueText = formatDeadline(rec, due, type === 'expedite-refused' ? 'receipt of the expedited request' : 'receipt');
    rule = type === 'expedited' ? '42 CFR 423.572(a)' : type === 'expedite-refused' ? '42 CFR 423.570(d)' : '42 CFR 423.568(b)';
    if (type === 'expedite-refused') notes.push('The refused request becomes a standard one, with its 72 hours counted from when the expedited request arrived; the plan must also send written notice within 3 calendar days.');
  }
  const forward = due != null ? formatDeadline(due, addHours(due, 24).endWall, 'the deadline') : null;
  notes.push(`If the plan misses the deadline, that is an adverse decision and the plan must forward the case to the independent review entity within 24 hours${forward ? `: by ${forward}` : ''} (42 CFR 423.568(h), 423.572).`);
  notes.push('Times are local wall-clock times; a deadline that crosses a daylight-saving change keeps real elapsed hours.');
  return {
    valid: true,
    deadline: due != null ? new Date(due).toISOString().slice(0, 16) : fmtUtc(addCalendarDaysUtc(parseIsoStrict(o.received.slice(0, 10)), 14)),
    band: `${rule}: decision due ${dueText}.`,
    bandLabel: `Due ${due != null ? new Date(due).toISOString().slice(0, 16).replace('T', ' ') : fmtUtc(addCalendarDaysUtc(parseIsoStrict(o.received.slice(0, 10)), 14))}`,
    notes,
    note: POSTURE,
  };
}

// --- tool 2: the appeal ladder ---------------------------------------------------------------

export const LEVELS = [
  { value: 'coverage', text: 'Coverage determination (plan)' },
  { value: 'redetermination', text: 'Redetermination (plan)' },
  { value: 'reconsideration', text: 'Reconsideration (independent review entity)' },
];
const NEXT = {
  coverage: { short: 'redetermination', name: 'redetermination by the plan', rule: '42 CFR 423.582', decides: '7 calendar days standard, 14 calendar days for a payment request, 72 hours expedited (42 CFR 423.590)' },
  redetermination: { short: 'reconsideration', name: 'reconsideration by the independent review entity', rule: '42 CFR 423.600', decides: 'the same deadlines as the plan: 7 days standard, 14 days payment, 72 hours expedited (42 CFR 423.600(d))' },
  reconsideration: { short: 'hearing', name: 'an ALJ hearing', rule: '42 CFR 423.2002', decides: '90 calendar days from receipt of the request, 10 calendar days expedited (42 CFR 423.2016)' },
};

export const DATED_AIC = {
  'medicare-aic-2026': { edition: 'CY2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'ops-medicare-aic', source: { label: 'Federal Register 2025-21879', url: 'https://www.federalregister.gov/d/2025-21879' }, values: { alj: 200, court: 1960 } },
  'medicare-aic-2027': { edition: 'CY2027', validThrough: '2027-12-31', route: 'B', ledgerId: 'ops-medicare-aic', source: { label: 'Federal Register 2026-19016', url: 'https://www.federalregister.gov/d/2026-19016' }, values: { alj: 200, court: 2000 } },
};

// The ALJ threshold for a request filed on `filed` (a Date): the amounts are set per calendar
// year of filing. A year with no published amount answers { expired: true } so the tool asks.
export function aicFor(filed) {
  const id = `medicare-aic-${filed.getUTCFullYear()}`;
  if (!DATED_AIC[id]) return { expired: true, year: filed.getUTCFullYear() };
  return datedValue(id, 'alj', filed, DATED_AIC);
}

export function partdAppealLadder(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const level = LEVELS.some((l) => l.value === o.level) ? o.level : null;
  if (!level) return { valid: false, message: 'Choose the level whose decision notice you have.' };
  let notice;
  try { notice = parseIsoStrict(String(o.noticeDate ?? '').trim(), 'the notice date'); } catch { return { valid: false, message: 'Enter the date printed on the decision notice (YYYY-MM-DD).' }; }
  let receipt = addCalendarDaysUtc(notice, 5);
  let receiptText = `${longDate(receipt)}, presumed 5 calendar days after the notice date`;
  if (String(o.receivedDate ?? '').trim()) {
    let r;
    try { r = parseIsoStrict(String(o.receivedDate).trim(), 'the receipt date'); } catch { return { valid: false, message: 'Enter the date the notice was received as YYYY-MM-DD, or leave it blank to use the 5-day presumption.' }; }
    if (r < notice) return { valid: false, message: 'Enter the receipt date again: it cannot come before the notice date.' };
    receipt = r;
    receiptText = `${longDate(r)}, the receipt date entered (it replaces the 5-day presumption only with evidence of later receipt)`;
  }
  const n = NEXT[level];
  const due = addCalendarDaysUtc(receipt, 60);
  const notes = [`Receipt: ${receiptText}.`, `Once filed, the ${n.short} is decided within ${n.decides}.`];
  let label = `File by ${fmtUtc(due)}`;
  if (level === 'reconsideration') {
    const raw = String(o.amount ?? '').trim();
    const aic = aicFor(due);
    if (aic.expired) {
      notes.push(`No amount in controversy is published yet for requests filed in ${aic.year}; check the Federal Register notice for that year.`);
    } else if (raw === '') {
      notes.push(`An ALJ hearing needs at least $${aic.value} in controversy (${aic.edition}, for requests filed that year). Enter the amount at stake to check it.`);
    } else {
      const amt = Number(raw);
      if (!Number.isFinite(amt) || amt < 0 || amt > 1e9) return { valid: false, message: 'Enter the amount at stake in dollars, 0 or more.' };
      const ok = amt >= aic.value;
      notes.push(`Amount at stake $${amt.toLocaleString('en-US')} ${ok ? 'meets' : 'is below'} the ${aic.edition} ALJ threshold of $${aic.value}.`);
      if (!ok) label = `Below the $${aic.value} ALJ threshold`;
    }
    notes.push('An expedited ALJ hearing must be asked for within 60 calendar days of the date of the written notice, not its receipt (42 CFR 423.2002(b)); that date is ' + longDate(addCalendarDaysUtc(notice, 60)) + '.');
  }
  notes.push('Past the deadline, the next level may still accept the request for good cause; the notice explains how.');
  return {
    valid: true,
    deadline: fmtUtc(due),
    band: `${n.rule}: request ${n.name} within 60 calendar days of receiving the notice, so by ${longDate(due)}.`,
    bandLabel: label,
    notes,
    note: POSTURE,
  };
}
