// spec-v1507 tool 6: the Marketplace special enrollment window and the coverage start date.
//
// Read in the eCFR on 2026-09-26, 45 CFR 155.420:
//   (c)(1) "60 days from the date of a triggering event to select a QHP"; (c)(2) a loss of coverage has
//     "60 days before and ... 60 days after the triggering event"; (c)(6) a loss of Medicaid or CHIP has
//     "90 days after the triggering event" (the state may allow longer); (c)(5) without timely notice,
//     "60 days of the date that he or she knew, or reasonably should have known".
//   (b)(1) regular effective date: "the first day of the month following the QHP selection".
//   (b)(2)(i) birth, adoption, foster care or court order: coverage from the date of the event, or at
//     the person's choice the first of the month after plan selection. (b)(2)(ii) marriage: the first
//     of the month after plan selection. (b)(2)(iv) loss of coverage or a permanent move, with the plan
//     chosen on or before the event: "the first day of the month following the date of the triggering
//     event"; chosen after it, the first of the month after plan selection.
//   The low-income (150% of the poverty line) special enrollment period is no longer in the rule.
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc, firstOfNextMonth, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not an eligibility decision. The Marketplace\'s notice controls.';
export const EVENTS = [
  { value: 'loss', text: 'Losing other health coverage' },
  { value: 'loss-medicaid', text: 'Losing Medicaid or CHIP' },
  { value: 'birth', text: 'Birth, adoption, foster placement or court order' },
  { value: 'marriage', text: 'Marriage' },
  { value: 'move', text: 'Permanent move to a new area' },
  { value: 'other', text: 'Another qualifying event' },
];
const opt = (s, what) => {
  if (!String(s ?? '').trim()) return { none: true };
  try { return { d: parseIsoStrict(String(s).trim()) }; } catch { return { error: `Enter ${what} as YYYY-MM-DD, or leave it blank.` }; }
};

export function acaSepWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ev = EVENTS.some((e) => e.value === o.event) ? o.event : null;
  if (!ev) return { valid: false, message: 'Choose the qualifying event.' };
  let event;
  try { event = parseIsoStrict(String(o.eventDate ?? '').trim()); } catch { return { valid: false, message: 'Enter the date of the event (YYYY-MM-DD).' }; }
  const learned = opt(o.learnedDate, 'the date the person learned of the event');
  const sel = opt(o.selectionDate, 'the plan selection date');
  if (learned.error) return { valid: false, message: learned.error };
  if (sel.error) return { valid: false, message: sel.error };
  const notes = [];
  const before = ev === 'loss' || ev === 'loss-medicaid';
  const openFrom = before ? addCalendarDaysUtc(event, -60) : event;
  let closes = addCalendarDaysUtc(event, ev === 'loss-medicaid' ? 90 : 60);
  if (learned.d && learned.d > event) {
    const late = addCalendarDaysUtc(learned.d, 60);
    if (late > closes) {
      closes = late;
      notes.push(`Without timely notice of the event, the window runs 60 days from when the person knew or should have known: to ${longDate(late)} (45 CFR 155.420(c)(5)).`);
    }
  }
  if (ev === 'loss-medicaid') notes.push('A state Marketplace may allow longer after a loss of Medicaid or CHIP, up to its own reconsideration period.');
  if (ev === 'move') notes.push('A move qualifies only with coverage for at least one day in the 60 days before it (some exceptions apply); the Marketplace may also open the window 60 days before the move.');
  if (ev === 'marriage') notes.push('Marriage qualifies when at least one spouse had coverage for at least one day in the 60 days before it (some exceptions apply).');
  const windowText = `${longDate(openFrom)} to ${longDate(closes)}`;
  let band = `Special enrollment window ${windowText} (45 CFR 155.420(c)).`;
  let label = `Choose a plan by ${fmtUtc(closes)}`;
  let start = null;
  if (sel.d) {
    if (sel.d < openFrom || sel.d > closes) {
      band = `A plan chosen on ${longDate(sel.d)} is outside the special enrollment window, ${windowText}.`;
      label = 'Outside the window';
    } else {
      if (ev === 'birth') {
        start = event;
        notes.push('Coverage can instead start the first of the month after plan selection, if the person chooses.');
      } else if ((before || ev === 'move') && sel.d <= event) start = firstOfNextMonth(event);
      else start = firstOfNextMonth(sel.d);
      band = `A plan chosen on ${longDate(sel.d)} is inside the window (${windowText}); coverage starts ${longDate(start)}.`;
      label = `Coverage starts ${fmtUtc(start)}`;
    }
  } else notes.push('Enter the plan selection date to get the coverage start date; coverage usually starts the first of the month after the plan is chosen.');
  notes.push('The low-income special enrollment period (for incomes up to 150% of the poverty line) is no longer available.');
  return { valid: true, windowOpens: fmtUtc(openFrom), windowCloses: fmtUtc(closes), coverageStarts: start ? fmtUtc(start) : null, band, bandLabel: label, notes, note: POSTURE };
}
