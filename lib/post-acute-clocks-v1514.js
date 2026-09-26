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
import { parseIsoStrict, addCalendarDaysUtc, addMonthsUtc, fmtUtc, countMidnights } from './deadline.js';
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

// Home health: 42 CFR 424.22(a)(1)(v) face-to-face encounter no more than 90 days before or within 30 days
// after the start of care; 424.22(b)(1) recertification at least every 60 days; 484.205(b)(2) 30-day
// payment periods; 484.55(a)(1) initial assessment within 48 hours of referral or return home, or on the
// ordered start-of-care date; 484.55(b)(1) comprehensive assessment no later than 5 calendar days after the
// start of care; 484.55(d)(1) update in the last 5 days of every 60 days from the start of care.
export function homeHealthCertClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const soc = date(o.startOfCare);
  if (!soc) return { valid: false, message: 'Enter the start-of-care date (YYYY-MM-DD).' };
  const f2f = opt(o.faceToFace, 'the face-to-face encounter date');
  if (f2f.error) return { valid: false, message: f2f.error };
  const ref = opt(o.referral, 'the referral date');
  if (ref.error) return { valid: false, message: ref.error };
  const d = (n) => addCalendarDaysUtc(soc, n);
  const from = d(-90);
  const to = d(30);
  const notes = [];
  let f2fText = `The face-to-face encounter must fall between ${longDate(from)} and ${longDate(to)} (42 CFR 424.22(a)(1)(v)).`;
  let abnormal = false;
  if (f2f.d) {
    const ok = f2f.d >= from && f2f.d <= to;
    abnormal = !ok;
    f2fText = ok
      ? `The face-to-face encounter on ${longDate(f2f.d)} is within the window (${longDate(from)} to ${longDate(to)}).`
      : `The face-to-face encounter on ${longDate(f2f.d)} is outside the window of ${longDate(from)} to ${longDate(to)} (42 CFR 424.22(a)(1)(v)).`;
  }
  if (ref.d) notes.push(`Initial assessment visit: within 48 hours of the referral on ${longDate(ref.d)}, or on the ordered start-of-care date (42 CFR 484.55(a)(1)).`);
  else notes.push('Initial assessment visit: within 48 hours of referral or of the patient\'s return home, or on the ordered start-of-care date (42 CFR 484.55(a)(1)).');
  notes.push(`Comprehensive assessment (OASIS) complete by ${longDate(d(5))}, 5 calendar days after the start of care (484.55(b)(1)).`);
  for (let k = 0; k < 3; k += 1) {
    const a = d(60 * k);
    const b = d(60 * k + 59);
    notes.push(`Certification period ${k + 1}: ${longDate(a)} to ${longDate(b)}; payment periods ${longDate(a)} to ${longDate(d(60 * k + 29))} and ${longDate(d(60 * k + 30))} to ${longDate(b)}; ${k < 2 ? `recertification assessment ${longDate(d(60 * k + 55))} to ${longDate(b)}` : `and so on every 60 days`}.`);
  }
  notes.push('Recertification is needed at least every 60 days while care continues, unless the patient transfers or is discharged with goals met (424.22(b)(1)). An assessment is also due within 48 hours of return home from a hospital stay of 24 hours or more, and at discharge (484.55(d)).');
  notes.push('The low-utilization (LUPA) visit thresholds vary by case-mix group and are set in the annual rule; they are not computed here.');
  return {
    valid: true,
    abnormal,
    band: `${f2fText} The first certification period runs ${longDate(soc)} to ${longDate(d(59))}, with the recertification assessment due ${longDate(d(55))} to ${longDate(d(59))}.`,
    bandLabel: abnormal ? 'Face-to-face outside window' : `Recertify by ${fmtUtc(d(59))}`,
    notes,
    note: POSTURE,
  };
}

// DME rentals: 42 CFR 414.229(f) capped rental, paid for at most 13 continuous months, title passing on the
// first day after the 13th continuous paid month; 414.226(a)(1) oxygen equipment rental paid for at most 36
// continuous months, after which the supplier keeps furnishing it for the rest of the reasonable useful
// lifetime (414.226(h)), never less than 5 years from delivery (414.210(f)(1)). Continuous use (414.230):
// an interruption of up to 60 consecutive days plus the days left in the rental month in which use stopped
// is temporary; a longer one starts a new rental period only with a new prescription, new medical necessity
// documentation and a statement that the earlier need ended (414.230(d)).
export const DME_ITEMS = [
  { value: 'capped', text: 'Capped rental item (for example, a hospital bed or wheelchair)' },
  { value: 'oxygen', text: 'Oxygen equipment' },
];
export function dmeRentalClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const item = DME_ITEMS.some((x) => x.value === o.item) ? o.item : null;
  if (!item) return { valid: false, message: 'Choose the item type: capped rental or oxygen.' };
  const del = date(o.delivered);
  if (!del) return { valid: false, message: 'Enter the delivery date (YYYY-MM-DD).' };
  const stop = opt(o.lastUse, 'the last day of use before the break');
  if (stop.error) return { valid: false, message: stop.error };
  const back = opt(o.resumed, 'the day use resumed');
  if (back.error) return { valid: false, message: back.error };
  if (back.d && !stop.d) return { valid: false, message: 'Enter the last day of use before the break as well as the day use resumed.' };
  const cap = item === 'capped' ? 13 : 36;
  const end = addMonthsUtc(del, cap);
  const life = addMonthsUtc(del, 60);
  const notes = [];
  let band = item === 'capped'
    ? `Title passes to the patient on ${longDate(end)}, the first day after 13 continuous paid rental months from delivery on ${longDate(del)} (42 CFR 414.229(f)).`
    : `Rental payments end after 36 continuous months, on ${longDate(addCalendarDaysUtc(end, -1))}; the supplier keeps furnishing the equipment through the reasonable useful lifetime, at least until ${longDate(addCalendarDaysUtc(life, -1))} (42 CFR 414.226(h), 414.210(f)(1)).`;
  let label = item === 'capped' ? `Title ${fmtUtc(end)}` : `Rental ends ${fmtUtc(addCalendarDaysUtc(end, -1))}`;
  let abnormal = false;
  if (stop.d) {
    if (stop.d < del) return { valid: false, message: 'Enter the last day of use again: it cannot come before delivery.' };
    let k = 0;
    while (addMonthsUtc(del, k + 1) <= stop.d) k += 1;
    const monthEnd = addCalendarDaysUtc(addMonthsUtc(del, k + 1), -1);
    const resumeBy = addCalendarDaysUtc(monthEnd, 61);
    const rule = `Use stopped after ${longDate(stop.d)}, in rental month ${k + 1} (which ends ${longDate(monthEnd)}); a break is temporary if use resumes by ${longDate(resumeBy)}: 60 days plus the rest of that month (42 CFR 414.230(c)).`;
    notes.push(rule);
    if (back.d) {
      if (back.d <= stop.d) return { valid: false, message: 'Enter the day use resumed again: it must come after the last day of use.' };
      if (back.d <= resumeBy) {
        notes.push(`Use resumed ${longDate(back.d)}: a temporary interruption, so the same period of continuous use goes on. Months with no rental payment do not count toward the ${cap}, so the date above moves later by those months.`);
        label = 'Temporary break';
      } else {
        band = `Use resumed ${longDate(back.d)}, after ${longDate(resumeBy)}: the break is longer than temporary. A new rental period begins only if the supplier submits a new prescription, new medical necessity documentation and a statement that the earlier need ended (42 CFR 414.230(d)); otherwise the earlier period continues.`;
        label = 'Break too long';
        abnormal = true;
      }
    } else notes.push('The day use resumed was not entered.');
  }
  notes.push('A move, or a change of supplier, does not start a new period of continuous use; new or additional equipment ordered as necessary does (42 CFR 414.230(e)-(g)).');
  notes.push(`Replacement can be paid once the equipment has been in continuous use for its reasonable useful lifetime, never less than 5 years from delivery (from ${longDate(life)}), or sooner if lost, stolen or irreparably damaged (42 CFR 414.210(f)).`);
  return { valid: true, abnormal, band, bandLabel: label, notes, note: POSTURE };
}

// Inpatient rehabilitation: 42 CFR 412.622(a)(4)(i)(A) preadmission screening within the 48 hours
// immediately preceding admission, or earlier with an update within those 48 hours; 412.622(a)(3)(ii)
// therapy begins within 36 hours from midnight of the day of admission (read as the midnight that ends that
// day; the Benefit Policy Manual, ch. 1 sec. 110.2.2, gives no example, so the earlier reading is shown
// too); IRF-PAI (412.610(c)-(d), 412.614(c)): admission assessment over days 1-3, completed on day 4,
// encoded by the 7th calendar day from completion; discharge assessment completed on the 5th day after
// discharge, encoded by the 7th day from then; both transmitted by the 7th day from the discharge encoding.
export function irfComplianceClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const admit = parseDateTime(o.admission);
  if (admit === null) return { valid: false, message: 'Enter the IRF admission date and time (YYYY-MM-DDTHH:MM).' };
  const opTime = (v, what) => {
    if (!String(v ?? '').trim()) return { none: true };
    const t = parseDateTime(v);
    return t === null ? { error: `Enter ${what} as YYYY-MM-DDTHH:MM, or leave it blank.` } : { t };
  };
  const scr = opTime(o.screening, 'the preadmission screening time');
  const upd = opTime(o.screeningUpdate, 'the screening update time');
  const ther = opTime(o.firstTherapy, 'the first therapy session time');
  for (const x of [scr, upd, ther]) if (x.error) return { valid: false, message: x.error };
  const dis = opt(o.discharge, 'the discharge date');
  if (dis.error) return { valid: false, message: dis.error };
  const day = dayOf(admit);
  const d = (n) => addCalendarDaysUtc(day, n);
  const therapyBy = day.getTime() + 60 * HOUR_MS;
  const therapyEarly = day.getTime() + 36 * HOUR_MS;
  const findings = [];
  let fails = 0;
  const within48 = (t) => t <= admit && t >= admit - 48 * HOUR_MS;
  if (scr.t !== undefined) {
    if (scr.t > admit) { findings.push('Preadmission screening: after admission, so it does not count.'); fails += 1; }
    else if (within48(scr.t)) findings.push(`Preadmission screening at ${clockAt(scr.t)}: within the 48 hours before admission (42 CFR 412.622(a)(4)(i)).`);
    else if (upd.t !== undefined && within48(upd.t)) findings.push(`Preadmission screening at ${clockAt(scr.t)} is more than 48 hours before admission, but the update at ${clockAt(upd.t)} falls within them, which is accepted.`);
    else { findings.push(`Preadmission screening at ${clockAt(scr.t)}: more than 48 hours before admission, with no update within the 48 hours (from ${clockAt(admit - 48 * HOUR_MS)}).`); fails += 1; }
  }
  if (ther.t !== undefined) {
    if (ther.t <= therapyBy) findings.push(`First therapy at ${clockAt(ther.t)}: within 36 hours of the midnight ending the admission day (by ${clockAt(therapyBy)}).`);
    else { findings.push(`First therapy at ${clockAt(ther.t)}: after ${clockAt(therapyBy)}, 36 hours from the midnight ending the admission day (42 CFR 412.622(a)(3)(ii)).`); fails += 1; }
  }
  const notes = [
    `Therapy must begin by ${clockAt(therapyBy)}, 36 hours from the midnight that ends the admission day; counted from the midnight that begins it, the limit is ${clockAt(therapyEarly)}. Therapy evaluations count as the start (Benefit Policy Manual, ch. 1 sec. 110.2.2).`,
    `IRF-PAI admission assessment: days 1 to 3 (${longDate(day)} to ${longDate(d(2))}), completed ${longDate(d(3))}, encoded by ${longDate(d(9))} (42 CFR 412.610(c)(1), (d)).`,
  ];
  if (dis.d) {
    if (dis.d < day) return { valid: false, message: 'Enter the discharge date again: it cannot come before admission.' };
    notes.push(`IRF-PAI discharge assessment: completed ${longDate(addCalendarDaysUtc(dis.d, 5))}, encoded by ${longDate(addCalendarDaysUtc(dis.d, 11))}; admission and discharge assessments transmitted together by ${longDate(addCalendarDaysUtc(dis.d, 17))} (412.610(c)(2), (d); 412.614(c)).`);
  }
  notes.push('Intensity: generally at least 3 hours of therapy a day at least 5 days a week, or in well-documented cases at least 15 hours a week (412.622(a)(3)(ii)); the minutes are not totaled here.');
  const band = findings.length
    ? `${fails ? `${fails} requirement${fails > 1 ? 's' : ''} not met.` : 'The timing entered is met.'} ${findings.join(' ')}`
    : `First therapy by ${clockAt(therapyBy)}; preadmission screening within the 48 hours before ${clockAt(admit)}.`;
  return { valid: true, abnormal: fails > 0, band, bandLabel: fails ? `${fails} not met` : findings.length ? 'Met' : `Therapy by ${new Date(therapyBy).toISOString().slice(0, 16).replace('T', ' ')}`, notes, note: POSTURE };
}

// Inpatient-to-observation change (MCSN, CMS-10868): 42 CFR 405.1210(a)(3) eligibility: formally admitted,
// then reclassified to outpatient observation, and either no Part B, or 3 or more consecutive days in the
// hospital with fewer than 3 as an inpatient, days counted as in 409.30 (from the first day, not counting
// the discharge day). 405.1210(b)(1): the notice as soon as possible after reclassification and no later
// than 4 hours before release. 405.1211: the request reaches the QIO before release (a late one is still
// decided, without billing protection); the hospital sends records by noon of the calendar day after the
// QIO calls; the QIO decides within 1 calendar day of the records (2 if late). 405.1212: reconsideration by
// noon of the calendar day after notice of the decision, decided within 2 calendar days (3 if late). In
// effect for admissions from February 14, 2025 (CMS-4204-F); retrospective appeals for older stays had to be
// filed by January 2, 2026, unless good cause is shown.
export const PART_B_OPTIONS = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export function mcsnAppealRights(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const arrive = date(o.hospitalStart);
  if (!arrive) return { valid: false, message: 'Enter the first day of the hospital stay (YYYY-MM-DD), counting any time in the emergency department or observation before admission.' };
  const admit = date(o.admitted);
  if (!admit) return { valid: false, message: 'Enter the date of the inpatient admission order (YYYY-MM-DD).' };
  const reclass = date(o.reclassified);
  if (!reclass) return { valid: false, message: 'Enter the date the hospital reclassified the patient to outpatient observation (YYYY-MM-DD).' };
  const partB = o.partB === 'yes' || o.partB === 'no' ? o.partB : null;
  if (!partB) return { valid: false, message: 'Choose whether the patient had Part B during the stay.' };
  const rel = String(o.release ?? '').trim() ? parseDateTime(o.release) : undefined;
  if (rel === null) return { valid: false, message: 'Enter the release as YYYY-MM-DDTHH:MM, or leave it blank.' };
  if (admit < arrive || reclass < admit) return { valid: false, message: 'Enter the dates again: the stay starts on or before admission, and reclassification comes on or after it.' };
  const relDay = rel === undefined ? null : dayOf(rel);
  if (relDay && relDay < reclass) return { valid: false, message: 'Enter the release again: it cannot come before reclassification.' };
  const notes = [];
  if (admit < new Date(Date.UTC(2025, 1, 14))) {
    return { valid: true, eligible: null, band: 'This expedited appeal applies to admissions from February 14, 2025. For an earlier stay, the retrospective appeal had to be filed by January 2, 2026; a later request is denied unless good cause for the delay is shown.', bandLabel: 'Before February 14, 2025', notes, note: POSTURE };
  }
  const inpatientDays = countMidnights(admit, reclass);
  const stayDays = relDay ? countMidnights(arrive, relDay) : null;
  let eligible;
  let why;
  if (partB === 'no') { eligible = true; why = 'the patient had no Part B, so Medicare does not cover the outpatient observation care'; }
  else if (stayDays === null) {
    eligible = null;
    why = `the patient was an inpatient for ${inpatientDays} day${inpatientDays === 1 ? '' : 's'}; with Part B, eligibility turns on a hospital stay of 3 or more days, which needs the release date`;
  } else if (stayDays >= 3 && inpatientDays < 3) { eligible = true; why = `the hospital stay is ${stayDays} days, ${inpatientDays} of them as an inpatient (3 or more days, fewer than 3 as an inpatient)`; }
  else { eligible = false; why = stayDays < 3 ? `the hospital stay is ${stayDays} day${stayDays === 1 ? '' : 's'}, under 3` : `the patient was an inpatient for ${inpatientDays} days, already 3 or more`; }
  notes.push(`Days are counted as for skilled nursing coverage: each calendar day from the first, not counting the day of reclassification or release (42 CFR 405.1210(a)(3)(iv), 409.30).`);
  let band = eligible === true
    ? `Eligible for the expedited appeal: ${why} (42 CFR 405.1210(a)(3)).`
    : eligible === false
      ? `Not eligible for this appeal: ${why} (42 CFR 405.1210(a)(3)).`
      : `Eligibility depends on the release date: ${why}.`;
  if (eligible !== false && rel !== undefined) {
    band += ` Deliver the notice (MCSN) as soon as possible and no later than ${clockAt(rel - 4 * HOUR_MS)}, 4 hours before release (405.1210(b)(1)).`;
  }
  if (eligible !== false) {
    notes.push('The patient asks the QIO, in writing or by phone, before release; a later request is still decided (within 2 calendar days of the records) but without the protection from being billed (42 CFR 405.1211(b)).');
    notes.push('The hospital sends the QIO its records by noon of the calendar day after the QIO calls; the QIO decides within 1 calendar day of receiving them, and the hospital may not bill for the disputed services until the review is done (405.1211(c)-(e)).');
    notes.push('A patient who disagrees asks for reconsideration by noon of the calendar day after being told of the decision; the QIO decides within 2 calendar days of the records (405.1212).');
  }
  return { valid: true, eligible, band, bandLabel: eligible === true ? 'Eligible' : eligible === false ? 'Not eligible' : 'Needs release date', notes, note: POSTURE };
}
