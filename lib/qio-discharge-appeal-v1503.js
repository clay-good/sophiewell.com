// spec-v1503 tool 8: Medicare fast appeals to the QIO -- a hospital discharge, or the end of skilled
// nursing, home health, hospice or CORF services.
//
// Read in the eCFR on 2026-09-25 (42 CFR):
//   405.1206(b)(1) hospital: the request "must be made no later than the day of discharge";
//     (e) the hospital delivers the detailed notice "no later than noon of the day after the QIO's
//     notification"; (d)(6)(i) the QIO decides "within one calendar day after it receives all
//     requested pertinent information"; (d)(6)(ii) a late request while still admitted, "within 2
//     calendar days"; (b)(6) after discharge, a late request "within 30 calendar days after the date
//     of discharge" -- neither late request carries the liability protection; (f)(2) a timely
//     requester "is not financially responsible for inpatient hospital services (other than
//     applicable coinsurance and deductible) furnished before noon of the calendar day after the date
//     the beneficiary ... receives notification ... of the expedited determination by the QIO".
//   405.1200(b)(1) the provider's notice "no later than 2 days before the proposed end of the
//     services". 405.1202(b)(1) the request "by no later than noon of the calendar day following
//     receipt of the provider's notice"; (e)(6) the QIO decides "no later than 72 hours after receipt
//     of the request"; (e)(8) without valid notice, "coverage of provider services continues until at
//     least 2 days after valid notice has been received".
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The notice and the QIO\'s decision control.';
export const SETTINGS = [
  { value: 'hospital', text: 'Hospital discharge' },
  { value: 'services', text: 'Ending skilled nursing, home health, hospice or CORF services' },
];

const noonAfter = (d) => `noon on ${longDate(addCalendarDaysUtc(d, 1))}`;

export function qioDischargeAppealClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const setting = SETTINGS.some((s) => s.value === o.setting) ? o.setting : null;
  if (!setting) return { valid: false, message: 'Choose a hospital discharge or the end of other services.' };
  let key;
  try { key = parseIsoStrict(String(o.keyDate ?? '').trim()); } catch {
    return { valid: false, message: setting === 'hospital' ? 'Enter the planned discharge date (YYYY-MM-DD).' : 'Enter the date the patient received the notice that services will end (YYYY-MM-DD).' };
  }
  const notes = [];
  let band;
  let deadline;
  if (setting === 'hospital') {
    deadline = fmtUtc(key);
    band = `42 CFR 405.1206(b)(1): ask the QIO for a fast appeal no later than the day of discharge, ${longDate(key)}.`;
    notes.push('The hospital must then give the detailed notice and records by noon of the day after the QIO calls, and the QIO decides within 1 calendar day of receiving the information.');
    notes.push('A patient who asks in time pays nothing beyond ordinary cost sharing for hospital care before noon of the calendar day after hearing the QIO\'s decision (42 CFR 405.1206(f)(2)).');
    notes.push(`Asked late while still admitted, the QIO decides within 2 calendar days; after discharge, the request can still be made until ${longDate(addCalendarDaysUtc(key, 30))} (30 calendar days). Neither late route carries the liability protection.`);
  } else {
    deadline = `${fmtUtc(addCalendarDaysUtc(key, 1))}T12:00`;
    band = `42 CFR 405.1202(b)(1): ask the QIO by ${noonAfter(key)}, noon of the calendar day after the notice was received.`;
    if (String(o.requested ?? '').trim()) {
      const w = parseDateTime(o.requested);
      if (w === null) return { valid: false, message: 'Enter the date and time the QIO received the request as YYYY-MM-DDTHH:MM, or leave it blank.' };
      notes.push(`The QIO must decide by ${formatDeadline(w, addHours(w, 72).endWall, 'the request')} (42 CFR 405.1202(e)(6)).`);
    } else notes.push('The QIO decides within 72 hours of receiving the request; enter the request time to count it.');
    if (String(o.servicesEnd ?? '').trim()) {
      let end;
      try { end = parseIsoStrict(String(o.servicesEnd).trim()); } catch { return { valid: false, message: 'Enter the date services are to end as YYYY-MM-DD, or leave it blank.' }; }
      const gap = Math.round((end - key) / 86400000);
      if (gap < 2) notes.push(`The notice came ${gap < 0 ? 'after' : `${gap} day${gap === 1 ? '' : 's'}`} before services end; the provider must give it at least 2 days before (42 CFR 405.1200(b)(1)), unless the services last fewer than 2 days. Without valid notice, coverage continues until at least 2 days after valid notice is received.`);
      else notes.push(`The notice came ${gap} days before services end, meeting the 2-day minimum (42 CFR 405.1200(b)(1)).`);
    }
  }
  return { valid: true, deadline, band, bandLabel: `Ask by ${deadline.replace('T', ' ')}`, notes, note: POSTURE };
}
