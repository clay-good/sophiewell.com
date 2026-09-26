// spec-v1514 tools 1, 3, 5, 6: MOON, NOMNC, the skilled nursing qualifying stay, and hospice periods.
//
// Read in the eCFR on 2026-09-26 (42 CFR):
//   489.20(y): a MOON goes to anyone receiving outpatient observation "for more than 24 hours", "not
//     later than 36 hours after observation services are initiated or sooner if the individual is
//     transferred, discharged, or admitted"; it "may be provided before" 24 hours.
//   405.1200(b)(1): the NOMNC "no later than 2 days before the proposed end of the services"; for
//     services "expected to be fewer than 2 days in duration", at the time of admission.
//     405.1202(b)(1): the patient asks the QIO "by no later than noon of the calendar day following
//     receipt"; (e)(8): without valid notice, coverage continues "until at least 2 days after valid
//     notice has been received".
//   409.30(a)(1): a qualifying hospital stay of "at least 3 consecutive calendar days, not counting the
//     date of discharge"; (b)(1): SNF care "within 30 calendar days after the date of discharge".
//   409.60(b)(1): a benefit period ends when the person "for at least 60 consecutive days" has not
//     been an inpatient in a hospital, CAH or SNF. 409.61(b): "Up to 100 days" in each benefit period;
//     Medicare pays in full for "the first 20 days", and days 21 to 100 carry a daily coinsurance
//     ($217 in 2026, CMS 2026 Parts A and B fact sheet).
//   418.21(a): hospice periods of 90 days, 90 days, then "an unlimited number of subsequent 60-day
//     periods". 418.22(a)(3): certification within 2 calendar days of a period starting (oral within 2
//     days and written before billing if not), and "no more than 15 calendar days prior to" the period.
//     418.22(a)(4): a face-to-face encounter "prior to, but no more than 30 calendar days prior to, the
//     3rd benefit period recertification, and every benefit period recertification thereafter".
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, fmtUtc, countMidnights } from './deadline.js';
import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { datedValue } from './dated-data.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The Medicare notice and the provider\'s records control.';
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
const opt = (s, what) => {
  if (!String(s ?? '').trim()) return { none: true };
  const d = date(s);
  return d ? { d } : { error: `Enter ${what} as YYYY-MM-DD, or leave it blank.` };
};

export function moonDeadline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const start = parseDateTime(o.observationStart);
  if (start === null) return { valid: false, message: 'Enter the date and time observation began (YYYY-MM-DDTHH:MM).' };
  const due = addHours(start, 36).endWall;
  const trigger = addHours(start, 24).endWall;
  const notes = [`The notice becomes required once observation passes 24 hours: ${formatDeadline(start, trigger, 'observation began')}. It may be given earlier.`];
  let band = `The MOON is due by ${formatDeadline(start, due, 'observation began')}, or sooner at release, transfer or admission (42 CFR 489.20(y)).`;
  let label = `Due by ${new Date(due).toISOString().slice(0, 16).replace('T', ' ')}`;
  let deadline = new Date(due).toISOString().slice(0, 16);
  if (String(o.endTime ?? '').trim()) {
    const end = parseDateTime(o.endTime);
    if (end === null) return { valid: false, message: 'Enter the release, transfer or admission time as YYYY-MM-DDTHH:MM, or leave it blank.' };
    if (end < start) return { valid: false, message: 'Enter the end time again: it cannot come before observation began.' };
    if (end <= trigger) {
      band = 'No MOON is required: observation ended at 24 hours or less.';
      label = 'Not required';
      deadline = null;
    } else if (end < due) {
      band = `The MOON is due by ${formatDeadline(start, end, 'observation began')}, when the patient leaves observation, which comes before the 36-hour mark (42 CFR 489.20(y)).`;
      label = `Due by ${new Date(end).toISOString().slice(0, 16).replace('T', ' ')}`;
      deadline = new Date(end).toISOString().slice(0, 16);
    }
  }
  notes.push('The notice is explained orally as well as in writing; the patient signs, or on refusal the deliverer records their name, title and the date and time.');
  return { valid: true, deadline, band, bandLabel: label, notes, note: POSTURE };
}

export const NOMNC_SETTINGS = [
  { value: 'snf', text: 'Skilled nursing facility' },
  { value: 'hha', text: 'Home health' },
  { value: 'hospice', text: 'Hospice' },
  { value: 'corf', text: 'Comprehensive outpatient rehabilitation facility' },
];
export function nomncDeadline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const setting = NOMNC_SETTINGS.some((s) => s.value === o.setting) ? o.setting : null;
  if (!setting) return { valid: false, message: 'Choose the setting.' };
  const last = date(o.lastCovered);
  if (!last) return { valid: false, message: 'Enter the last covered day of services (YYYY-MM-DD).' };
  const due = addCalendarDaysUtc(last, -2);
  const notes = [
    'The rule counts 2 days, not 48 hours: a last covered day on a Friday means delivery by Wednesday.',
    'When services are expected to last fewer than 2 days, the notice is given at admission. For home health and other visit-based services with visits more than 2 days apart, it is given at the next-to-last visit.',
    'The patient asks the QIO for a fast appeal by noon of the calendar day after receiving the notice (42 CFR 405.1202(b)(1)).',
  ];
  let band = `Deliver the NOMNC by ${longDate(due)}, 2 days before the last covered day, ${longDate(last)} (42 CFR 405.1200(b)(1)).`;
  let label = `Deliver by ${fmtUtc(due)}`;
  const del = opt(o.delivered, 'the date the notice was delivered');
  if (del.error) return { valid: false, message: del.error };
  if (del.d) {
    if (del.d <= due) {
      band += ` Delivered ${longDate(del.d)}: on time.`;
      label = 'On time';
    } else {
      const until = addCalendarDaysUtc(del.d, 2);
      band = `Late: delivered ${longDate(del.d)}, after ${longDate(due)}. Coverage continues until at least ${longDate(until)}, 2 days after a valid notice (42 CFR 405.1202(e)(8)).`;
      label = 'Late notice';
    }
  }
  return { valid: true, deadline: fmtUtc(due), band, bandLabel: label, notes, note: POSTURE };
}

const SNF_COINSURANCE = { 'snf-coinsurance-2026': { edition: '2026', validThrough: '2026-12-31', route: 'B', ledgerId: 'billing-medicare-cost-share', source: { label: 'the CMS 2026 Parts A and B fact sheet', url: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles' }, values: { daily: 217 } } };
export { SNF_COINSURANCE };

export function snfQualifyingStay(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const adm = date(o.inpatientAdmit);
  const dis = date(o.inpatientDischarge);
  if (!adm) return { valid: false, message: 'Enter the date of the formal inpatient admission (YYYY-MM-DD); observation time before it does not count.' };
  if (!dis) return { valid: false, message: 'Enter the hospital discharge date (YYYY-MM-DD).' };
  if (dis < adm) return { valid: false, message: 'Enter the dates again: discharge cannot come before admission.' };
  const days = countMidnights(adm, dis);
  const qualifies = days >= 3;
  const snfBy = addCalendarDaysUtc(dis, 30);
  const notes = [`Inpatient days counted: ${days} (from ${longDate(adm)} up to, not including, the discharge day ${longDate(dis)}).`];
  notes.push('Time in observation before the inpatient order does not count toward the 3 days.');
  let band = qualifies
    ? `Qualifying stay: ${days} inpatient days, at least the 3 required (42 CFR 409.30(a)). Skilled nursing care must begin by ${longDate(snfBy)}, within 30 days of discharge.`
    : `Not a qualifying stay: ${days} inpatient day${days === 1 ? '' : 's'}, fewer than the 3 required, not counting the discharge day (42 CFR 409.30(a)).`;
  let label = qualifies ? 'Qualifies' : 'Does not qualify';
  const snf = opt(o.snfAdmit, 'the SNF admission date');
  if (snf.error) return { valid: false, message: snf.error };
  if (qualifies && snf.d && snf.d > snfBy) {
    band = `The stay qualified, but the SNF admission on ${longDate(snf.d)} is more than 30 days after discharge (${longDate(snfBy)} was the last day), unless care could not medically start sooner (42 CFR 409.30(b)).`;
    label = 'SNF admission too late';
  }
  if (String(o.daysUsed ?? '').trim()) {
    const uf = inputFault([['the SNF days already used in this benefit period', o.daysUsed, 0, 100, 'days']]);
    if (uf) return { valid: false, message: uf };
    const used = Number(o.daysUsed);
    const full = Math.max(0, 20 - used);
    const co = Math.max(0, 100 - Math.max(used, 20));
    const rate = datedValue('snf-coinsurance-2026', 'daily', new Date(Date.UTC(2026, 6, 1)), SNF_COINSURANCE).value;
    notes.push(`Left in this benefit period: ${full} fully covered day${full === 1 ? '' : 's'} and ${co} coinsurance day${co === 1 ? '' : 's'} ($${rate} a day in 2026) (42 CFR 409.61(b)).`);
  } else notes.push('SNF days already used were not entered; a benefit period has 20 fully covered days, then days 21 to 100 with a daily coinsurance.');
  notes.push('A benefit period ends after 60 days in a row without inpatient hospital or skilled nursing care (42 CFR 409.60).');
  return { valid: true, inpatientDays: days, qualifies, band, bandLabel: label, notes, note: POSTURE };
}

export function hospicePeriodClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const elect = date(o.electionDate);
  if (!elect) return { valid: false, message: 'Enter the date hospice care was elected (YYYY-MM-DD).' };
  const onDate = opt(o.asOf, 'the date to check');
  if (onDate.error) return { valid: false, message: onDate.error };
  const periods = [];
  let start = elect;
  const lens = [90, 90, 60, 60, 60, 60];
  for (let i = 0; i < lens.length; i += 1) {
    const end = addCalendarDaysUtc(start, lens[i] - 1);
    periods.push({ n: i + 1, start, end, len: lens[i] });
    start = addCalendarDaysUtc(end, 1);
  }
  const rows = periods.map((p) => {
    const certFrom = addCalendarDaysUtc(p.start, -15);
    const certBy = addCalendarDaysUtc(p.start, 2);
    const f2f = p.n >= 3 ? `; face-to-face in the 30 days before recertifying (from ${longDate(addCalendarDaysUtc(p.start, -30))} if recertifying on the first day)` : '';
    return `Period ${p.n} (${p.len} days): ${longDate(p.start)} to ${longDate(p.end)}; certify between ${longDate(certFrom)} and ${longDate(certBy)}${f2f}`;
  });
  let band = `Hospice periods from an election on ${longDate(elect)}: 90 days, 90 days, then 60-day periods (42 CFR 418.21).`;
  let label = `Period 2 starts ${fmtUtc(periods[1].start)}`;
  if (onDate.d) {
    const cur = periods.find((p) => onDate.d >= p.start && onDate.d <= p.end);
    if (cur) {
      const next = periods[cur.n] || null;
      band = `On ${longDate(onDate.d)} the patient is in period ${cur.n}, which ends ${longDate(cur.end)}.${next ? ` Recertify for period ${next.n} between ${longDate(addCalendarDaysUtc(next.start, -15))} and ${longDate(addCalendarDaysUtc(next.start, 2))}${next.n >= 3 ? `, after a face-to-face encounter in the 30 days before recertifying (from ${longDate(addCalendarDaysUtc(next.start, -30))} if recertifying on the period\'s first day)` : ''}.` : ''}`;
      label = `Period ${cur.n}`;
    } else if (onDate.d < elect) return { valid: false, message: 'Enter the date to check again: it is before the election.' };
  }
  return {
    valid: true,
    band,
    bandLabel: label,
    notes: [...rows.map((r) => `${r}.`), 'Certification is written within 2 calendar days of a period starting, or oral within 2 days and written before billing; it can be done up to 15 days before the period (42 CFR 418.22(a)(3)). The face-to-face encounter applies from the 3rd period on (418.22(a)(4)).'],
    note: POSTURE,
  };
}

// Important Message from Medicare (IM): 42 CFR 405.1205(b)(1) first notice no later than 2 calendar days
// after admission; Pub. 100-04 ch. 30 sec. 200.3.4.1 allows it at a pre-admission visit up to 7 calendar
// days before. Follow-up copy: no more than 2 calendar days before discharge (405.1205(c)(1)) and, per sec.
// 200.3.4.2, as late as 4 hours before; not needed when the first IM was delivered within 2 calendar days
// of discharge (405.1205(c)(2)). The patient asks the QIO no later than the day of discharge (405.1206(b)(1)).
const HOUR_MS = 3600000;
const clockAt = (w) => {
  const d = new Date(w);
  const h = d.getUTCHours();
  return `${longDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())))}, ${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};
const dayOf = (w) => { const d = new Date(w); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); };

export function imNoticeTiming(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const admit = parseDateTime(o.admission);
  if (admit === null) return { valid: false, message: 'Enter the inpatient admission date and time (YYYY-MM-DDTHH:MM).' };
  const admitDay = dayOf(admit);
  const earliest = addCalendarDaysUtc(admitDay, -7);
  const latest = addCalendarDaysUtc(admitDay, 2);
  const del = opt(o.firstDelivered, 'the date the first IM was delivered');
  if (del.error) return { valid: false, message: del.error };
  let dis = null;
  if (String(o.discharge ?? '').trim()) {
    dis = parseDateTime(o.discharge);
    if (dis === null) return { valid: false, message: 'Enter the planned discharge as YYYY-MM-DDTHH:MM, or leave it blank.' };
    if (dis < admit) return { valid: false, message: 'Enter the discharge again: it cannot come before the admission.' };
  }
  const notes = [`First IM window: ${longDate(earliest)} (at a pre-admission visit, up to 7 days before) through ${longDate(latest)}, 2 calendar days after admission.`];
  let band = `Deliver the first IM by ${longDate(latest)}, 2 calendar days after admission (42 CFR 405.1205(b)(1)).`;
  let label = `First IM by ${fmtUtc(latest)}`;
  let abnormal = false;
  if (del.d) {
    if (del.d < earliest) { band = `Too early: the first IM was delivered ${longDate(del.d)}, more than 7 days before admission; deliver it again by ${longDate(latest)}.`; label = 'First IM too early'; abnormal = true; }
    else if (del.d > latest) { band = `Late: the first IM was delivered ${longDate(del.d)}, after ${longDate(latest)} (42 CFR 405.1205(b)(1)).`; label = 'First IM late'; abnormal = true; }
    else { band = `The first IM, delivered ${longDate(del.d)}, was on time.`; label = 'First IM on time'; }
  }
  if (dis !== null) {
    const disDay = dayOf(dis);
    const from = addCalendarDaysUtc(disDay, -2);
    const by = dis - 4 * HOUR_MS;
    const skip = del.d && del.d >= from && del.d <= disDay;
    if (!del.d && from <= admitDay) band += ` Discharge falls within 2 calendar days of admission, so a first IM delivered before discharge needs no follow-up copy (42 CFR 405.1205(c)(2)).`;
    else if (skip) band += ` No follow-up copy is needed: the first IM was delivered within 2 calendar days of discharge (42 CFR 405.1205(c)(2)).`;
    else band += ` Give the follow-up copy no sooner than ${longDate(from)} and no later than ${clockAt(by)}, 4 hours before discharge.`;
    notes.push(`The patient may ask the QIO for a fast appeal until discharge on ${longDate(disDay)}, and a request made in time protects them from liability for the continued stay until noon of the day after the QIO's decision (42 CFR 405.1206).`);
    if (!del.d) notes.push('The first IM\'s delivery date was not entered; if it fell within 2 calendar days of discharge, the follow-up copy is not needed.');
  }
  notes.push('The patient or representative signs and dates the IM; on refusal the hospital annotates it, and the refusal date counts as receipt (42 CFR 405.1205(b)(3)-(4)).');
  return { valid: true, band, bandLabel: label, abnormal, notes, note: POSTURE };
}
