// spec-v1639 tool 7: a late or missed birth control pill, by CDC's 2024 recommendations.
//
// Source, re-read October 12, 2026: CDC, U.S. Selected Practice Recommendations for Contraceptive
// Use, 2024 (MMWR Recomm Rep 2024;73(RR-3); PMC11340200). The definitions are in the text ("Late or
// Missed Doses and Side Effects from CHC Use", "Missed POPs"); the actions are in Figure 1 (combined
// pills) and Figure 5 (progestin-only pills), read on the figure images themselves.
//   Combined and drospirenone pills: "a dose is considered late when <24 hours have elapsed since
//     the dose should have been taken. A dose is considered missed if >=24 hours have elapsed".
//   Norethindrone or norgestrel pills: "a dose is considered missed if it has been >3 hours since
//     it should have been taken."
// The figures sort by hours since a pill should have been taken, so this tool does too; a pill
// count that disagrees with the hours is said, never used.
//
// This is CDC, not any product's label. Many combined-pill labels direct otherwise, and the tool
// does not choose between them.
//
// Pure: no DOM, no clock (both times are entered), no network.

import { dpSafe } from './cut-display.js';

export const PILL_TYPES = [
  { value: 'combined-estrogen-progestin', text: 'Combined pill (estrogen and progestin)' },
  { value: 'norethindrone-or-norgestrel', text: 'Progestin-only pill: norethindrone or norgestrel' },
  { value: 'drospirenone-only', text: 'Progestin-only pill: drospirenone' },
];
export const WEEKS = [
  { value: 'first-week-of-pack', text: 'The first week of hormonal pills' },
  { value: 'middle-of-pack', text: 'After the first week and before the last' },
  { value: 'last-week-of-pack', text: 'The last week of hormonal pills (for example days 15 to 21 of a 28-day pack)' },
];
export const UPSI = [{ value: 'intercourse-yes', text: 'Yes' }, { value: 'intercourse-no', text: 'No' }];
const POSTURE = 'This is what CDC states for these inputs. It is not advice for a particular patient.';
const LABEL = 'The source is CDC\'s 2024 U.S. Selected Practice Recommendations, not the product\'s label. The product\'s own label may say otherwise (many combined-pill labels direct two pills a day for two days), and the patient information in the pack is the label\'s instruction. Neither is preferred here.';
const PLACEBO = 'CDC\'s recommendations apply to hormonally active pills only, not placebo pills.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (y < 2000 || y > 2100 || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const stamp = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const dayOf = (t) => new Date(t).toISOString().slice(0, 10);
// Hours to one decimal, or more where one would put them on the other side of CDC's 3, 24 or 48 hour lines
// (23.95 hours must not print as 24 beside "less than 24 hours").
const CUTS = [3, 24, 48];
const hrs = (h) => dpSafe(h, CUTS, 1);
const hoursText = (h) => (h < 48 ? `${hrs(h)} hours` : `${hrs(h)} hours (${Math.floor(h / 24)} days and ${Math.round((h % 24) * 10) / 10} hours)`);

export function contraceptiveMissedPill(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = PILL_TYPES.find((p) => p.value === String(o.pillType ?? '').trim());
  if (!type) return { valid: false, message: 'Choose the kind of pill.' };
  const due = parseWhen(o.dueAt);
  if (due === null) return { valid: false, message: 'Enter the date and time the first late or missed hormonal pill should have been taken.' };
  const now = parseWhen(o.nowAt);
  if (now === null) return { valid: false, message: 'Enter the date and time now.' };
  const hours = (now - due) / 3600000;
  if (hours < 0) return { valid: false, message: 'Enter a time now that is after the time the pill was due.' };
  if (hours > 24 * 60) return { valid: false, message: 'Enter times no more than 60 days apart.' };
  let count = null;
  if (!blank(o.missedCount)) {
    count = Number(o.missedCount);
    if (!Number.isInteger(count) || count < 1 || count > 60) return { valid: false, message: 'Enter the number of consecutive hormonal pills missed as a whole number from 1 to 60.' };
  }
  const week = WEEKS.find((w) => w.value === String(o.week ?? '').trim()) || null;
  const upsi = UPSI.find((u) => u.value === String(o.intercourse ?? '').trim()) || null;
  const notes = [`${hoursText(hours)} since the pill was due (${stamp(due)} to ${stamp(now)}).`];
  const seventh = `If a pill is taken on ${dayOf(now)} and one each day after, the seventh consecutive pill is taken on ${dayOf(now + 6 * 86400000)}.`;
  let band; let flag; let abnormal = true;

  if (type.value === 'norethindrone-or-norgestrel') {
    if (hours <= 3) {
      band = 'Not missed by CDC\'s definition: 3 hours or less since the pill was due.'; flag = 'not-missed'; abnormal = false;
      notes.push('CDC: for norethindrone or norgestrel pills "a dose is considered missed if it has been >3 hours since it should have been taken." CDC\'s figure gives no action for a pill that is 3 hours late or less.');
    } else {
      if (!upsi) return { valid: false, message: 'Choose whether unprotected intercourse has occurred: CDC\'s emergency contraception line for this pill turns on it.' };
      band = 'Missed: more than 3 hours since the pill was due.'; flag = 'missed';
      notes.push('CDC (Figure 5): Take one pill as soon as possible.');
      notes.push('Continue taking pills daily, one each day, at the same time each day, even if it means taking two pills on the same day.');
      notes.push('Abstain from sexual intercourse or use barrier methods (e.g., condoms) until pills have been taken correctly, on time, for 2 consecutive days.');
      notes.push(`Emergency contraception should be considered (with the exception of UPA) if the patient has had unprotected sexual intercourse. Entered: ${upsi.value === 'intercourse-yes' ? 'yes, so this line applies' : 'no'}.`);
      notes.push(`CDC's comment gives the reason for the 2 days: "An estimated 48 hours of norethindrone or norgestrel POP use was deemed necessary to achieve the contraceptive effects on cervical mucus." 48 hours from ${stamp(now)} is ${stamp(now + 48 * 3600000)}.`);
    }
  } else {
    const combined = type.value === 'combined-estrogen-progestin';
    const fig = combined ? 'Figure 1' : 'Figure 5';
    if (hours < 48) {
      const late = hours < 24;
      flag = late ? 'late' : 'one-missed';
      band = late ? 'Late: less than 24 hours since the pill was due.' : 'One pill missed: 24 to under 48 hours since the pill was due.';
      abnormal = !late;
      notes.push(`CDC (${fig}): Take the late or missed pill as soon as possible.`);
      if (combined) {
        notes.push('Continue taking the remaining pills at the usual time (even if it means taking two pills on the same day).');
        notes.push('No additional contraceptive protection is needed.');
        notes.push('Emergency contraception is not usually needed but may be considered (with the exception of UPA) if hormonal pills were missed earlier in the cycle or during the last week of hormonal pills in the previous cycle.');
      } else {
        notes.push('Continue taking one pill a day until the pack is finished.');
        notes.push('No additional contraceptive protection is needed.');
      }
    } else {
      if (!week) return { valid: false, message: 'Choose which week of hormonal pills the missed pills fall in: CDC\'s list for two or more missed pills turns on it.' };
      if (week.value === 'first-week-of-pack' && !upsi) return { valid: false, message: 'Choose whether unprotected intercourse occurred in the previous 5 days: CDC\'s emergency contraception line for the first week turns on it.' };
      flag = 'two-or-more-missed';
      band = 'Two or more consecutive pills missed: 48 hours or more since a pill was due.';
      if (combined) {
        notes.push('CDC (Figure 1): Take the most recent missed pill as soon as possible. (Any other missed pills should be discarded.)');
        notes.push('Continue taking the remaining pills at the usual time (even if it means taking two pills on the same day).');
      } else {
        notes.push('CDC (Figure 5): Take the last missed pill as soon as possible.');
        notes.push('Continue taking one pill a day until the pack is finished (one or more missed pills will remain in the pack).');
      }
      notes.push(`Abstain from sexual intercourse or use barrier methods (e.g., condoms) until hormonal pills have been taken for 7 consecutive days. ${seventh}`);
      if (combined) {
        if (week.value === 'last-week-of-pack') notes.push('Because the pills were missed during the last week of hormonal pills: omit the hormone-free interval by finishing the hormonal pills in the current pack and starting a new pack the next day. If unable to start a new pack immediately, abstain from sexual intercourse or use barrier methods (e.g., condoms) until hormonal pills from a new pack have been taken for 7 consecutive days.');
        else notes.push('CDC\'s last-week line (omit the hormone-free interval) is for pills missed during the last week of hormonal pills; the week entered is not the last.');
      } else notes.push('CDC gives no last-week rule for drospirenone pills.');
      const first = week.value === 'first-week-of-pack';
      notes.push(`Emergency contraception should be considered (with the exception of UPA) if hormonal pills were missed during the first week and unprotected sexual intercourse occurred during the previous 5 days. Entered: ${first ? `the first week, intercourse ${upsi.value === 'intercourse-yes' ? 'yes, so this line applies' : 'no'}` : 'not the first week'}.`);
      notes.push('Emergency contraception may also be considered (with the exception of UPA) at other times as appropriate.');
    }
    if (count !== null && ((count >= 2) !== (hours >= 48))) notes.push(`The count entered (${count}) and the hours do not match CDC's figure, which sorts by hours: one pill is under 48 hours since it was due, two or more is 48 hours or more. The hours were used; check the time the first missed pill was due.`);
    notes.push(PLACEBO);
  }
  notes.push(LABEL);
  notes.push(POSTURE);
  return { valid: true, hoursSinceDue: hrs(hours), flag, abnormal, band, bandLabel: type.text, notes, note: notes.join(' ') };
}
