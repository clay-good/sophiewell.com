// spec-v1633 tool 7: a dated taper schedule. Arithmetic only; the reader chooses the pace.
//
//   percent of the original dose   dose(n) = start x (1 - n x r)
//   percent of the remaining dose  dose(n) = dose(n - 1) x (1 - r)
//   fixed amount                   dose(n) = dose(n - 1) - amount
//   original, then remaining       the first rule until 30% of the start dose is reached, then the
//                                  second (the shape of the CDC range for shorter opioid use)
//   date(n) = start date + n x interval, moved later by any pause before it.
// Each step is rounded DOWN to a multiple of the smallest dose that can be dispensed, and the
// schedule ends at that smallest dose: no dose below it is invented.
//
// Published ranges, each re-read on October 11, 2026 and shown as "a published range", never as the
// recommendation. A chosen pace faster than the range for the class is said to be faster.
//   CDC 2022 (Dowell D, et al. MMWR Recomm Rep 2022;71(3):1-95; PMC9639433), Recommendation 5:
//     "Tapers of approximately 10% per month or slower are likely to be better tolerated than more
//     rapid tapers when patients have been taking opioids for longer durations (e.g., >=1 year)."
//     "When patients have taken opioids for shorter durations (e.g., weeks to months rather than
//     years), a decrease of 10% of the original dose per week or slower (until approximately 30% of
//     the original dose is reached, followed by a weekly decrease of approximately 10% of the
//     remaining dose) is less likely to trigger withdrawal." "The rate of tapering should be
//     individualized." "At times, tapers might have to be paused and restarted again." "after the
//     smallest available dose is reached, the interval between doses can be extended and opioids can
//     be stopped when taken less frequently than once a day."
//   FDA opioid class labeling (read in the Butrans and methadone tablet labels): "no greater than
//     10% to 25% of the total daily dose ... at an interval of every 2 to 4 weeks."
//   ASAM joint guideline on benzodiazepine tapering (J Gen Intern Med 2025;40:2814; PMC12463801):
//     "The initial pace of the BZD taper should generally include dose reductions of 5 to 10% every
//     2-4 weeks. The taper should typically not exceed 25% every 2 weeks."; later "5 to 10% every 6-8
//     weeks, or slower as appropriate."
//   Methadone tablet label, section 2.9 (medically supervised withdrawal): "Dose reductions should
//     generally be less than 10% of the established tolerance or maintenance dose, and 10 to 14-day
//     intervals should elapse between dose reductions."
// No corticosteroid range: no primary source gives a general steroid taper rate.
//
// Pure: no DOM, no network; `now` is passed in (it decides only whether the label ranges still stand).

import { inputFault } from './num.js';
import { parseDate } from './pa/date.js';
import { labelRow } from './label-row.js';

// The two label sentences are read from the methadone tablet label (the opioid class sentence is in
// its section 2 as in every opioid label) and stand only while that label edition does.
export const LABEL = { brand: 'methadone tablets (Hikma)', setId: '50f14803-78c0-4d19-8b5d-9a9c17582ac1' };

export const CLASSES = [
  { value: 'opioid', text: 'Opioid' },
  { value: 'benzodiazepine', text: 'Benzodiazepine' },
  { value: 'methadone-oud', text: 'Methadone for opioid use disorder' },
  { value: 'other', text: 'Other' },
];
export const DURATIONS = [{ value: 'year-or-more', text: 'Opioid taken for 1 year or more' }, { value: 'less', text: 'Opioid taken for less than 1 year' }];
export const MODES = [
  { value: 'percent-original', text: 'Percent of the original dose each step' },
  { value: 'percent-remaining', text: 'Percent of the remaining dose each step' },
  { value: 'fixed', text: 'A fixed amount each step' },
  { value: 'percent-original-then-remaining', text: 'Percent of the original dose until 30% remains, then that percent of the remaining dose' },
];
export const UNITS = [{ value: 'mg', text: 'mg' }, { value: 'mcg', text: 'mcg' }, { value: 'mL', text: 'mL' }, { value: 'units', text: 'units' }];
export const MAX_STEPS = 200;
const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const tidy = (x) => Number(x.toFixed(4));
const say = (x) => tidy(x).toLocaleString('en-US', { maximumFractionDigits: 4 });
const NOTE = 'This is arithmetic on the pace you entered. It does not choose the pace and it is not a recommendation.';
const CDC = 'Dowell D, et al. CDC Clinical Practice Guideline for Prescribing Opioids for Pain, 2022, Recommendation 5';
export const RANGES = {
  'opioid-year-or-more': `A published range (${CDC}): after opioids taken for 1 year or more, tapers of approximately 10% per month or slower are likely to be better tolerated than more rapid tapers.`,
  'opioid-less': `A published range (${CDC}): after opioids taken for weeks to months, a decrease of 10% of the original dose per week or slower until about 30% of the original dose is reached, then a weekly decrease of about 10% of the remaining dose.`,
  'opioid-label': 'A published range (FDA opioid labeling, for a physically dependent patient): no greater than 10% to 25% of the total daily dose, at an interval of every 2 to 4 weeks. The labeling adds that patients who have taken opioids for briefer periods may tolerate a more rapid taper.',
  benzodiazepine: 'A published range (ASAM joint guideline on benzodiazepine tapering, 2025): initial reductions of 5% to 10% every 2 to 4 weeks, typically not more than 25% every 2 weeks; later steps of 5% to 10% every 6 to 8 weeks, or slower.',
  'methadone-oud': 'A published range (methadone tablet label, medically supervised withdrawal): reductions generally less than 10% of the maintenance dose, with 10 to 14 days between reductions.',
};
const CDC_CLOSING = [
  'CDC 2022: the rate of tapering should be individualized, and tapers might have to be paused and restarted again when the patient is ready.',
  'CDC 2022: when the goal is discontinuing opioids, after the smallest available dose is reached the interval between doses can be extended, and opioids can be stopped when taken less frequently than once a day.',
];

// "2026-11-01, 14" per line -> [{ date, days }] sorted, or { fault }.
function parsePauses(v) {
  const lines = String(v ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    const date = p.length === 2 ? parseDate(p[0]) : null;
    const days = p.length === 2 ? Number(p[1]) : NaN;
    if (!date || !Number.isInteger(days) || days < 1 || days > 730) return { fault: `Pause line ${i + 1}: enter the date the pause begins (YYYY-MM-DD), a comma, then its length in whole days.` };
    out.push({ date, days });
  }
  return { pauses: out.sort((a, b) => a.date - b.date) };
}

// The first reduction as a percent of the dose it is taken from, for the pace check.
function paceLines(cls, duration, stepPercent, intervalDays, label) {
  const lines = []; const faster = [];
  const withheld = `A range read from the ${LABEL.brand} label is withheld: ${label.why}. The pace is not compared with it.`;
  const per = (days) => (stepPercent * days) / intervalDays;
  if (cls === 'opioid') {
    if (duration === 'year-or-more') {
      lines.push(RANGES['opioid-year-or-more']);
      if (per(28) > 10 + 1e-9) faster.push(`${say(stepPercent)}% every ${intervalDays} days is faster than the CDC range of about 10% per month or slower for opioids taken 1 year or more.`);
    } else {
      lines.push(RANGES['opioid-less']);
      if (per(7) > 10 + 1e-9) faster.push(`${say(stepPercent)}% every ${intervalDays} days is faster than the CDC range of 10% of the original dose per week or slower for opioids taken weeks to months.`);
    }
    // The labeling sentence is about the physically dependent patient and adds that briefer use may
    // tolerate a more rapid taper, so the pace is held against it only for use of 1 year or more.
    if (!label.answers) lines.push(withheld);
    else lines.push(RANGES['opioid-label']);
    if (label.answers && duration === 'year-or-more' && (stepPercent > 25 + 1e-9 || intervalDays < 14)) faster.push(`${say(stepPercent)}% every ${intervalDays} days is outside the FDA labeling range of no more than 10% to 25% every 2 to 4 weeks.`);
  } else if (cls === 'benzodiazepine') {
    lines.push(RANGES.benzodiazepine);
    if (per(14) > 25 + 1e-9) faster.push(`${say(stepPercent)}% every ${intervalDays} days is faster than the ASAM ceiling of 25% every 2 weeks.`);
  } else if (cls === 'methadone-oud') {
    if (!label.answers) lines.push(withheld);
    else lines.push(RANGES['methadone-oud']);
    if (label.answers && (stepPercent >= 10 - 1e-9 || intervalDays < 10)) faster.push(`${say(stepPercent)}% every ${intervalDays} days is faster than the methadone label's range of less than 10% with 10 to 14 days between reductions.`);
  } else {
    lines.push('No published range is held for this class, so the pace is not compared with one. In particular, no primary source gives a general corticosteroid taper rate.');
  }
  return { lines, faster };
}

export function taperCalendar(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const cls = String(o.drugClass ?? '').trim();
  if (!CLASSES.some((c) => c.value === cls)) return { valid: false, message: 'Choose the drug class. It decides which published range the pace is shown beside.' };
  let duration = null;
  if (cls === 'opioid') {
    duration = String(o.duration ?? '').trim();
    if (!DURATIONS.some((d) => d.value === duration)) return { valid: false, message: 'Say how long the opioid has been taken, 1 year or more or less than 1 year: the CDC range differs.' };
  }
  const unit = String(o.unit ?? '').trim();
  if (!UNITS.some((u) => u.value === unit)) return { valid: false, message: 'Choose the dose unit.' };
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose how each step is taken: a percent of the original dose, a percent of the remaining dose, or a fixed amount. They give different schedules.' };
  const percent = mode !== 'fixed';
  const f = inputFault([
    ['the starting daily dose', o.startDose, null, 1e6, unit],
    [percent ? 'the reduction per step' : 'the fixed reduction per step', o.reduction, null, percent ? 100 : 1e6, percent ? '%' : unit],
    ['the days between steps', o.intervalDays, 1, 365, 'days'],
    ['the smallest dose that can be dispensed', o.smallestDose, null, 1e6, unit],
  ]);
  if (f) return { valid: false, message: f };
  const start = Number(o.startDose); const red = Number(o.reduction); const interval = Number(o.intervalDays); const smallest = Number(o.smallestDose);
  if (!Number.isInteger(interval)) return { valid: false, message: 'Enter the days between steps as a whole number (7 for weekly, 14 for every 2 weeks, 28 for every 4 weeks).' };
  if (percent && red >= 100) return { valid: false, message: 'A reduction of 100% is a stop, not a taper. Enter a percent below 100.' };
  if (!percent && red >= start) return { valid: false, message: 'The fixed reduction is as large as the starting dose, which is a stop, not a taper.' };
  if (smallest > start) return { valid: false, message: 'The smallest dose that can be dispensed is above the starting dose. Check the two values.' };
  const startDate = parseDate(o.startDate);
  if (!startDate) return { valid: false, message: 'Enter the start date as YYYY-MM-DD.' };
  let stop = null;
  if (!blank(o.stopTarget)) {
    const sf = inputFault([['the stop target', o.stopTarget, 0, start, unit]]);
    if (sf) return { valid: false, message: sf };
    stop = Number(o.stopTarget);
  }
  let mme = null;
  if (!blank(o.mmeFactor)) {
    if (cls !== 'opioid') return { valid: false, message: 'A morphine-equivalent factor applies to opioids only. Clear it, or choose the opioid class.' };
    const mf = inputFault([['the morphine-equivalent factor', o.mmeFactor, null, 100, '']]);
    if (mf) return { valid: false, message: mf };
    mme = Number(o.mmeFactor);
  }
  const pp = parsePauses(o.pauses);
  if (pp.fault) return { valid: false, message: pp.fault };
  const pauses = pp.pauses.map((p) => ({ ...p, used: false }));

  const floorTo = (x) => tidy(Math.floor(x / smallest + 1e-9) * smallest);
  const row = (n, date, exact, dose, prior) => ({ step: n, date: iso(date), exactDose: tidy(exact), dose, change: prior === null ? 0 : tidy(dose - prior), ...(mme === null ? {} : { mme: tidy(dose * mme) }) });
  // One step on from `prev` (the unrounded dose of step n - 1).
  const advance = (prev, n) => {
    if (mode === 'percent-original') return start * (1 - (n * red) / 100);
    if (mode === 'percent-remaining') return prev * (1 - red / 100);
    if (mode === 'fixed') return prev - red;
    return prev > start * 0.3 + 1e-9 ? prev - (start * red) / 100 : prev * (1 - red / 100);
  };
  const rows = [row(0, startDate, start, floorTo(start), null)];
  let exact = start; let date = startDate; let ended = 'limit';
  for (let n = 1; n <= MAX_STEPS; n += 1) {
    exact = advance(exact, n);
    date = new Date(date.getTime() + interval * DAY);
    // A pause that begins on or before this step holds the dose for its length and moves every later date.
    for (const p of pauses) if (!p.used && p.date.getTime() <= date.getTime()) { date = new Date(date.getTime() + p.days * DAY); p.used = true; }
    const prior = rows[rows.length - 1].dose;
    if (exact <= 1e-9) { rows.push(row(n, date, 0, 0, prior)); ended = 'zero'; break; }
    const dose = Math.min(floorTo(exact), prior); // rounding never takes a step back up
    if (dose < smallest - 1e-9) { ended = 'below-smallest'; break; }
    rows.push(row(n, date, exact, dose, prior));
    if (stop !== null && dose <= stop + 1e-9) { ended = 'target'; break; }
    // At the smallest dose the schedule ends, unless the very next step is the stop itself.
    if (Math.abs(dose - smallest) < 1e-9) {
      if (advance(exact, n + 1) > 1e-9) { ended = 'smallest'; break; }
    }
  }
  if (ended === 'limit') return { valid: false, message: `This pace needs more than ${MAX_STEPS} steps to reach the smallest dose. Check the reduction and the smallest dose.` };

  const stepPercent = percent ? red : (red / start) * 100;
  const label = cls === 'opioid' || cls === 'methadone-oud' ? labelRow(LABEL.setId, now, table) : { answers: true };
  const pace = paceLines(cls, duration, stepPercent, interval, label);
  const last = rows[rows.length - 1];
  const modeText = { 'percent-original': `${say(red)}% of the original dose`, 'percent-remaining': `${say(red)}% of the remaining dose`, fixed: `${say(red)} ${unit}`, 'percent-original-then-remaining': `${say(red)}% of the original dose until 30% of it remains, then ${say(red)}% of the remaining dose` }[mode];
  const endText = { zero: `reaches 0 on ${last.date}`, smallest: `reaches the smallest dose, ${say(smallest)} ${unit}, on ${last.date} and ends there`, target: `reaches the stop target on ${last.date} at ${say(last.dose)} ${unit}`, 'below-smallest': `ends at ${say(last.dose)} ${unit} on ${last.date}: the next step would be below the smallest dose` }[ended];
  const notes = [`Each step is ${modeText}, every ${interval} day${interval === 1 ? '' : 's'}, rounded down to a multiple of ${say(smallest)} ${unit}. That choice is yours and is printed here so the schedule can be checked.`];
  notes.push(...pace.faster, ...pace.lines);
  if (pauses.some((p) => p.used)) notes.push(`${pauses.filter((p) => p.used).length} pause${pauses.filter((p) => p.used).length === 1 ? '' : 's'} applied: each holds the dose for its length and moves every later date; no dose changes.`);
  if (pauses.some((p) => !p.used)) notes.push('A pause dated after the last step was not used.');
  if (rows.some((r, i) => i > 0 && r.change === 0 && r.dose !== 0)) notes.push('Where a step shows no change, the calculated dose rounded down to the same dispensable dose as the step before.');
  if (cls === 'opioid') notes.push(...CDC_CLOSING);
  if (label.edition && label.answers) notes.push(`Label: ${label.edition}.`);
  if (ended === 'smallest' || ended === 'below-smallest') notes.push('The schedule stops at the smallest dose that can be dispensed; it does not invent a dose below it.');
  return {
    valid: true, drugClass: cls, mode, unit, ...(label.url ? { labelUrl: label.url } : {}), steps: rows.length - 1, endDate: last.date, ended, rows, paceFaster: pace.faster.length > 0, abnormal: pace.faster.length > 0,
    band: `From ${say(start)} ${unit} a day on ${rows[0].date}, ${rows.length - 1} step${rows.length === 2 ? '' : 's'}: the schedule ${endText}.`,
    bandLabel: `${rows.length - 1} steps, to ${last.date}`,
    notes, note: NOTE,
  };
}
