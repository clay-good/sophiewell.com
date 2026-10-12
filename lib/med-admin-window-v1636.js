// spec-v1636 tool 20: was this dose given inside the CMS window?
//
// Source: CMS State Operations Manual, Appendix A (Rev. 248, issued September 18, 2026), tag A-0405
// (the tag's own line reads Rev. 200, issued February 21, 2020), interpretive guidelines for 42 CFR
// 482.23(c), re-read October 12, 2026:
//   "scheduled medications identified under the hospital's policies and procedures as time-critical
//    must be administered within thirty minutes before or after their scheduled dosing time, for a
//    total window of 1 hour."
//   "Medications prescribed for daily, weekly or monthly administration may be within 2 hours before
//    or after the scheduled dosing time, for a total window that does not exceed 4 hours."
//   "Medications prescribed more frequently than daily but no more frequently than every 4 hours may
//    be administered within 1 hour before or after the scheduled dosing time, for a total window
//    that does not exceed 2 hours."
//   Among the examples of time-critical medications: "Medications prescribed more frequently than
//    every 4 hours."
// These are the outer limits surveyors check. Which drugs are time-critical is the hospital's
// policy, and a policy may be tighter; a tighter window is accepted as an entry.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const FREQUENCIES = [
  { value: 'daily-weekly-or-monthly', text: 'Daily, weekly or monthly' },
  { value: 'several-doses-a-day', text: 'More often than daily, but no more often than every 4 hours' },
  { value: 'more-often-than-q4h', text: 'More often than every 4 hours' },
];
export const CLASSES = [
  { value: 'policy-critical', text: 'Time-critical under the hospital\'s policy' },
  { value: 'policy-not-critical', text: 'Not time-critical under the hospital\'s policy' },
];
const NOTE = 'The outer limits CMS tells surveyors to check, applied to one dose. Which medications are time-critical is set by the hospital\'s own policy, which may be tighter. A dose outside the window is a finding to review, not by itself an error with harm.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const MIN = 60000;

// 'YYYY-MM-DDTHH:MM' (a datetime-local value) -> a wall-clock instant, or null.
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const clock = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const span = (min) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`);

export function medAdminWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sched = parseWhen(o.scheduled);
  if (sched === null) return { valid: false, message: 'Enter the scheduled time as a date and time (YYYY-MM-DDTHH:MM).' };
  const actual = parseWhen(o.actual);
  if (actual === null) return { valid: false, message: 'Enter the time the dose was given as a date and time (YYYY-MM-DDTHH:MM).' };
  const freq = FREQUENCIES.find((x) => x.value === String(o.frequency ?? '').trim());
  if (!freq) return { valid: false, message: 'Choose the order\'s frequency: the window for a medication that is not time-critical depends on it.' };
  const cls = CLASSES.find((x) => x.value === String(o.policyClass ?? '').trim());
  if (!cls) return { valid: false, message: 'Choose whether the hospital\'s policy classes this medication as time-critical. CMS leaves that classification to the hospital.' };
  let tighter = null;
  if (!blank(o.policyMinutes)) {
    const f = inputFault([['the hospital\'s window', o.policyMinutes, null, 240, 'minutes']]);
    if (f) return { valid: false, message: f };
    tighter = Number(o.policyMinutes);
  }
  const critical = cls.value === 'policy-critical';
  const often = freq.value === 'more-often-than-q4h';
  const notes = [];
  if (often && !critical) {
    return { valid: true, flag: 'no-cms-window-for-this-class', abnormal: true, band: 'CMS gives no window for this combination. Its windows for medications that are not time-critical stop at orders no more frequent than every 4 hours, and it lists medications prescribed more often than every 4 hours among its examples of time-critical medications. Check the policy class.', bandLabel: 'No CMS window',
      notes: ['If the hospital\'s policy does class this medication as time-critical, the window is 30 minutes before or after.'], note: NOTE };
  }
  const cms = critical ? 30 : freq.value === 'daily-weekly-or-monthly' ? 120 : 60;
  if (tighter !== null && tighter > cms) return { valid: false, message: `A hospital window of ${tighter} minutes each side is wider than the CMS outer limit of ${cms} minutes for this medication. Enter a window of ${cms} minutes or less, or clear it.` };
  const half = tighter ?? cms;
  const diff = Math.round((actual - sched) / MIN);
  const onTime = Math.abs(diff) <= half;
  const dir = diff === 0 ? 'at the scheduled time' : `${span(Math.abs(diff))} ${diff > 0 ? 'late' : 'early'}`;
  notes.push(`CMS outer limit for this medication: ${span(cms)} before or after the scheduled time (a total window of ${span(cms * 2)}): ${critical ? 'time-critical under the hospital\'s policy' : freq.value === 'daily-weekly-or-monthly' ? 'not time-critical, prescribed daily, weekly or monthly' : 'not time-critical, prescribed more often than daily but no more often than every 4 hours'}.`);
  if (tighter !== null) { notes.push(`Window used: the hospital's ${span(tighter)} before or after, as entered.`); if (!onTime && Math.abs(diff) <= cms) notes.push(`The dose is outside the hospital's window but inside the CMS outer limit of ${span(cms)}.`); }
  notes.push(`Acceptable from ${clock(sched - half * MIN)} to ${clock(sched + half * MIN)}; given at ${clock(actual)}, ${dir}.`);
  if (often) notes.push('CMS lists medications prescribed more often than every 4 hours among its examples of time-critical medications.');
  notes.push('The manual says hospital policy must address what is done when a dose is not given within its window.', 'Times are read as written; a daylight-saving change in between is not adjusted for.');
  return {
    valid: true, flag: onTime ? 'inside-window' : 'outside-window', abnormal: !onTime, onTime, minutesFromScheduled: diff, windowMinutesEachSide: half, earliest: clock(sched - half * MIN), latest: clock(sched + half * MIN),
    band: `${onTime ? 'Inside' : 'Outside'} the window: given ${dir}; the window is ${span(half)} before or after (${clock(sched - half * MIN)} to ${clock(sched + half * MIN)}).`,
    bandLabel: onTime ? 'Inside the window' : `${span(Math.abs(diff))} ${diff > 0 ? 'late' : 'early'}`, notes, note: NOTE,
  };
}
