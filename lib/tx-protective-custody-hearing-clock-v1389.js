// spec-v1389: the Texas probable-cause hearing and court-ordered services hearing clocks.
//
// Sources: Tex. Health & Safety Code s.574.025(b) and s.574.005.
//
//   574.025(b) The probable-cause hearing "must be held not later than 72 hours after the time that
//              the proposed patient was detained under a protective custody order. If the period
//              ends on a Saturday, Sunday, or legal holiday, the hearing must be held on the next
//              day that is not a Saturday, Sunday, or legal holiday." A judge or magistrate may
//              postpone it 24 hours at a time for an extreme weather or disaster emergency.
//   574.005    The hearing on the application for court-ordered services is set "within 14 days
//              after the date on which the application is filed"; it may not be held in the first
//              three days after filing if the proposed patient or the attorney objects; and with
//              continuances it is held "not later than the 30th day after the date on which the
//              original application is filed."
//
// THE TRAP: 72 hours that land on a weekend or holiday roll to the next working day -- a DAY, not
// "4 p.m." as in s.573.021. The hearing is due on that day.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import {
  parseDateTime, parseDate, addHours, isBusinessDay, isLegalHoliday, nextBusinessDay, formatDeadline, scopeSentence,
} from './state-calendar.js';

export const TX_PCO_VERIFIED = '2026-09-18';
export const TX_PCO_NOTE = 'Tex. Health & Safety Code s.574.025(b): the probable-cause hearing is held no later than 72 hours after detention under a protective custody order, or on the next day that is not a Saturday, Sunday, or legal holiday when the 72 hours end on one. Section 574.005: the hearing on the application for court-ordered mental health services is set within 14 days of filing, not in the first 3 days if the patient or attorney objects, and no later than the 30th day with continuances.';

const DAY = 86400000;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function longDate(t) {
  const d = new Date(t);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${WEEKDAYS[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function txProtectiveCustodyHearingClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.detained) && isBlank(o.filed)) {
    return { valid: false, message: 'Enter the time the person was detained under the protective custody order, the date the application was filed, or both. Without one no deadline is printed.' };
  }

  const deadlines = [];
  const flags = [];
  let band = '';
  let bandLabel = '';
  let hearingDay = null;
  let caveats = [];

  if (!isBlank(o.detained)) {
    const detained = parseDateTime(o.detained);
    if (detained === null) return { valid: false, message: 'Enter the protective custody detention time as a date and time.' };
    const end72 = addHours(detained, 72);
    caveats = end72.caveats;
    const endDay = Math.floor(end72.endWall / DAY) * DAY;
    deadlines.push({ label: '72 hours after detention under the protective custody order', at: end72.end, text: formatDeadline(detained, end72.endWall, 'detention') });
    if (isBusinessDay('TX', endDay)) {
      hearingDay = null;
      bandLabel = `Probable-cause hearing by ${formatDeadline(detained, end72.endWall, 'detention')}`;
      band = `The probable-cause hearing must be held by ${formatDeadline(detained, end72.endWall, 'detention')}.`;
    } else {
      hearingDay = Date.parse(nextBusinessDay('TX', endDay) + 'T00:00:00Z');
      const h = isLegalHoliday('TX', endDay);
      const why = h && h.kind === 'closure' ? h.name : (new Date(endDay).getUTCDay() === 0 ? 'a Sunday' : 'a Saturday');
      bandLabel = `Probable-cause hearing on ${longDate(hearingDay)}`;
      band = `The 72 hours end on ${why} (${formatDeadline(detained, end72.endWall, 'detention')}), so the probable-cause hearing must be held on ${longDate(hearingDay)}, the next day that is not a Saturday, Sunday, or legal holiday.`;
      deadlines.push({ label: 'Probable-cause hearing held on', at: iso(hearingDay), text: longDate(hearingDay) });
    }
    for (let t = Math.floor(detained / DAY) * DAY; t <= (hearingDay ?? endDay); t += DAY) {
      const h = isLegalHoliday('TX', t);
      if (h && h.kind === 'staffed') flags.push(`${h.name} (${iso(t)}) is a Texas state holiday on which offices stay staffed. It is counted as a working day here; whether it is a "legal holiday" for s.574.025 is for the court.`);
    }
  }

  if (!isBlank(o.filed)) {
    const filed = parseDate(o.filed);
    if (filed === null) return { valid: false, message: 'Enter the application filing date as a date.' };
    const d14 = filed + 14 * DAY;
    const d30 = filed + 30 * DAY;
    const firstAllowed = filed + 4 * DAY;
    deadlines.push({ label: 'Services hearing set within 14 days of filing (s.574.005(a))', at: iso(d14), text: `by ${longDate(d14)}` });
    deadlines.push({ label: 'Not in the first 3 days after filing, if the patient or attorney objects (s.574.005(b))', at: iso(firstAllowed), text: `no earlier than ${longDate(firstAllowed)} on objection` });
    deadlines.push({ label: 'Latest date with continuances (s.574.005(c))', at: iso(d30), text: `by ${longDate(d30)}` });
    if (!band) {
      bandLabel = `Services hearing by ${longDate(d14)}`;
      band = `The hearing on the application for court-ordered services must be set by ${longDate(d14)}, 14 days after filing, and held no later than ${longDate(d30)} even with continuances.`;
    }
  }

  return {
    valid: true,
    hearingDay: hearingDay === null ? null : iso(hearingDay),
    abnormal: false,
    bandLabel,
    band,
    deadlines,
    flags,
    caveats,
    postureNote: scopeSentence(TX_PCO_VERIFIED),
    note: TX_PCO_NOTE,
  };
}
