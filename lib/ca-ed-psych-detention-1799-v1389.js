// spec-v1389: California psychiatric detention in an emergency department that is not a
// county-designated 5150 facility.
//
// Source: Cal. Health & Safety Code 1799.111, as amended by SB 43 (Stats. 2023, ch. 637), effective
// January 1, 2024 (leginfo text read 2026-09-18).
//
//   (a)(3)  "The person is not detained beyond 24 hours."
//   (a)(2)  Repeated, documented efforts to find treatment; the contacts "shall commence at the
//           earliest possible time" once the physician has determined when the person will be
//           medically stable for transfer, and "shall not begin after the time when the person
//           becomes medically stable for transfer."
//   (b)     Beyond 8 hours (and under 24), two more conditions: discharge or transfer delayed by
//           the need for continuing care the hospital is providing, and the person still a danger
//           to self or others or gravely disabled in the treating clinician's opinion.
//   (f)     The person "shall be credited for the time detained, up to 24 hours, if the person is
//           placed on a subsequent 72-hour hold pursuant to Section 5150."
//
// THE TRAP: the ED hours COUNT TOWARD a later 5150. The 72 hours are shortened by them.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, elapsedHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const CA1799_VERIFIED = '2026-09-18';
export const CA1799_NOTE = 'Cal. Health & Safety Code 1799.111 (as amended by SB 43, 2024): a hospital that is not a county-designated 5150 facility may detain a person who is a danger to self or others or gravely disabled for no more than 24 hours, with documented efforts to find treatment that begin no later than the time the person becomes medically stable for transfer. Beyond 8 hours, the delay must be due to continuing care and the person must still meet the criteria. Time detained, up to 24 hours, is credited against a later 5150 hold.';

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function hrs(n) {
  const whole = Math.floor(n);
  const min = Math.round((n - whole) * 60);
  return min ? `${whole} h ${min} min` : `${whole} h`;
}

export function caEdPsychDetention1799(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.detained)) {
    return { valid: false, message: 'Enter the time the detention began. Without it no deadline is printed.' };
  }
  const d = parseDateTime(o.detained);
  if (d === null) return { valid: false, message: 'Enter the detention time as a date and time.' };

  const deadlines = [];
  const checks = [];
  const caveats = [];
  const h8 = addHours(d, 8);
  const h24 = addHours(d, 24);
  caveats.push(...h24.caveats);
  deadlines.push({ label: 'Past this, the 1799.111(b) conditions must be met (8 hours)', at: h8.end, text: formatDeadline(d, h8.endWall, 'detention') });
  deadlines.push({ label: 'Detention under 1799.111 ends (24 hours)', at: h24.end, text: formatDeadline(d, h24.endWall, 'detention') });

  let band = `Detention under 1799.111 may last no more than 24 hours, to ${formatDeadline(d, h24.endWall, 'detention')}; past ${formatDeadline(d, h8.endWall, 'detention')} the delay must be for continuing care and the person must still meet the criteria.`;
  let credit = null;
  let fiveOneFiftyEnd = null;

  if (!isBlank(o.hold5150)) {
    const h = parseDateTime(o.hold5150);
    if (h === null) return { valid: false, message: 'Enter the time the 5150 was written as a date and time, or leave it blank.' };
    if (h < d) return { valid: false, message: 'The 5150 was written before the detention began. Check the two times.' };
    const detainedHours = elapsedHours(d, h);
    credit = Math.min(24, detainedHours);
    const end = addHours(h, 72 - credit);
    fiveOneFiftyEnd = end.end;
    caveats.push(...end.caveats);
    deadlines.push({ label: `The 5150 ends (72 hours less ${hrs(credit)} credited, 1799.111(f))`, at: end.end, text: formatDeadline(h, end.endWall, 'the 5150') });
    band = `The ${hrs(credit)} held under 1799.111 are credited to the 5150, so it ends ${formatDeadline(h, end.endWall, 'the 5150')}, not 72 hours after it was written.`;
    if (detainedHours > 24) checks.push(`The 5150 was written ${hrs(detainedHours)} after the detention began, past the 24 hours 1799.111 allows.`);
  }

  if (!isBlank(o.stable) || !isBlank(o.firstContact)) {
    const s = isBlank(o.stable) ? null : parseDateTime(o.stable);
    const c = isBlank(o.firstContact) ? null : parseDateTime(o.firstContact);
    if ((!isBlank(o.stable) && s === null) || (!isBlank(o.firstContact) && c === null)) {
      return { valid: false, message: 'Enter the medically-stable time and the first placement contact as dates and times, or leave them blank.' };
    }
    if (s !== null && c !== null) {
      if (c > s) checks.push(`The first placement contact came ${hrs(elapsedHours(s, c))} after the person was medically stable for transfer; 1799.111(a)(2)(B) says the contacts shall not begin after that time.`);
      else checks.push('The placement contacts began no later than the time the person was medically stable for transfer.');
    } else {
      checks.push('Not assessed: whether the placement contacts began before the person was medically stable for transfer, which 1799.111(a)(2)(B) requires. Enter both times.');
    }
  } else {
    checks.push('Not assessed: whether the placement contacts began before the person was medically stable for transfer, which 1799.111(a)(2)(B) requires.');
  }

  return {
    valid: true,
    creditHours: credit,
    fiveOneFiftyEnd,
    abnormal: checks.some((c) => /past the 24 hours|shall not begin after/.test(c)),
    bandLabel: fiveOneFiftyEnd ? `5150 ends ${fiveOneFiftyEnd.replace('T', ' ')}` : `24 hours end ${h24.end.replace('T', ' ')}`,
    band,
    deadlines,
    checks,
    caveats,
    postureNote: scopeSentence(CA1799_VERIFIED),
    note: CA1799_NOTE,
  };
}
