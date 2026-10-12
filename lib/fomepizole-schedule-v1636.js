// spec-v1636 tool 2: fomepizole doses, with and without hemodialysis, as the label states them.
//
// Source: Fomepizole Injection label, Zydus, DailyMed set id 256910fe-..., version 8, re-read
// October 11, 2026, Dosage and Administration:
//   "A loading dose of 15 mg/kg should be administered, followed by doses of 10 mg/kg every 12 hours
//    for 4 doses, then 15 mg/kg every 12 hours thereafter until ethylene glycol or methanol
//    concentrations are undetectable or have been reduced below 20 mg/dL, and the patient is
//    asymptomatic with normal pH. All doses should be administered as a slow intravenous infusion
//    over 30 minutes."
//   "the frequency of dosing should be increased to every 4 hours during hemodialysis."
//   Dose at the beginning of hemodialysis: less than 6 hours since the last dose, do not administer;
//    6 hours or more, administer the next scheduled dose.
//   Dosing during hemodialysis: dose every 4 hours.
//   At the time hemodialysis is completed, by the time between the last dose and the end of
//    hemodialysis: less than 1 hour, do not administer a dose at the end; 1-3 hours, administer 1/2
//    of the next scheduled dose; greater than 3 hours, administer the next scheduled dose.
//   Off hemodialysis: "Give next scheduled dose 12 hours from last dose administered."
//
// The label does not say whether the half dose at the end of dialysis counts as one of the four
// 10 mg/kg doses; the count of doses given is the reader's entry, and the result says so.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Fomepizole Injection', setId: '256910fe-91f2-48f6-b0b4-55edc52dacd4' };
export const DIALYSIS = [
  { value: 'off-dialysis', text: 'Not on hemodialysis' },
  { value: 'dialysis-begins', text: 'Hemodialysis is starting' },
  { value: 'during-dialysis', text: 'During hemodialysis' },
  { value: 'dialysis-ends', text: 'Hemodialysis has just ended' },
];
const STOP = 'The label continues dosing until the ethylene glycol or methanol concentration is undetectable or below 20 mg/dL and the patient is asymptomatic with a normal pH.';
const NOTE = 'The label\'s dose and timing for the entries made. It does not say whether fomepizole or hemodialysis is indicated; the label and the poison center govern that.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const HOUR = 3600000;

// 'YYYY-MM-DDTHH:MM' (a datetime-local value) -> a wall-clock instant, or null.
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const clock = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const span = (ms) => { const min = Math.round(Math.abs(ms) / 60000); return `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`; };

// Dose number n (1 is the loading dose): mg/kg and its name.
const perKg = (n) => (n === 1 ? 15 : n <= 5 ? 10 : 15);
const nameOf = (n) => (n === 1 ? 'the loading dose' : n <= 5 ? `maintenance dose ${n - 1} of the four at 10 mg/kg` : 'a 15 mg/kg maintenance dose');

export function fomepizoleSchedule(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg'], ['the number of doses given so far', o.dosesGiven, 0, 60, '']]);
  if (f) return { valid: false, message: f };
  const given = Number(o.dosesGiven);
  if (!Number.isInteger(given)) return { valid: false, message: 'Enter the number of doses given so far as a whole number (0 before the loading dose).' };
  const state = DIALYSIS.find((d) => d.value === String(o.dialysis ?? '').trim());
  if (!state) return { valid: false, message: 'Choose the hemodialysis state: the label doses every 12 hours off dialysis and every 4 hours on it, with its own rules at the start and the end.' };
  const when = {};
  for (const [key, label] of [['lastDoseTime', 'the time of the last dose'], ['dialysisTime', 'the time hemodialysis started or ended']]) {
    if (blank(o[key])) { when[key] = null; continue; }
    when[key] = parseWhen(o[key]);
    if (when[key] === null) return { valid: false, message: `Enter ${label} as a date and time (YYYY-MM-DDTHH:MM).` };
  }
  const { lastDoseTime: last, dialysisTime: dial } = when;
  const edge = state.value === 'dialysis-begins' || state.value === 'dialysis-ends';
  if (given > 0 && last === null) return { valid: false, message: 'Enter the time of the last dose: the next dose is timed from it.' };
  if (given > 0 && edge && dial === null) return { valid: false, message: `Enter the time hemodialysis ${state.value === 'dialysis-begins' ? 'started' : 'ended'}: the label's rule turns on the time since the last dose.` };
  if (given > 0 && edge && dial < last) return { valid: false, message: 'The hemodialysis time is before the last dose. Check the two times.' };

  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Fomepizole Injection label figures are withheld: ${lr.why}. Read the dosing table from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const kg = Number(o.weight); const next = given + 1;
  const mg = perKg(next) * kg;
  const doseText = `${n0(mg)} mg (${perKg(next)} mg/kg × ${kg} kg; ${nameOf(next)})`;
  const notes = [];
  let flag; let band; let label; let doseMg = mg; let at = null;
  if (given === 0) {
    flag = 'loading-dose'; label = `${n0(mg)} mg now`;
    band = `Loading dose: ${n0(mg)} mg (15 mg/kg × ${kg} kg), as a 30-minute intravenous infusion.`;
  } else if (state.value === 'off-dialysis') {
    at = last + 12 * HOUR; flag = 'next-dose'; label = `${n0(mg)} mg at ${clock(at).slice(11)}`;
    band = `Next dose: ${doseText} at ${clock(at)}, 12 hours from the last dose.`;
  } else if (state.value === 'during-dialysis') {
    at = last + 4 * HOUR; flag = 'next-dose-dialysis'; label = `${n0(mg)} mg at ${clock(at).slice(11)}`;
    band = `During hemodialysis the label doses every 4 hours: ${doseText} at ${clock(at)}.`;
  } else if (state.value === 'dialysis-begins') {
    const gap = dial - last;
    if (gap < 6 * HOUR) { flag = 'no-dose-at-start'; doseMg = 0; label = 'No dose at the start'; at = last + 4 * HOUR; band = `Hemodialysis started ${span(gap)} after the last dose, under 6 hours: the label says not to give a dose at the start. During dialysis the next dose, ${doseText}, is at ${clock(at)}, 4 hours from the last dose.`; }
    else { flag = 'dose-at-start'; at = dial; label = `${n0(mg)} mg at the start`; band = `Hemodialysis started ${span(gap)} after the last dose, 6 hours or more: the label says to give the next scheduled dose, ${doseText}, at the start (${clock(dial)}).`; }
  } else {
    const gap = dial - last;
    if (gap < HOUR) { flag = 'no-dose-at-end'; doseMg = 0; label = 'No dose at the end'; at = last + 12 * HOUR; band = `Hemodialysis ended ${span(gap)} after the last dose, under 1 hour: the label says not to give a dose at the end. Off dialysis the next dose, ${doseText}, is at ${clock(at)}, 12 hours from the last dose.`; }
    else if (gap <= 3 * HOUR) { flag = 'half-dose-at-end'; doseMg = mg / 2; at = dial; label = `${n0(mg / 2)} mg at the end`; band = `Hemodialysis ended ${span(gap)} after the last dose, 1 to 3 hours: the label says to give half of the next scheduled dose, ${n0(mg / 2)} mg (half of ${n0(mg)} mg), at the end (${clock(dial)}).`; notes.push('The label does not say whether this half dose counts as one of the four 10 mg/kg doses. Count the doses given as your protocol does; the next dose here follows the count you enter.'); }
    else { flag = 'dose-at-end'; at = dial; label = `${n0(mg)} mg at the end`; band = `Hemodialysis ended ${span(gap)} after the last dose, more than 3 hours: the label says to give the next scheduled dose, ${doseText}, at the end (${clock(dial)}).`; }
    notes.push('Off hemodialysis the label gives the next scheduled dose 12 hours from the last dose administered.');
  }
  notes.push(`Dose table at ${kg} kg: loading dose ${n0(15 * kg)} mg (15 mg/kg); then ${n0(10 * kg)} mg (10 mg/kg) every 12 hours for 4 doses; then ${n0(15 * kg)} mg (15 mg/kg) every 12 hours.`);
  notes.push(`${given} dose${given === 1 ? '' : 's'} entered as given, so the next is dose ${next}: ${nameOf(next)}.`);
  notes.push('Each dose is a slow intravenous infusion over 30 minutes, diluted in at least 100 mL of 0.9% sodium chloride or 5% dextrose. The vial holds 1 g/mL.');
  if (doseMg > 0) notes.push(`Volume: ${(doseMg / 1000).toFixed(2)} mL of the 1 g/mL injection for ${n0(doseMg)} mg.`);
  notes.push(STOP);
  if (last !== null) notes.push('Times are read as written; a daylight-saving change in between is not adjusted for.');
  notes.push(`Label: ${lr.edition}.`);
  return { valid: true, flag, abnormal: false, labelUrl: lr.url, doseNumber: next, doseMg: Number(doseMg.toFixed(1)), scheduledDoseMg: Number(mg.toFixed(1)), at: at === null ? null : clock(at), band, bandLabel: label, notes, note: NOTE };
}
