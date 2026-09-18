// spec-v1389: the California 5150 hold timeline, from detention through the further certifications.
//
// Sources (Cal. Welfare & Institutions Code, leginfo text read 2026-09-18):
//   5150(a)    Custody "for a period of up to 72 hours"; "The 72-hour period begins at the time when
//              the person is first detained."
//   5250       Certification "for not more than 14 days of intensive treatment" (SB 1511, 2024).
//   5256(a)    A certification review hearing "within four days of the date on which the person is
//              certified" under 5250 or 5270.15, unless postponed at the person's request.
//   5256(b)    When a person has NOT been certified under 5250 and remains detained under 5150, a
//              certification review hearing "within seven days of the date the person was initially
//              detained" (AB 2275, 2022).
//   5260       At the end of the 14 days, a further period "not to exceed 14 days" for a person who
//              threatened or attempted suicide during the 14 days or the 72-hour evaluation, or was
//              detained for that, and "continues to present an imminent threat".
//   5270.15    Upon completion of the 14 days, "an additional period of not more than 30 days" for a
//              person who remains gravely disabled, with a certification review hearing under 5256.
//              Only where the county has adopted this article, so the tile asks.
//
// THE TRAP: a 5250 certification starts a NEW 14-day clock, with its own review hearing within 4
// days -- it is not an extension of the 72 hours.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const CA5150_VERIFIED = '2026-09-18';
export const CA5150_NOTE = 'Cal. Welfare & Institutions Code 5150: up to 72 hours from the time the person is first detained. 5250: certification for up to 14 days of intensive treatment, with a certification review hearing within 4 days of certification (5256). A person still held under 5150 without certification gets a hearing within 7 days of initial detention (5256(b)). After the 14 days: up to 14 more for an imminent threat of suicide (5260), or up to 30 more for grave disability in counties that have adopted that article (5270.15).';

export const CRITERIA = [
  { value: 'danger-self', text: 'Danger to self' },
  { value: 'danger-others', text: 'Danger to others' },
  { value: 'grave-disability', text: 'Grave disability' },
];
export const YES_NO_UNKNOWN = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
  { value: 'not-assessed', text: 'Not assessed' },
];

const DAY = 86400000;
function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function longDate(t) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }

export function ca5150HoldTimeline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.detained)) {
    return { valid: false, message: 'Enter the time the person was first detained. The 72 hours begin there, and without it no deadline is printed.' };
  }
  const d = parseDateTime(o.detained);
  if (d === null) return { valid: false, message: 'Enter the detention time as a date and time.' };
  if (isBlank(o.criterion) || !CRITERIA.some((c) => c.value === o.criterion)) {
    return { valid: false, message: 'Choose the criterion: danger to self, danger to others, or grave disability. The further certifications depend on it.' };
  }

  const deadlines = [];
  const caveats = [];
  const next = [];
  const h72 = addHours(d, 72);
  caveats.push(...h72.caveats);
  deadlines.push({ label: '5150 ends (72 hours from first detention)', at: h72.end, text: formatDeadline(d, h72.endWall, 'detention') });

  let band;
  let stage = '5150';
  if (isBlank(o.certified)) {
    const h7 = Math.floor(d / DAY) * DAY + 7 * DAY;
    deadlines.push({ label: 'If still held under 5150 without certification: certification review hearing (5256(b), 7 days from initial detention)', at: iso(h7), text: `by ${longDate(h7)}` });
    band = `The 5150 ends ${formatDeadline(d, h72.endWall, 'detention')}. Holding the person longer takes a 5250 certification for up to 14 days, which starts its own clock.`;
    next.push('5250: certification for up to 14 days of intensive treatment, with a review hearing within 4 days of certification.');
  } else {
    const c = parseDateTime(o.certified);
    if (c === null) return { valid: false, message: 'Enter the 5250 certification time as a date and time, or leave it blank.' };
    if (c < d) return { valid: false, message: 'The certification is before the detention. Check the two times.' };
    stage = '5250';
    const d14 = addHours(c, 14 * 24);
    const h4 = Math.floor(c / DAY) * DAY + 4 * DAY;
    caveats.push(...d14.caveats);
    deadlines.push({ label: 'Certification review hearing (5256(a), within 4 days of certification)', at: iso(h4), text: `by ${longDate(h4)}, unless postponed at the person's request` });
    deadlines.push({ label: '5250 certification ends (14 days from certification)', at: d14.end, text: formatDeadline(c, d14.endWall, 'certification') });
    band = `The 5250 certification is a new clock: a review hearing by ${longDate(h4)}, and the 14 days end ${formatDeadline(c, d14.endWall, 'certification')}.`;

    // What can follow the 14 days.
    if (o.suicideThreat === 'yes') next.push(`5260: up to 14 more days (to ${formatDeadline(c, d14.endWall + 14 * DAY, 'certification')}) if the person still presents an imminent threat of suicide.`);
    else if (o.suicideThreat === 'no') next.push('5260 does not apply: it needs a threat or attempt of suicide during the 72 hours or the 14 days, or detention for one.');
    else next.push('5260 not assessed: it needs a threat or attempt of suicide during the 72 hours or the 14 days, or detention for one.');
    if (o.criterion === 'grave-disability') {
      if (o.county30 === 'yes') next.push(`5270.15: up to 30 more days (to ${formatDeadline(c, d14.endWall + 30 * DAY, 'certification')}) if the person remains gravely disabled, with its own review hearing within 4 days.`);
      else if (o.county30 === 'no') next.push('5270.15 is not available: this county has not adopted the 30-day certification.');
      else next.push('5270.15 not assessed: the 30-day certification for grave disability applies only where the county has adopted it.');
    }
  }

  return {
    valid: true,
    stage,
    abnormal: false,
    bandLabel: `${stage}: ${deadlines[stage === '5150' ? 0 : 1].text}`,
    band,
    deadlines,
    next,
    caveats,
    sb43Note: 'Since SB 43 (2024), grave disability also covers a severe substance use disorder.',
    postureNote: scopeSentence(CA5150_VERIFIED),
    note: CA5150_NOTE,
  };
}
