// spec-v1639 tool 6: what the label says about a missed dose of an oral or self-injected product.
//
// Sources: section 2 of each label on DailyMed, re-read October 12, 2026. The label's own sentence is
// quoted in each RULES row below; the set ids are in PRODUCTS. Only products whose label states a
// missed-dose rule are listed. The Synthroid label states none, and no current Bydureon BCise label
// was found on DailyMed; neither is here. Xarelto's pediatric rules (section 2.5, "Pediatric
// Patients", version 65) were re-read October 14, 2026 and are the three pediatric rows; the label
// does not define "the same evening", so an evening dose is read against the same calendar day.
//
// The tool evaluates the label's rule on the times entered and prints the sentence. Where a label
// leaves a boundary undefined (Wegovy: exactly 2 days before the next dose is neither "more than"
// nor "less than") both rows are shown. Nothing beyond the label's sentence is added.
//
// Changing the weekly day (re-read October 14, 2026, the same label versions): section 2 of Ozempic (2.1),
// Mounjaro (2.1), Zepbound (2.3) and Trulicity (2.3) says the day of weekly administration can be changed
// if the gap between two doses is long enough. Ozempic writes "at least 2 days (>48 hours)", which
// disagree at exactly 48 hours, so that boundary shows both readings. Wegovy's section 2 has no such
// sentence (only its patient leaflet does), so Wegovy is not offered for a change of day.
//
// Pure: no DOM, no network. Times are entered. `now` is read only to check the label edition.

import { dpSafe } from './cut-display.js';
import { labelRow } from './label-row.js';

const L = {
  eliquis: ['e9481622-7cc6-418a-acb6-c5450daae9b0', 'Eliquis'], xarelto: ['10db92f9-2300-4a80-836b-673e1ae91610', 'Xarelto'], pradaxa: ['ba74e3cd-b06f-4145-b284-5fd6b84ff3c9', 'Pradaxa capsules'], savaysa: ['e77d3400-56ad-11e3-949a-0800200c9a66', 'Savaysa'],
  ozempic: ['adec4fd2-6858-4c99-91d4-531f5f2a2d79', 'Ozempic'], wegovy: ['ee06186f-2aa3-4990-a760-757579d8f77b', 'Wegovy'], rybelsus: ['27f15fac-7d98-4114-a2ec-92494a91da98', 'Rybelsus and Ozempic tablets'],
  mounjaro: ['d2d7da5d-ad07-4228-955f-cf7e355c8cc0', 'Mounjaro'], zepbound: ['487cd7e7-434c-4925-99fa-aa80b1cc776b', 'Zepbound'], trulicity: ['463050bd-2b1c-40f5-b3c3-0a04bb433309', 'Trulicity'],
  victoza: ['5a9ef4ea-c76a-4d34-a604-27c5b505f5a4', 'Victoza'], saxenda: ['3946d389-0926-4f77-a708-0acb8153b143', 'Saxenda'], fosamax: ['14e931fd-2c5f-4d90-b7db-5980706f4a56', 'Fosamax'],
  actonel: ['24ed00e0-25e2-49a8-97fc-66c1b417dc0b', 'Actonel'], atelvia: ['c8b9ab88-1a26-46c3-80ec-4eaa45202021', 'Atelvia'], ibandronate: ['6ca94cce-a2bb-421f-bd8f-6b14bc2bd985', 'Ibandronate 150 mg tablets (Bionpharma)'],
};
// kind decides the arithmetic; needs lists the extra inputs the rule turns on.
export const PRODUCTS = [
  { value: 'apixaban-bid', text: 'Apixaban (Eliquis)', label: 'eliquis', kind: 'same-day', sec: '2.3', quote: '"If a dose of ELIQUIS is not taken at the scheduled time, the dose should be taken as soon as possible on the same day and twice-daily administration should be resumed. The dose should not be doubled to make up for a missed dose."' },
  { value: 'rivaroxaban-2-5-bid', text: 'Rivaroxaban 2.5 mg twice daily (Xarelto), adults', label: 'xarelto', kind: 'say', verdict: 'next-scheduled-dose', band: 'The label says: a single 2.5 mg dose at the next scheduled time.', sec: '2.5', quote: '"For patients receiving 2.5 mg twice daily: if a dose is missed, the patient should take a single 2.5 mg XARELTO dose as recommended at the next scheduled time."' },
  { value: 'rivaroxaban-15-bid', text: 'Rivaroxaban 15 mg twice daily (Xarelto), adults', label: 'xarelto', kind: 'say', verdict: 'take', band: 'The label says: take it immediately, to reach 30 mg that day.', sec: '2.5', quote: '"For patients receiving 15 mg twice daily: The patient should take XARELTO immediately to ensure intake of 30 mg XARELTO per day. Two 15 mg tablets may be taken at once."' },
  { value: 'rivaroxaban-qd', text: 'Rivaroxaban 20, 15 or 10 mg once daily (Xarelto), adults', label: 'xarelto', kind: 'say', verdict: 'take', band: 'The label says: take the missed dose immediately; not doubled within the same day.', sec: '2.5', quote: '"For patients receiving 20 mg, 15 mg or 10 mg once daily: The patient should take the missed XARELTO dose immediately. The dose should not be doubled within the same day to make up for a missed dose."' },
  { value: 'rivaroxaban-peds-qd', text: 'Rivaroxaban once a day (Xarelto), pediatric', label: 'xarelto', kind: 'same-day-else-skip', sec: '2.5', quote: '"If XARELTO is taken once a day, the patient should take the missed dose as soon as possible once it is noticed, but only on the same day. If this is not possible, the patient should skip the dose and continue with the next dose as prescribed. The patient should not take two doses to make up for a missed dose."' },
  { value: 'rivaroxaban-peds-bid', text: 'Rivaroxaban two times a day (Xarelto), pediatric', label: 'xarelto', kind: 'peds-bid', needs: ['slot'], sec: '2.5', quote: '"If XARELTO is taken two times a day, the patient should take the missed morning dose as soon as possible once it is noticed. A missed morning dose may be taken together with the evening dose. A missed evening dose can only be taken in the same evening."' },
  { value: 'rivaroxaban-peds-tid', text: 'Rivaroxaban three times a day (Xarelto), pediatric', label: 'xarelto', kind: 'say', verdict: 'skip', band: 'The label says: skip the missed dose and return to the usual schedule.', sec: '2.5', quote: '"If XARELTO is taken three times a day, if a dose is missed, the patient should skip the missed dose and go back to the regular dosing schedule at the usual time without compensating for the missed dose. On the following day, the patient should continue with their regular regimen."' },
  { value: 'dabigatran-capsules', text: 'Dabigatran capsules (Pradaxa)', label: 'pradaxa', kind: 'same-day-before-next', hoursBeforeNext: 6, needs: ['next'], sec: '2.5', quote: '"If a dose of PRADAXA Capsules is not taken at the scheduled time, the dose should be taken as soon as possible on the same day; the missed dose should be skipped if it cannot be taken at least 6 hours before the next scheduled dose. The dose of PRADAXA Capsules should not be doubled to make up for a missed dose."' },
  { value: 'edoxaban-qd', text: 'Edoxaban (Savaysa)', label: 'savaysa', kind: 'same-day', sec: '2.3', quote: '"If a dose of SAVAYSA is missed, the dose should be taken as soon as possible on the same day. Dosing should resume the next day according to the normal dosing schedule. The dose should not be doubled to make up for a missed dose."' },
  { value: 'semaglutide-weekly-ozempic', text: 'Semaglutide injection (Ozempic)', label: 'ozempic', kind: 'within-after', hours: 120, days: 5, sec: '2.1', quote: '"If a dose is missed, administer OZEMPIC as soon as possible within 5 days after the missed dose. If more than 5 days have passed, skip the missed dose and administer the next dose on the regularly scheduled day."' },
  { value: 'semaglutide-weekly-weight-management', text: 'Semaglutide injection (Wegovy)', label: 'wegovy', kind: 'before-next-open', hours: 48, needs: ['next'], sec: '2.4', quote: '"If one dose of WEGOVY injection is missed and the next scheduled dose is: more than 2 days away, administer WEGOVY injection as soon as possible; less than 2 days away, do not administer the WEGOVY injection dose. Resume dosing on the regularly scheduled day of the week. If 2 or more consecutive doses of WEGOVY injection are missed, reinitiate dosage escalation at a lower dosage to reduce the risk of gastrointestinal adverse reactions."' },
  { value: 'semaglutide-tablets', text: 'Semaglutide tablets (Rybelsus, Ozempic tablets, Wegovy tablets)', label: 'rybelsus', also: 'wegovy', kind: 'say', verdict: 'skip', band: 'The label says: skip the missed dose and take the next dose the following day.', sec: '2.1', quote: '"If a dose is missed, skip the missed dose and take the next dose the following day." The Wegovy label says the same of Wegovy tablets (section 2.4).' },
  { value: 'tirzepatide-mounjaro', text: 'Tirzepatide (Mounjaro)', label: 'mounjaro', kind: 'within-after', hours: 96, days: 4, sec: '2.1', quote: '"If a dose is missed, instruct patients to administer MOUNJARO as soon as possible within 4 days (96 hours) after the missed dose. If more than 4 days have passed, skip the missed dose and administer the next dose on the regularly scheduled day."' },
  { value: 'tirzepatide-zepbound', text: 'Tirzepatide (Zepbound)', label: 'zepbound', kind: 'within-after', hours: 96, days: 4, sec: '2.3', quote: '"If a dose is missed, instruct patients to administer ZEPBOUND as soon as possible within 4 days (96 hours) after the missed dose. If more than 4 days have passed, skip the missed dose and administer the next dose on the regularly scheduled day."' },
  { value: 'dulaglutide-weekly', text: 'Dulaglutide (Trulicity)', label: 'trulicity', kind: 'before-next-closed', hours: 72, needs: ['next'], sec: '2.3', quote: '"If a dose is missed, instruct patients to administer the dose as soon as possible if there are at least 3 days (72 hours) until the next scheduled dose. If less than 3 days remain before the next scheduled dose, skip the missed dose and administer the next dose on the regularly scheduled day."' },
  { value: 'liraglutide-diabetes', text: 'Liraglutide (Victoza)', label: 'victoza', kind: 'liraglutide', needs: ['last'], sec: '2.2', quote: '"Instruct patients who miss a dose of VICTOZA to resume the once daily dosage regimen as prescribed with the next scheduled dose. Do not administer an extra dose or increase the dose to make up for the missed dose. If more than 3 days have elapsed since the last VICTOZA dose, reinitiate VICTOZA at 0.6 mg once daily to reduce the risk of gastrointestinal adverse reactions associated with reinitiation of treatment. Upon reinitiation, VICTOZA should be titrated at the discretion of the healthcare provider."' },
  { value: 'liraglutide-weight-management', text: 'Liraglutide (Saxenda)', label: 'saxenda', kind: 'liraglutide', needs: ['last'], sec: '2.1', quote: '"If a dose is missed, resume the once-daily regimen as prescribed with the next scheduled dose. Do not administer an extra dose or increase the dose to make up for the missed dose. If more than 3 days have elapsed since the last SAXENDA dosage, reinitiate SAXENDA at 0.6 mg daily and follow the dosage escalation schedule in Table 1, to reduce the risk of gastrointestinal adverse reactions associated with reinitiation of treatment."' },
  { value: 'alendronate-weekly', text: 'Alendronate once weekly (Fosamax)', label: 'fosamax', kind: 'morning-after', sec: '2.8', quote: '"If a once-weekly dose of FOSAMAX is missed, instruct patients to take one dose on the morning after they remember. They should not take two doses on the same day but should return to taking one dose once a week, as originally scheduled on their chosen day."' },
  { value: 'risedronate-35-weekly', text: 'Risedronate 35 mg once a week (Actonel)', label: 'actonel', kind: 'morning-after', sec: '2.8', quote: '"If a dose of ACTONEL 35 mg once-a-week is missed: Take 1 tablet on the morning after they remember and return to taking 1 tablet once-a-week, as originally scheduled on their chosen day. Do not take 2 tablets on the same day."' },
  { value: 'risedronate-dr-weekly', text: 'Risedronate delayed-release 35 mg once a week (Atelvia)', label: 'atelvia', kind: 'morning-after', sec: '2.4', quote: '"If the once-weekly dose is missed, instruct patients to take one tablet on the morning after they remember and return to taking one tablet once-a-week, as originally scheduled on their chosen day. Patients should not take two tablets on the same day."' },
  { value: 'risedronate-150-monthly', text: 'Risedronate 150 mg once a month (Actonel)', label: 'actonel', kind: 'monthly-7', needs: ['next'], sec: '2.8', quote: '"If the dose of ACTONEL 150 mg once-a-month is missed, and the next month\'s scheduled dose is more than 7 days away: Take the missed tablet in the morning after the day it is remembered and then return to taking their ACTONEL 150 mg once-a-month as originally scheduled. Do not take more than one 150 mg tablet within 7 days. If ... the next month\'s scheduled dose is within 7 days: Wait until their next month\'s scheduled dose".' },
  { value: 'risedronate-75-two-days-monthly', text: 'Risedronate 75 mg on two consecutive days a month (Actonel)', label: 'actonel', kind: 'monthly-7', two: true, needs: ['next', 'tablets'], sec: '2.8', quote: '"If one or both tablets of ACTONEL 75 mg on two consecutive days per month are missed, and the next month\'s scheduled doses are more than 7 days away: If both tablets are missed, take one ACTONEL 75 mg tablet in the morning after the day it is remembered and then the other tablet on the next consecutive morning. If only one ACTONEL 75 mg tablet is missed, take the missed tablet in the morning after the day it is remembered ... Do not take more than two 75 mg tablets within 7 days. If ... the next month\'s scheduled doses are within 7 days: Wait until their next month\'s scheduled doses".' },
  { value: 'ibandronate-150-monthly', text: 'Ibandronate 150 mg once a month', label: 'ibandronate', kind: 'monthly-7', needs: ['next'], sec: '2.4', quote: '"If the next scheduled Ibandronate Sodium Tablet day is more than 7 days away, take one Ibandronate Sodium Tablet 150 mg (ibandronate) in the morning following the date that it is remembered. If the next scheduled Ibandronate Sodium Tablet day is only 1 to 7 days away, wait until the subsequent month\'s scheduled Ibandronate Sodium Tablet day to take their tablet."' },
].map((p) => ({ ...p, setId: L[p.label][0], brand: L[p.label][1] }));
// The weekly products whose section 2 states when the dosing day may change: the least gap in hours, and
// whether the label's words leave the boundary itself open.
const CHANGE_DAY = {
  'semaglutide-weekly-ozempic': { hours: 48, edge: true, sec: '2.1', quote: '"The day of weekly administration can be changed if necessary as long as the time between two doses is at least 2 days (>48 hours)."' },
  'tirzepatide-mounjaro': { hours: 72, sec: '2.1', quote: '"The day of weekly administration can be changed, if necessary, as long as the time between the two doses is at least 3 days (72 hours)."' },
  'tirzepatide-zepbound': { hours: 72, sec: '2.3', quote: '"The day of weekly administration can be changed, if necessary, as long as the time between the two doses is at least 3 days (72 hours)."' },
  'dulaglutide-weekly': { hours: 72, sec: '2.3', quote: '"The day of weekly administration can be changed, if necessary, as long as the last dose was administered 3 or more days before the new day of administration."' },
};
export const DOSE_SLOTS = [{ value: 'morning', text: 'The morning dose' }, { value: 'evening', text: 'The evening dose' }];
export const TABLETS_MISSED = [{ value: 'one-of-two', text: 'One of the two tablets' }, { value: 'both-of-two', text: 'Both tablets' }];
const POSTURE = 'This is what the label states for these times. It is not advice for a particular patient; nothing beyond the label\'s sentence is added.';
const H = 3600000;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// A date and time, or a date alone (taken as 00:00).
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d] = m.slice(1, 4).map(Number); const h = m[4] === undefined ? 0 : Number(m[4]); const mi = m[5] === undefined ? 0 : Number(m[5]);
  const t = Date.UTC(y, mo - 1, d, h, mi); const back = new Date(t);
  if (y < 2000 || y > 2100 || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const stamp = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const day = (t) => new Date(t).toISOString().slice(0, 10);
const r1 = (n) => Math.round(n * 10) / 10;
// Hours shown at the digits that keep them on the right side of the rule's hour line.
const hr = (n, cut) => dpSafe(n, [cut], 1);

export function missedDoseLabelRule(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product and regimen. Only products whose label states a missed-dose rule are listed.' };
  if (!blank(o.changeTo)) return changeDay(o, p, now, table);
  const due = parseWhen(o.dueAt);
  if (due === null) return { valid: false, message: 'Enter when the missed dose was due.' };
  const at = parseWhen(o.nowAt);
  if (at === null) return { valid: false, message: 'Enter the date and time now.' };
  if (at < due) return { valid: false, message: 'Enter a time now that is after the time the dose was due.' };
  if (at - due > 366 * 24 * H) return { valid: false, message: 'Enter times no more than a year apart.' };
  const needs = p.needs || [];
  let next = null; let last = null; let tablets = null;
  if (needs.includes('next')) {
    next = parseWhen(o.nextDoseAt);
    if (next === null) return { valid: false, message: `Enter when the next scheduled dose is due: the ${p.brand} label's rule turns on it.` };
    if (next <= due) return { valid: false, message: 'Enter a next scheduled dose that is after the missed one.' };
  }
  if (needs.includes('last')) {
    last = parseWhen(o.lastDoseAt);
    if (last === null) return { valid: false, message: `Enter when the last dose was taken: the ${p.brand} label's rule turns on the days since it.` };
    if (last > at) return { valid: false, message: 'Enter a last dose that is not after the time now.' };
  }
  let slot = null;
  if (needs.includes('slot')) {
    slot = DOSE_SLOTS.find((t) => t.value === String(o.doseSlot ?? '').trim());
    if (!slot) return { valid: false, message: 'Choose whether the morning or the evening dose was missed: the label treats them differently.' };
  }
  if (needs.includes('tablets')) {
    tablets = TABLETS_MISSED.find((t) => t.value === String(o.tabletsMissed ?? '').trim());
    if (!tablets) return { valid: false, message: 'Choose whether one or both of the two tablets were missed.' };
  }
  const lr = labelRow(p.setId, now, table);
  const base = { valid: true, product: p.value, labelUrl: lr.url };
  if (!lr.answers) {
    const w = [`The ${p.brand} label's missed-dose rule is withheld: ${lr.why}.`, 'Read section 2 of the label in hand.', POSTURE];
    return { ...base, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} label's rule is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: w, note: w.join(' ') };
  }
  const elapsed = (at - due) / H;
  const notes = [`The dose was due ${stamp(due)}; it is now ${stamp(at)}, ${r1(elapsed)} hours later.`];
  let verdict; let band; let edge = false;
  const sameDay = day(due) === day(at);
  const morning = day(at + 24 * H);
  if (p.kind === 'say') { verdict = p.verdict; band = p.band; }
  else if (p.kind === 'same-day') {
    verdict = sameDay ? 'take' : 'same-day-has-passed';
    band = sameDay ? 'The label says: take it as soon as possible, on the same day.' : 'The day the dose was due has passed; the label\'s sentence covers the same day only.';
    notes.push(sameDay ? `It is still ${day(due)}, the day the dose was due.` : `The dose was due on ${day(due)} and it is now ${day(at)}. The label speaks of taking the dose "on the same day" and says not to double a dose; it states nothing more for a later day.`);
  } else if (p.kind === 'same-day-else-skip') {
    verdict = sameDay ? 'take' : 'skip';
    band = sameDay ? 'The label says: take it as soon as possible, on the same day.' : 'The label says: skip the missed dose and continue with the next dose as prescribed.';
    notes.push(sameDay ? `It is still ${day(due)}, the day the dose was due.` : `The dose was due on ${day(due)} and it is now ${day(at)}: no longer the same day.`);
  } else if (p.kind === 'peds-bid') {
    if (slot.value === 'morning') {
      verdict = 'take';
      band = 'The label says: take the missed morning dose as soon as it is noticed; it may be taken together with the evening dose.';
    } else {
      verdict = sameDay ? 'take' : 'skip';
      band = sameDay ? 'The label says: a missed evening dose can be taken in the same evening.' : 'The evening has passed: the label says a missed evening dose can only be taken in the same evening.';
      notes.push(`The label does not define "the same evening"; this reads it as ${day(due)}, the day the dose was due.`);
    }
  } else if (p.kind === 'same-day-before-next') {
    const cutoff = next - p.hoursBeforeNext * H;
    const ok = sameDay && at <= cutoff;
    verdict = ok ? 'take' : 'skip';
    band = ok ? 'The label says: take it as soon as possible, on the same day.' : 'The label says: skip the missed dose.';
    notes.push(`${p.hoursBeforeNext} hours before the next scheduled dose (${stamp(next)}) is ${stamp(cutoff)}; it is now ${stamp(at)}, ${at <= cutoff ? 'not past that' : 'past that'}.${sameDay ? '' : ` The dose was due on ${day(due)} and it is now ${day(at)}, no longer the same day.`}`);
  } else if (p.kind === 'within-after') {
    const cutoff = due + p.hours * H; const ok = at <= cutoff;
    verdict = ok ? 'take' : 'skip';
    band = ok ? `The label says: take it as soon as possible (within ${p.days} days after the missed dose).` : `The label says: skip the missed dose (more than ${p.days} days have passed).`;
    notes.push(`${p.days} days (${p.hours} hours) after the missed dose is ${stamp(cutoff)}; it is now ${stamp(at)}, ${ok ? `with ${hr((cutoff - at) / H, 0)} hours left` : `${hr((at - cutoff) / H, 0)} hours past it`}. The next dose on the regular weekly day is ${day(due + 168 * H)}.`);
  } else if (p.kind === 'before-next-open' || p.kind === 'before-next-closed') {
    if (next < at) return { valid: false, message: 'Enter a next scheduled dose that is not before the time now.' };
    const toNext = (next - at) / H; const d = p.hours / 24;
    notes.push(`The next scheduled dose is ${stamp(next)}, ${hr(toNext, p.hours)} hours from now; ${p.hours} hours before it is ${stamp(next - p.hours * H)}.`);
    if (p.kind === 'before-next-open' && Math.abs(toNext - p.hours) < 1e-9) {
      edge = true; verdict = 'label-leaves-this-open';
      band = `Exactly ${d} days before the next dose: the label says "more than ${d} days" (take) and "less than ${d} days" (do not), and names neither for exactly ${d}.`;
      notes.push('Both rows are shown; the label does not say which applies.');
    } else {
      const ok = p.kind === 'before-next-closed' ? toNext >= p.hours - 1e-9 : toNext > p.hours;
      verdict = ok ? 'take' : 'skip';
      band = ok ? `The label says: take it as soon as possible (${p.kind === 'before-next-closed' ? 'at least' : 'more than'} ${d} days remain before the next dose).` : `The label says: do not take the missed dose (less than ${d} days remain); resume on the regular day.`;
    }
    if (p.kind === 'before-next-open' && elapsed >= 168) notes.push('A week or more has passed since the missed dose. If 2 or more consecutive doses have been missed, the label says to reinitiate dosage escalation at a lower dosage; it names no dose.');
  } else if (p.kind === 'liraglutide') {
    const since = (at - last) / H; const over = since > 72;
    verdict = over ? 'reinitiate' : 'next-scheduled-dose';
    band = over ? 'More than 3 days since the last dose: the label says to reinitiate at 0.6 mg.' : 'The label says: resume with the next scheduled dose; no extra dose and no increased dose.';
    notes.push(`The last dose was taken ${stamp(last)}, ${r1(since / 24)} days before now; 3 days after it is ${stamp(last + 72 * H)}.`);
  } else if (p.kind === 'morning-after') {
    verdict = 'take-next-morning';
    band = `The label says: one dose on the morning after it is remembered (${morning} if remembered today).`;
    notes.push('Then the label says to return to one dose a week on the chosen day, and not to take two on the same day.');
  } else {
    if (next < at) return { valid: false, message: 'Enter a next scheduled dose that is not before the time now.' };
    const away = (next - at) / (24 * H); const far = away > 7;
    verdict = far ? 'take-next-morning' : 'wait';
    notes.push(`The next scheduled dose is ${day(next)}, ${r1(away)} days away.`);
    if (far) band = p.two ? (tablets.value === 'both-of-two' ? `The label says: one tablet on the morning after it is remembered (${morning} if remembered today) and the other the next morning (${day(at + 48 * H)}).` : `The label says: the missed tablet on the morning after it is remembered (${morning} if remembered today).`) : `The label says: one tablet on the morning after it is remembered (${morning} if remembered today).`;
    else band = 'The label says: wait for the next month\'s scheduled dose.';
  }
  notes.push(`${p.brand} label, section ${p.sec}: ${p.quote}`);
  notes.push(`Label: ${lr.edition}.`);
  notes.push(POSTURE);
  const abnormal = edge || verdict === 'skip' || verdict === 'wait' || verdict === 'reinitiate' || verdict === 'same-day-has-passed';
  return { ...base, hoursSinceDue: r1(elapsed), verdict, flag: verdict, abnormal, band, bandLabel: p.text, notes, note: notes.join(' ') };
}

// Moving the weekly dosing day: the gap from the last dose to the planned new day, against section 2.
function changeDay(o, p, now, table) {
  const rule = CHANGE_DAY[p.value];
  if (!rule) return { valid: false, message: `The ${p.brand} label's section 2 states no rule for changing the dosing day. Enter a planned new dose time only for Ozempic, Mounjaro, Zepbound or Trulicity, or leave it blank to check a missed dose.` };
  const last = parseWhen(o.lastDoseAt);
  if (last === null) return { valid: false, message: `Enter when the last dose was taken: the ${p.brand} label's rule for changing the day turns on the time between doses.` };
  const to = parseWhen(o.changeTo);
  if (to === null) return { valid: false, message: 'Enter the planned new dose time as a date and time, or a date.' };
  if (to <= last) return { valid: false, message: 'Enter a planned new dose time after the last dose.' };
  const lr = labelRow(p.setId, now, table);
  const base = { valid: true, product: p.value, labelUrl: lr.url, question: 'change-day' };
  if (!lr.answers) {
    const w = [`The ${p.brand} label's rule is withheld: ${lr.why}.`, 'Read section 2 of the label in hand.', POSTURE];
    return { ...base, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} label's rule is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: w, note: POSTURE };
  }
  const gap = (to - last) / H; const d = rule.hours / 24;
  const notes = [`Last dose ${stamp(last)}; planned new dose ${stamp(to)}, ${hr(gap, rule.hours)} hours (${hr(gap / 24, d)} days) later. The earliest the label allows is ${stamp(last + rule.hours * H)}.`];
  let verdict; let band;
  if (rule.edge && Math.abs(gap - rule.hours) < 1e-9) {
    verdict = 'label-leaves-this-open';
    band = `Exactly ${d} days after the last dose: the label says "at least ${d} days" but also ">${rule.hours} hours", and the two disagree at exactly ${rule.hours} hours.`;
    notes.push('Both readings are shown; the label does not settle which applies.');
  } else {
    const ok = gap >= rule.hours - 1e-9 && !(rule.edge && gap <= rule.hours);
    verdict = ok ? 'change-allowed' : 'too-soon';
    band = ok ? `The label allows the change: ${hr(gap, rule.hours)} hours between doses is at least ${rule.hours} (${d} days).` : `Too soon for the label's rule: ${hr(gap, rule.hours)} hours between doses is less than ${rule.hours} (${d} days).`;
  }
  notes.push(`${p.brand} label, section ${rule.sec}: ${rule.quote}`, `Label: ${lr.edition}.`, POSTURE);
  return { ...base, hoursBetween: hr(gap, rule.hours), verdict, flag: verdict, abnormal: verdict !== 'change-allowed', band, bandLabel: p.text, notes, note: POSTURE };
}
