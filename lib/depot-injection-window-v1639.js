// spec-v1639 tool 4: a depot injection's next due date and the window each source gives.
//
// Sources, re-read October 12, 2026 (DailyMed, section 2 of each label):
//   Depo-Provera CI (set id 199cf13e-0859-4a73-9b45-e700d0cd1049, version 29): "150 mg of
//     Depo-Provera CI every 3 months (13 weeks)". "If the time interval between injections is greater
//     than 13 weeks, the physician should determine that the patient is not pregnant before
//     administering the drug."
//   depo-subQ provera 104 (390087a6-f3c3-4f0b-a930-79acf412f153, version 21): "104 mg given
//     subcutaneously every 12 to 14 weeks. If more than 14 weeks elapse between injections, confirm
//     that the patient is not pregnant before the next injection. Instruct the patient that if they
//     are unable to receive an injection within 12-14 weeks, another contraceptive method should be
//     used until the next depo-subQ provera 104 injection."
//   Vivitrol (cd11c435-b0f0-4bb9-ae78-60f101f3703f, version 39): "380 mg delivered intramuscularly
//     ... every 4 weeks or once a month". No window and no missed-dose rule is stated.
//   Sublocade (6189fb21-9432-45f8-8481-0bfaf3ccde95, version 43): "The second injection may be
//     administered as early as 1 week and up to 1 month after the initial injection". "Maintenance
//     doses should be administered with at least 26 days between injections." "A patient who misses
//     a maintenance dose should receive the next dose as soon as possible, with the following dose
//     given at least 26 days later. Occasional delays in dosing up to 2 weeks are not expected to
//     have a clinically significant impact on treatment effect."
//   Brixadi (5d8a8fd0-8619-422a-a664-d1d2e8970f48, version 6): "BRIXADI (weekly) should be
//     administered in 7-day intervals. BRIXADI (monthly) should be administered in 28-day
//     intervals." "the weekly dose may be administered up to 2 days before or after the weekly time
//     point, and the monthly dose may be administered up to 1 week before or after the monthly time
//     point. If a dose is missed, the next dose should be administered as soon as practically
//     possible."
//   CDC, U.S. Selected Practice Recommendations for Contraceptive Use, 2024 (PMC11340200), "Timing
//     of Repeat Injections": "every 3 months (13 weeks)"; "may be administered early when
//     necessary"; "up to 2 weeks late (15 weeks from the last injection) without requiring
//     additional contraceptive protection"; later, "they may have the injection if it is reasonably
//     certain that they are not pregnant", then 7 days of abstinence or barrier methods. CDC
//     describes DMPA 150 mg IM and 104 mg SC as differing only in route.
//
// For medroxyprogesterone the label and CDC answer different questions (when to rule out
// pregnancy; when back-up is needed). They are shown side by side and never merged. The tool does
// not say whether to give an injection.
//
// Pure: no DOM, no network. `now` is read only to check that each label edition still stands.

import { parseIsoStrict, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = [
  { value: 'dmpa-im-150', text: 'Medroxyprogesterone 150 mg IM (Depo-Provera CI)', setId: '199cf13e-0859-4a73-9b45-e700d0cd1049', brand: 'Depo-Provera CI' },
  { value: 'dmpa-sc-104', text: 'Medroxyprogesterone 104 mg SC (depo-subQ provera 104)', setId: '390087a6-f3c3-4f0b-a930-79acf412f153', brand: 'depo-subQ provera 104' },
  { value: 'naltrexone-er-380', text: 'Naltrexone extended-release 380 mg (Vivitrol)', setId: 'cd11c435-b0f0-4bb9-ae78-60f101f3703f', brand: 'Vivitrol' },
  { value: 'sublocade-monthly', text: 'Buprenorphine extended-release monthly (Sublocade)', setId: '6189fb21-9432-45f8-8481-0bfaf3ccde95', brand: 'Sublocade' },
  { value: 'brixadi-weekly', text: 'Buprenorphine extended-release weekly (Brixadi)', setId: '5d8a8fd0-8619-422a-a664-d1d2e8970f48', brand: 'Brixadi' },
  { value: 'brixadi-monthly', text: 'Buprenorphine extended-release monthly (Brixadi)', setId: '5d8a8fd0-8619-422a-a664-d1d2e8970f48', brand: 'Brixadi' },
];
export const SUBLOCADE_NEXT = [
  { value: 'second-sublocade-injection', text: 'The second injection' },
  { value: 'third-or-later-sublocade-injection', text: 'The third injection or later (maintenance)' },
];
const POSTURE = 'This is what the label and CDC state for these inputs. It is not advice for a particular patient, and it does not say whether to give the injection.';
const POSTURE_LABEL = 'This is what the label states for these inputs. It is not advice for a particular patient, and it does not say whether to give the injection.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
const iso = (d) => d.toISOString().slice(0, 10);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const CDC_DMPA = (last, planned) => {
  const w15 = addCalendarDaysUtc(last, 105);
  const lines = [`CDC 2024 (medroxyprogesterone by either route): repeat injections every 3 months (13 weeks). The injection "may be administered early when necessary"; CDC gives no time limit for an early injection. It "may be administered up to 2 weeks late (15 weeks from the last injection) without requiring additional contraceptive protection": through ${say(w15)}. More than 15 weeks from the last injection, "they may have the injection if it is reasonably certain that they are not pregnant", then abstinence or barrier methods for the next 7 days; emergency contraception (with the exception of UPA) may be considered if appropriate.`];
  if (planned) lines.push(planned.getTime() > w15.getTime() ? `By CDC's line the planned date is more than 15 weeks from the last injection; 7 days from it is ${say(addCalendarDaysUtc(planned, 7))}.` : 'By CDC\'s line the planned date is within 15 weeks of the last injection: no additional contraceptive protection is required.');
  return lines;
};

export function depotInjectionWindow(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product.' };
  const last = date(o.lastInjection);
  if (!last) return { valid: false, message: 'Enter the date of the last injection.' };
  let planned = null;
  if (!blank(o.plannedDate)) {
    planned = date(o.plannedDate);
    if (!planned) return { valid: false, message: 'Enter the planned date as a date, or leave it blank.' };
    if (planned.getTime() <= last.getTime()) return { valid: false, message: 'Enter a planned date after the last injection.' };
    if ((planned.getTime() - last.getTime()) / 86400000 > 730) return { valid: false, message: 'Enter dates no more than two years apart.' };
  }
  let next = null;
  if (p.value === 'sublocade-monthly') {
    next = SUBLOCADE_NEXT.find((x) => x.value === String(o.sublocadeNext ?? '').trim());
    if (!next) return { valid: false, message: 'Choose whether the next Sublocade injection is the second or a maintenance injection: the label\'s 26-day line is for maintenance doses.' };
  }
  const lr = labelRow(p.setId, now, table);
  const dmpa = p.value.startsWith('dmpa');
  const plus = (n) => addCalendarDaysUtc(last, n);
  const notes = []; const out = { valid: true, product: p.value, labelUrl: lr.url };
  const days = planned ? Math.round((planned.getTime() - last.getTime()) / 86400000) : null;
  if (planned) notes.push(`The planned date, ${say(planned)}, is ${days} day${days === 1 ? '' : 's'} (${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} and ${days % 7} day${days % 7 === 1 ? '' : 's'}) after the last injection on ${say(last)}.`);
  else notes.push(`Last injection: ${say(last)}. No planned date was entered, so the dates are shown without placing one.`);

  if (!lr.answers) {
    notes.push(`The ${p.brand} label lines are withheld: ${lr.why}. Read the interval from the label in hand.`);
    if (dmpa) notes.push(...CDC_DMPA(last, planned));
    notes.push(dmpa ? POSTURE : POSTURE_LABEL);
    return { ...out, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} label's interval is withheld, so no due date is shown.`, bandLabel: 'Withheld', notes, note: notes.join(' ') };
  }
  let due; let earliest = null; let latest = null; let late = false; let early = false;
  if (p.value === 'dmpa-im-150') {
    due = plus(91); latest = due;
    notes.push(`Label: 150 mg "every 3 months (13 weeks)": 13 weeks from the last injection is ${say(due)}. "If the time interval between injections is greater than 13 weeks, the physician should determine that the patient is not pregnant before administering the drug." The label states no earliest date.`);
    if (planned) { late = days > 91; notes.push(late ? 'By the label the planned date is more than 13 weeks after the last injection, so its pregnancy sentence applies.' : 'By the label the planned date is within 13 weeks of the last injection.'); }
    notes.push(...CDC_DMPA(last, planned));
  } else if (p.value === 'dmpa-sc-104') {
    earliest = plus(84); due = earliest; latest = plus(98);
    notes.push(`Label: 104 mg "every 12 to 14 weeks": ${say(earliest)} to ${say(latest)}. "If more than 14 weeks elapse between injections, confirm that the patient is not pregnant before the next injection." The label also says that a patient unable to receive an injection within 12 to 14 weeks should use another contraceptive method until the next injection.`);
    if (planned) { late = days > 98; early = days < 84; notes.push(late ? 'By the label the planned date is more than 14 weeks after the last injection, so its pregnancy sentence applies.' : early ? 'The planned date is before 12 weeks; the label states no rule for an injection earlier than 12 weeks.' : 'By the label the planned date is inside 12 to 14 weeks.'); }
    notes.push(...CDC_DMPA(last, planned));
  } else if (p.value === 'naltrexone-er-380') {
    due = plus(28); const month = addMonthsUtc(last, 1);
    out.oneMonthDate = iso(month);
    notes.push(`Label: 380 mg "every 4 weeks or once a month". 4 weeks from the last injection is ${say(due)}; one calendar month is ${say(month)}. The label states no window around either date and no missed-dose rule, so none is shown.`);
    if (planned) notes.push(`The planned date is ${days - 28 === 0 ? 'on the 4-week date' : days > 28 ? `${days - 28} days after the 4-week date` : `${28 - days} days before the 4-week date`}. The label gives no line to place it against.`);
    notes.push('The label\'s section 2 does say this about a missed dose: after a dose is missed, strongly consider recommending or prescribing an opioid overdose reversal agent.');
  } else if (p.value === 'sublocade-monthly') {
    const month = addMonthsUtc(last, 1); due = month;
    if (next.value === 'second-sublocade-injection') {
      earliest = plus(7); latest = month;
      notes.push(`Label: "The second injection may be administered as early as 1 week and up to 1 month after the initial injection, based on patient need": ${say(earliest)} to ${say(month)}. The 26-day line is for maintenance doses and does not apply to the second injection.`);
      if (planned) { early = days < 7; late = planned.getTime() > month.getTime(); notes.push(early ? 'The planned date is less than 1 week after the first injection.' : late ? 'The planned date is more than 1 month after the first injection.' : 'The planned date is inside the label\'s 1 week to 1 month.'); }
    } else {
      earliest = plus(26);
      notes.push(`Label: monthly maintenance doses, "with at least 26 days between injections": the earliest date is ${say(earliest)}; one calendar month is ${say(month)}. The label states no latest date.`);
      notes.push(`Missed dose: "A patient who misses a maintenance dose should receive the next dose as soon as possible, with the following dose given at least 26 days later. Occasional delays in dosing up to 2 weeks are not expected to have a clinically significant impact on treatment effect." Two weeks past one calendar month is ${say(addCalendarDaysUtc(month, 14))}.`);
      if (planned) { early = days < 26; notes.push(early ? `The planned date is ${26 - days} days short of the label's 26 days between maintenance injections.` : `The planned date is at least 26 days after the last injection. A following dose would be at least 26 days later: ${say(addCalendarDaysUtc(planned, 26))} or after.`); }
    }
  } else {
    const weekly = p.value === 'brixadi-weekly';
    const interval = weekly ? 7 : 28; const slack = weekly ? 2 : 7;
    due = plus(interval); earliest = plus(interval - slack); latest = plus(interval + slack);
    notes.push(`Label: Brixadi (${weekly ? 'weekly' : 'monthly'}) "should be administered in ${interval}-day intervals": ${say(due)}. "To avoid missed doses, the weekly dose may be administered up to 2 days before or after the weekly time point, and the monthly dose may be administered up to 1 week before or after the monthly time point": ${say(earliest)} to ${say(latest)}. "If a dose is missed, the next dose should be administered as soon as practically possible."`);
    if (planned) { early = planned.getTime() < earliest.getTime(); late = planned.getTime() > latest.getTime(); notes.push(early ? 'The planned date is before the label\'s window.' : late ? 'The planned date is after the label\'s window; the label\'s missed-dose sentence is the one that speaks to it.' : 'The planned date is inside the label\'s window.'); }
  }
  notes.push(`Label: ${lr.edition}.`);
  notes.push(dmpa ? POSTURE : POSTURE_LABEL);
  out.dueDate = iso(due);
  if (earliest) out.earliestDate = iso(earliest);
  if (latest) out.latestDate = iso(latest);
  const flag = !planned ? 'dates' : late ? 'after-the-label-date' : early ? 'before-the-label-date' : 'inside';
  return { ...out, flag, abnormal: late || early, band: p.value === 'dmpa-sc-104' ? `Due ${say(earliest)} to ${say(latest)} (label).` : p.value === 'naltrexone-er-380' ? `Due ${say(due)} (4 weeks) or ${say(addMonthsUtc(last, 1))} (one month).` : `Due ${say(due)} (label).`, bandLabel: !planned ? p.brand : late ? 'Planned date is past the label\'s date' : early ? 'Planned date is before the label\'s date' : 'Planned date is inside the label\'s dates', notes, note: notes.join(' ') };
}
