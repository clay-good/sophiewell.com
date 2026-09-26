// spec-v1503 tool 5: employer group health plan claim and appeal clock (ERISA).
//
// Read in the eCFR on 2026-09-25, 29 CFR 2560.503-1:
//   (f)(2)(i) urgent care: "not later than 72 hours after receipt of the claim by the plan"; an
//     incomplete claim gets notice "not later than 24 hours", the claimant "not less than 48 hours",
//     and a decision "no later than 48 hours after the earlier of" the plan's receipt of the
//     information or the end of that period.
//   (f)(2)(ii) concurrent care: "within 24 hours after receipt of the claim by the plan, provided that
//     any such claim is made to the plan at least 24 hours prior to the expiration of the prescribed
//     period of time or number of treatments".
//   (f)(2)(iii)(A) pre-service: "not later than 15 days after receipt of the claim", extendable "one
//     time by the plan for up to 15 days" with notice "prior to the expiration of the initial 15-day
//     period". (f)(2)(iii)(B) post-service: 30 days, one 15-day extension noticed within the 30.
//     An extension for missing information gives the claimant "at least 45 days", and (f)(4) tolls the
//     period "from the date on which the notification of the extension is sent to the claimant until
//     the date on which the claimant responds".
//   (h)(3)(i) an appeal window of "at least 180 days following receipt of a notification of an adverse
//     benefit determination". (i)(2) decisions on review: urgent care 72 hours; pre-service 30 days
//     for one appeal, 15 days for each of two; post-service 60 days for one appeal, 30 for each of two.
//
// Pure: no DOM, no clock.

import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The plan document and its notices control.';
export const CLAIM_TYPES = [
  { value: 'urgent', text: 'Urgent care' },
  { value: 'concurrent', text: 'Concurrent care (extending an urgent course of treatment)' },
  { value: 'pre-service', text: 'Pre-service (approval before care)' },
  { value: 'post-service', text: 'Post-service (care already given)' },
];
export const STAGES = [
  { value: 'claim', text: 'The plan is deciding the claim' },
  { value: 'appeal', text: 'The plan is deciding an appeal' },
];
export const LEVELS = [
  { value: 'one', text: 'The plan has one level of appeal' },
  { value: 'two', text: 'The plan has two levels of appeal' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

function dateOf(s) { try { return parseIsoStrict(String(s ?? '').trim().slice(0, 10)); } catch { return null; } }

export function erisaClaimClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = CLAIM_TYPES.some((t) => t.value === o.claimType) ? o.claimType : null;
  const stage = STAGES.some((t) => t.value === o.stage) ? o.stage : null;
  if (!type) return { valid: false, message: 'Choose the kind of claim.' };
  if (!stage) return { valid: false, message: 'Choose whether the plan is deciding the claim or an appeal.' };
  const hourly = type === 'urgent' || type === 'concurrent';
  const recWall = hourly ? parseDateTime(o.received) : null;
  const recDate = hourly ? null : dateOf(o.received);
  if (hourly && recWall === null) return { valid: false, message: 'Enter the date and time the plan received it (YYYY-MM-DDTHH:MM): this clock runs in hours.' };
  if (!hourly && !recDate) return { valid: false, message: 'Enter the date the plan received it (YYYY-MM-DD).' };
  const notes = [];
  const hoursOut = (h, rule) => {
    const end = addHours(recWall, h).endWall;
    return { deadline: new Date(end).toISOString().slice(0, 16), text: `${rule}: decision due ${formatDeadline(recWall, end, 'receipt')}.`, label: `Due ${new Date(end).toISOString().slice(0, 16).replace('T', ' ')}` };
  };
  const daysOut = (d, rule, why) => {
    const end = addCalendarDaysUtc(recDate, d);
    return { deadline: fmtUtc(end), text: `${rule}: decision due ${longDate(end)} (${d} days after receipt${why ? `, ${why}` : ''}).`, label: `Due ${fmtUtc(end)}` };
  };
  let r;
  if (stage === 'claim') {
    if (type === 'urgent') {
      r = hoursOut(72, '29 CFR 2560.503-1(f)(2)(i)');
      notes.push('If the claim is incomplete, the plan must say what is missing within 24 hours, give at least 48 hours to supply it, and then decide within 48 hours of the earlier of receiving it or the end of that period.');
    } else if (type === 'concurrent') {
      r = hoursOut(24, '29 CFR 2560.503-1(f)(2)(ii)');
      notes.push('The 24 hours apply only when the request was made at least 24 hours before the approved course of treatment ends.');
    } else {
      const base = type === 'pre-service' ? 15 : 30;
      const rule = type === 'pre-service' ? '29 CFR 2560.503-1(f)(2)(iii)(A)' : '29 CFR 2560.503-1(f)(2)(iii)(B)';
      const ext = o.extended === 'yes' || o.extended === 'no' ? o.extended : null;
      if (ext === 'yes') {
        const notice = String(o.extensionNotice ?? '').trim() ? dateOf(o.extensionNotice) : null;
        if (String(o.extensionNotice ?? '').trim() && !notice) return { valid: false, message: 'Enter the extension notice date as YYYY-MM-DD, or leave it blank.' };
        r = daysOut(base + 15, rule, 'with the one 15-day extension');
        if (notice) {
          const last = addCalendarDaysUtc(recDate, base);
          if (notice > last) {
            r = daysOut(base, rule, 'the extension notice came too late to count');
            notes.push(`The extension notice is dated ${longDate(notice)}, after the initial ${base}-day period ended on ${longDate(last)}, so the extension does not count.`);
          } else notes.push(`The extension notice (${longDate(notice)}) came within the initial ${base} days, as the rule requires.`);
        } else notes.push(`The extension counts only if the plan noticed it before the initial ${base} days ended. Enter the notice date to check.`);
      } else if (ext === 'no') {
        r = daysOut(base, rule);
      } else {
        const a = daysOut(base, rule);
        const b = addCalendarDaysUtc(recDate, base + 15);
        r = { ...a, text: `${a.text.slice(0, -1)}; ${longDate(b)} if the plan took its one 15-day extension.`, label: `${a.label}, or ${fmtUtc(b)} if extended` };
        notes.push('No extension was entered, so both dates are given: choose whether the plan extended to get one.');
      }
      notes.push('When the extension is for missing information, the claimant gets at least 45 days to respond and the clock stops from the extension notice until the response.');
    }
  } else {
    if (type === 'concurrent') return { valid: false, message: 'Choose urgent care or pre-service for an appeal: a concurrent-care appeal is decided on one of those clocks.' };
    const lv = o.levels === 'one' || o.levels === 'two' ? o.levels : null;
    if (type === 'urgent') r = hoursOut(72, '29 CFR 2560.503-1(i)(2)(i)');
    else if (!lv) return { valid: false, message: 'Choose whether the plan has one or two levels of appeal: the deadline depends on it.' };
    else if (type === 'pre-service') r = daysOut(lv === 'one' ? 30 : 15, '29 CFR 2560.503-1(i)(2)(ii)', lv === 'two' ? 'for each of the two levels' : null);
    else r = daysOut(lv === 'one' ? 60 : 30, '29 CFR 2560.503-1(i)(2)(iii)', lv === 'two' ? 'for each of the two levels' : null);
  }
  if (String(o.denialReceived ?? '').trim()) {
    const d = dateOf(o.denialReceived);
    if (!d) return { valid: false, message: 'Enter the date the denial was received as YYYY-MM-DD, or leave it blank.' };
    notes.push(`To appeal a denial received ${longDate(d)}, the plan must allow at least 180 days: until ${longDate(addCalendarDaysUtc(d, 180))} at the earliest (29 CFR 2560.503-1(h)(3)(i)).`);
  } else {
    notes.push('A plan must allow at least 180 days after a denial is received to file an appeal; enter the date the denial was received to count it.');
  }
  notes.push('Plans that are not governed by ERISA, such as government and church plans, follow other rules.');
  return { valid: true, deadline: r.deadline, band: r.text, bandLabel: r.label, notes, note: POSTURE };
}
