// spec-v1635 tool 20: follow-up deadlines after an emergency expanded access use.
//
// Source: 21 CFR 312.310 and 56.104, read on eCFR as current October 8, 2026 (re-read October 11, 2026):
//   312.310(d)(2)  the physician or sponsor "must agree to submit an expanded access submission
//                  within 15 working days of FDA's authorization of the use".
//   56.104(c)      emergency use of a test article is exempt from prior IRB review "provided that
//                  such emergency use is reported to the IRB within 5 working days".
//   312.310(c)(2)  "At the conclusion of treatment, the licensed physician or sponsor must provide
//                  FDA with a written summary of the results". No day count is given.
// Neither rule defines "working days". The tool counts Monday to Friday and skips federal holidays,
// and says so.
//
// Pure: no DOM, no clock, no network.

import { deadline, parseIsoStrict } from './deadline.js';

const NOTE = 'Neither rule defines "working days"; this counts Monday through Friday and skips federal holidays, starting the day after the event. An institution or IRB may count differently or ask for the report sooner. Any later use of the product at the institution is subject to IRB review.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (iso) => parseIsoStrict(iso).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function due(v, days) { try { return deadline({ anchor: String(v).trim(), days, basis: 'business', now: new Date(0) }).deadline; } catch { return null; } }

export function emergencyIndClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (blank(o.authorized) && blank(o.used)) return { valid: false, message: 'Enter the date FDA authorized the emergency use, the date of the use at the institution, or both.' };
  const dates = []; const notes = [];
  if (!blank(o.authorized)) {
    const d = due(o.authorized, 15);
    if (!d) return { valid: false, message: 'Enter the date FDA authorized the use as a date.' };
    dates.push({ what: 'Expanded access submission to FDA', due: d, paragraph: '21 CFR 312.310(d)(2)' });
    notes.push(`Expanded access submission to FDA: by ${say(d)}, 15 working days after authorization on ${say(String(o.authorized).trim())} (21 CFR 312.310(d)(2)).`);
  }
  if (!blank(o.used)) {
    const d = due(o.used, 5);
    if (!d) return { valid: false, message: 'Enter the date of the emergency use as a date.' };
    dates.push({ what: 'Report to the IRB', due: d, paragraph: '21 CFR 56.104(c)' });
    notes.push(`Report to the IRB: by ${say(d)}, 5 working days after the emergency use on ${say(String(o.used).trim())} (21 CFR 56.104(c)).`);
  }
  notes.push('At the conclusion of treatment, a written summary of the results, including adverse effects, goes to FDA (21 CFR 312.310(c)(2)). The rule gives no number of days.');
  return { valid: true, flag: 'emergency-ind', abnormal: false, dates, band: dates.map((x) => `${x.what}: ${say(x.due)}`).join('. ') + '.', bandLabel: dates.map((x) => say(x.due)).join('; '), notes, note: NOTE };
}
