// spec-v1637 tool 15: the administer-by date for a pharmacy-delivered injectable or implantable
// narcotic for maintenance or detoxification treatment.
//
// Source: 21 CFR 1306.07(f), read on eCFR as current October 8, 2026 (re-read October 12, 2026;
// last amended at 91 FR 34754, effective July 9, 2026).
//   (f)(5)  "The controlled substance is to be administered only to the patient named on the
//     prescription not later than 45 days after the date of receipt of the controlled substance by
//     the practitioner".
//   (f)(1)-(4), (6)  delivered to the prescribing or administering practitioner at the location on
//     the DEA registration; "a narcotic drug in schedule III, IV, or V to be administered for the
//     purpose of maintenance or detoxification treatment ... by injection or implantation"; all
//     parties authorized under state law; not "to supply any practitioner with a stock"; records.
// Older references say 14 days, which the statute first provided; the current text says 45.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';

export const CONDITIONS = [
  'Delivered by the pharmacy to the prescribing or administering practitioner at the location on that practitioner\'s DEA registration.',
  'A narcotic drug in Schedule III, IV or V, for maintenance or detoxification treatment, given by injection or implantation.',
  'The pharmacy and the practitioners are each authorized to do this under the law of the state where it takes place.',
  'The prescription is not issued to supply a practitioner with stock for general dispensing.',
  'Administered only to the patient named on the prescription.',
  'The practitioners keep complete and accurate records of what was delivered, received, administered or otherwise disposed of.',
];
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function matInjectionAdminDeadline(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const received = date(o.received);
  if (!received) return { valid: false, message: 'Enter the date the practitioner received the drug from the pharmacy.' };
  const last = addCalendarDaysUtc(received, 45);
  const notes = [`Received ${say(received)}: administer to the named patient not later than ${say(last)}, 45 days after receipt (21 CFR 1306.07(f)(5)). The rule counts days and gives no weekend or holiday extension.`];
  const out = { valid: true, administerBy: fmtUtc(last) };
  let where = 'Administer-by date';
  if (now instanceof Date && !Number.isNaN(now.getTime())) {
    const n = Math.round((last.getTime() - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    out.daysLeft = n; out.abnormal = n < 0;
    where = n > 0 ? `${n} day${n === 1 ? '' : 's'} left` : n === 0 ? 'Last day is today' : `${-n} day${n === -1 ? '' : 's'} past the last day`;
    notes.push(n > 0 ? `That is ${n} day${n === 1 ? '' : 's'} from today.` : n === 0 ? 'That is today.' : `That was ${-n} day${n === -1 ? '' : 's'} ago.`);
  }
  notes.push('The 45 days apply to a delivery that meets every condition of 1306.07(f):', ...CONDITIONS.map((c, i) => `(${i + 1}) ${c}`));
  notes.push('Older references say 14 days, which the statute first provided; the regulation now says 45. The rule does not say what to do with a dose not given in time. State law can be stricter.');
  return { ...out, flag: out.abnormal ? 'past-the-last-day' : 'administer-by', band: `Administer no later than ${say(last)}.`, bandLabel: where, notes, note: notes.join(' ') };
}
