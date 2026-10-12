// spec-v1637 tool 19: DSCSA deadlines for a dispenser.
//
// Source: 21 U.S.C. 360eee-1 (United States Code, 2024 edition, govinfo.gov), re-read October 12,
// 2026.
//   (d)(4)(B)(ii)  "Upon determining that a product in the possession or control of the dispenser
//     is an illegitimate product, the dispenser shall notify the Secretary and all immediate
//     trading partners that the dispenser has reason to believe may have received such
//     illegitimate product of such determination not later than 24 hours after making such
//     determination."
//   (d)(1)(D)  on a request "in the event of a recall or for the purpose of investigating a suspect
//     or an illegitimate product, a dispenser shall, not later than 2 business days after receiving
//     the request or in another such reasonable time as determined by the Secretary ... provide
//     the applicable transaction information, transaction statement, and transaction history".
//   (m)  from November 27, 2023 the response time under subsections (b)(1)(B), (c)(1)(C) and
//     (e)(1)(C) is 24 hours. The dispenser paragraph, (d)(1)(D), is not on that list.
//   (d)(4)(A)(iv), (B)(v)  records kept not less than 6 years after the conclusion.
// FDA's form for the notification is Form FDA 3911 (as the spec read it; not re-read at build).
//
// "Business day" is not defined in the section. The tool skips Saturdays, Sundays and federal
// holidays and shows the second calendar day beside it as the stricter reading.
//
// Pure: no DOM, no clock, no network. Times are the reader's own clock, with no time zone.

import { fmtUtc, addCalendarDaysUtc, isBusinessDay, addMonthsUtc } from './deadline.js';

export const EVENTS = [
  { value: 'determined-illegitimate', text: 'Determined that a product is illegitimate' },
  { value: 'received-records-request', text: 'Received a request for transaction records from FDA or a state official' },
  { value: 'concluded-investigation-or-disposition', text: 'Concluded a suspect-product investigation or an illegitimate-product disposition' },
];
// "2026-10-12T14:30" or "2026-10-12 14:30" or "2026-10-12" -> { t: ms, timed } on a clock with no zone.
function stamp(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?$/.exec(String(raw ?? '').trim());
  if (!m) return null;
  const h = m[4] === undefined ? 0 : +m[4]; const mi = m[5] === undefined ? 0 : +m[5];
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], h, mi));
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3] || h > 23 || mi > 59 || +m[1] < 1900 || +m[1] > 2200) return null;
  return { t: d.getTime(), timed: m[4] !== undefined, day: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) };
}
const sayDay = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const sayAt = (t) => { const d = new Date(t); return `${sayDay(d)} at ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };
function addBusinessDays(d, n) { let x = d; let left = n; while (left > 0) { x = addCalendarDaysUtc(x, 1); if (isBusinessDay(x)) left -= 1; } return x; }

export function dscsaDispenserClocks(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const event = EVENTS.find((e) => e.value === String(o.event ?? '').trim());
  if (!event) return { valid: false, message: 'Choose what happened: each event has its own deadline.' };
  const when = stamp(o.when);
  if (!when) return { valid: false, message: event.value === 'determined-illegitimate' ? 'Enter the date and time the determination was made.' : 'Enter the date it happened.' };
  const tailNote = 'This is for a dispenser. Manufacturers, wholesale distributors and repackagers have their own paragraphs, and since November 27, 2023 their response time to a records request is 24 hours (21 U.S.C. 360eee-1(m)); the dispenser paragraph is not on that list.';
  if (event.value === 'determined-illegitimate') {
    if (!when.timed) return { valid: false, message: 'Enter the time of the determination as well as the date: the limit is 24 hours.' };
    const due = when.t + 24 * 3600000;
    const notes = [`Determined ${sayAt(when.t)}: notify FDA and all immediate trading partners that may have received the product not later than 24 hours after making the determination, so by ${sayAt(due)} (21 U.S.C. 360eee-1(d)(4)(B)(ii)). The hours run through nights, weekends and holidays.`,
      'The clock starts at the determination that the product is illegitimate, not at first suspicion. FDA takes the notification on Form FDA 3911.',
      'The dispenser also dispositions the product, helps trading partners do the same, and keeps a sample for examination on request (360eee-1(d)(4)(B)(i)). Records of the disposition are kept not less than 6 years after it concludes.', tailNote];
    return { valid: true, flag: 'notify-within-24-hours', due: new Date(due).toISOString().slice(0, 16), band: `Notify FDA and trading partners by ${sayAt(due)}.`, bandLabel: '24 hours from the determination', notes, note: notes.join(' ') };
  }
  if (event.value === 'received-records-request') {
    const due = addBusinessDays(when.day, 2); const strict = addCalendarDaysUtc(when.day, 2);
    const notes = [`Request received ${sayDay(when.day)}: provide the transaction information, statement and history not later than 2 business days after receiving it, so by ${sayDay(due)}, or in another reasonable time FDA sets for the request (21 U.S.C. 360eee-1(d)(1)(D)).`,
      `"Business day" is not defined in the section. This skips Saturdays, Sundays and federal holidays.${strict.getTime() !== due.getTime() ? ` Read most strictly, two days is ${sayDay(strict)}.` : ''}`,
      'The paragraph applies to a request in a recall or to investigate a suspect or illegitimate product. The dispenser may respond in paper or electronic form.', tailNote];
    return { valid: true, flag: 'respond-within-2-business-days', due: fmtUtc(due), strictReading: fmtUtc(strict), band: `Provide the records by ${sayDay(due)}.`, bandLabel: '2 business days from the request', notes, note: notes.join(' ') };
  }
  const keep = addMonthsUtc(when.day, 72);
  const notes = [`Concluded ${sayDay(when.day)}: keep the records of the investigation or the disposition for not less than 6 years after its conclusion, so until at least ${sayDay(keep)} (21 U.S.C. 360eee-1(d)(4)(A)(iv), (B)(v)).`, 'If the product was cleared, the dispenser promptly notifies FDA, if applicable, and the product may be distributed or dispensed (360eee-1(d)(4)(A)(iii)).', tailNote];
  return { valid: true, flag: 'keep-records-6-years', due: fmtUtc(keep), band: `Keep the records until at least ${sayDay(keep)}.`, bandLabel: '6 years from the conclusion', notes, note: notes.join(' ') };
}
