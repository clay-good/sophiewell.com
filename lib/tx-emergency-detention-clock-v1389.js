// spec-v1389: the Texas emergency detention clock.
//
// Source: Tex. Health & Safety Code s.573.021(b)-(c) (Acts 2017, S.B. 344). S.B. 1164 (2025)
// amended the detention criteria in ch. 573 and left this time rule unchanged.
//
//   (b) A person accepted for a preliminary examination may be detained "for not longer than 48
//       hours after the time the person is presented to the facility" unless a written order for
//       protective custody is obtained. The 48 hours INCLUDE "any time the patient spends waiting in
//       the facility for medical care before the person receives the preliminary examination."
//       "If the 48-hour period ends on a Saturday, Sunday, legal holiday, or before 4 p.m. on the
//       first succeeding business day, the person may be detained until 4 p.m. on the first
//       succeeding business day. If the 48-hour period ends at a different time, the person may be
//       detained only until 4 p.m. on the day the 48-hour period ends." A judge or magistrate may,
//       by written order made each day, extend by 24 hours for extremely hazardous weather or a
//       disaster.
//   (c) A physician examines the person "as soon as possible within 12 hours after the time the
//       person is apprehended."
//
// THE ROLL-FORWARD IS THE REASON THE TILE EXISTS. A Friday 6 p.m. presentation's 48 hours end
// Sunday 6 p.m.; detention may run to 4 p.m. Monday -- or Tuesday if Monday is a holiday.
//
// WHERE THE STATUTE CAN BE READ TWO WAYS, THE TILE SAYS SO. When the 48 hours end on a business
// day, one reading ends detention at 4 p.m. that day (the second sentence); the other reads that
// time as "before 4 p.m. on the first succeeding business day" and runs to 4 p.m. on the next
// business day (the first sentence). Each reading leaves one sentence with nothing to do. The tile
// prints both and gives the earlier as the time to have the protective custody order in hand.
//
// Texas's five staffed state holidays (Confederate Heroes, Texas Independence, San Jacinto,
// Emancipation, LBJ Days) keep offices open; whether each is a "legal holiday" here is for the
// court, and the tile flags one when it touches the count.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import {
  parseDateTime, addHours, isBusinessDay, isLegalHoliday, nextBusinessDay, formatDeadline, scopeSentence,
} from './state-calendar.js';

export const TX_ED_VERIFIED = '2026-09-18';
export const TX_ED_NOTE = 'Tex. Health & Safety Code s.573.021: detention without a protective custody order runs no longer than 48 hours after the person is presented to the facility, counting time spent waiting in the facility for medical care. A period ending on a Saturday, Sunday, or legal holiday runs to 4 p.m. on the first succeeding business day; a judge or magistrate may extend it 24 hours at a time, by a daily written order, for hazardous weather or a disaster. A physician examines the person within 12 hours of apprehension.';

const DAY = 86400000;
const HOUR = 3600000;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function dayOf(wall) { return Math.floor(wall / DAY) * DAY; }
function at4pm(dayMs) { return dayMs + 16 * HOUR; }
function iso(t) { return new Date(t).toISOString().slice(0, 10); }

export function txEmergencyDetentionClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.presented)) {
    return { valid: false, message: 'Enter the time the person was presented to the facility. The 48 hours run from presentation, and without it no deadline is printed.' };
  }
  const presented = parseDateTime(o.presented);
  if (presented === null) return { valid: false, message: 'Enter the presentation time as a date and time.' };

  let apprehended = null;
  if (!isBlank(o.apprehended)) {
    apprehended = parseDateTime(o.apprehended);
    if (apprehended === null) return { valid: false, message: 'Enter the apprehension time as a date and time, or leave it blank.' };
    if (apprehended > presented) return { valid: false, message: 'The apprehension time is after the presentation time. Check the two times.' };
  }

  let extensions = 0;
  if (!isBlank(o.extensions)) {
    extensions = Number(String(o.extensions).trim());
    if (!Number.isInteger(extensions) || extensions < 0 || extensions > 14) {
      return { valid: false, message: 'Enter the number of daily 24-hour weather or disaster extensions ordered, from 0 to 14.' };
    }
  }

  const end48 = addHours(presented, 48);
  const endDay = dayOf(end48.endWall);
  const endHoliday = isLegalHoliday('TX', endDay);
  const endsOffDay = !isBusinessDay('TX', endDay);

  let earliest;
  let latest;
  let rule;
  if (endsOffDay) {
    const nbd = Date.parse(nextBusinessDay('TX', endDay) + 'T00:00:00Z');
    earliest = at4pm(nbd);
    latest = earliest;
    const why = endHoliday && endHoliday.kind === 'closure' ? endHoliday.name : (new Date(endDay).getUTCDay() === 0 ? 'a Sunday' : 'a Saturday');
    rule = `The 48 hours end on ${why}, so detention may run to 4 p.m. on the first succeeding business day.`;
  } else {
    const sameDay = at4pm(endDay);
    const nbd = Date.parse(nextBusinessDay('TX', endDay) + 'T00:00:00Z');
    earliest = sameDay;
    latest = at4pm(nbd);
    rule = 'The 48 hours end on a business day. Section 573.021(b) reads two ways here: detention ends at 4 p.m. on the day the 48 hours end, or, reading that time as "before 4 p.m. on the first succeeding business day," at 4 p.m. on the next business day. The earlier is the time to have the protective custody order in hand.';
  }
  const ext = extensions * 24 * HOUR;
  const earliestEnd = earliest + ext;
  const latestEnd = latest + ext;

  const flags = [];
  for (let t = dayOf(presented); t <= dayOf(latestEnd); t += DAY) {
    const h = isLegalHoliday('TX', t);
    if (h && h.kind === 'staffed') flags.push(`${h.name} (${iso(t)}) is a Texas state holiday on which offices stay staffed. It is counted as a business day here; whether it is a "legal holiday" for s.573.021 is for the court.`);
  }
  if (earliest < end48.endWall) {
    flags.push('Read this way, the 4 p.m. deadline falls BEFORE the 48 hours have run: the statute ends detention at 4 p.m. on the day the period ends, not at the 48th hour.');
  }

  const deadlines = [
    { label: '48 hours from presentation (waiting time counted)', at: end48.end, text: formatDeadline(presented, end48.endWall, 'presentation') },
  ];
  if (apprehended !== null) {
    const exam = addHours(apprehended, 12);
    deadlines.unshift({ label: 'Physician examination, within 12 hours of apprehension (s.573.021(c))', at: exam.end, text: formatDeadline(apprehended, exam.endWall, 'apprehension') });
  }
  deadlines.push({ label: extensions ? `Detention may continue until, with ${extensions} daily extension${extensions === 1 ? '' : 's'}` : 'Detention may continue until', at: new Date(earliestEnd).toISOString().slice(0, 16), text: formatDeadline(presented, earliestEnd, 'presentation') });
  if (latestEnd !== earliestEnd) {
    deadlines.push({ label: 'Under the other reading of s.573.021(b)', at: new Date(latestEnd).toISOString().slice(0, 16), text: formatDeadline(presented, latestEnd, 'presentation') });
  }

  return {
    valid: true,
    end48: end48.end,
    detainUntil: new Date(earliestEnd).toISOString().slice(0, 16),
    detainUntilOtherReading: latestEnd !== earliestEnd ? new Date(latestEnd).toISOString().slice(0, 16) : null,
    ambiguous: latestEnd !== earliestEnd,
    abnormal: false,
    bandLabel: `Detention may continue until ${formatDeadline(presented, earliestEnd, 'presentation')}`,
    band: `Detention without a protective custody order may continue until ${formatDeadline(presented, earliestEnd, 'presentation')}. ${rule}`,
    deadlines,
    flags,
    caveats: end48.caveats,
    postureNote: scopeSentence(TX_ED_VERIFIED),
    note: TX_ED_NOTE,
  };
}
