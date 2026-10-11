// spec-v1633 tool 11: lamotrigine titration, the label's escalation table as a dated calendar.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Lamictal (GlaxoSmithKline, DailyMed version 45), section 2:
//     Table 1, epilepsy, older than 12 years (taking valproate / neither / taking carbamazepine,
//       phenytoin, phenobarbital or primidone and not valproate): weeks 1 and 2, 25 mg every other
//       day / 25 mg every day / 50 mg/day; weeks 3 and 4, 25 mg every day / 50 mg/day / 100 mg/day in
//       2 divided doses; week 5 onward, increase by 25 to 50 / 50 / 100 mg/day every 1 to 2 weeks;
//       usual maintenance 100 to 200 mg/day with valproate alone (100 to 400 with valproate and
//       inducers) / 225 to 375 / 300 to 500 mg/day.
//     Table 2, epilepsy, ages 2 to 12: 0.15 / 0.3 / 0.6 mg/kg/day in weeks 1 and 2, 0.3 / 0.6 / 1.2
//       in weeks 3 and 4, each "rounded down to the nearest whole tablet"; week 5 onward, add 0.3 /
//       0.6 / 1.2 mg/kg/day (rounded down) every 1 to 2 weeks; maintenance 1 to 5 mg/kg/day (maximum
//       200; 1 to 3 with valproate alone) / 4.5 to 7.5 (maximum 300) / 5 to 15 (maximum 400).
//     Table 3, ages 2 to 12 taking valproate, weeks 1 to 4, by weight: greater than 6.7 and less than
//       14 kg, 2 mg every other day then 2 mg every day; 14.1 to 27 kg, 2 then 4 mg; 27.1 to 34 kg, 4
//       then 8 mg; 34.1 to 40 kg, 5 then 10 mg. "The smallest available strength ... is 2 mg, and only
//       whole tablets should be administered."
//     Table 5, bipolar disorder, adults: as Table 1 for weeks 1 to 4, then week 5, 50 / 100 / 200 mg
//       daily; week 6, 100 / 200 / 300; week 7, 100 / 200 / up to 400 (the inducer column in divided
//       doses). Target 200 mg/day (100 with valproate, 400 with an inducer and no valproate).
//     Table 6, after a psychotropic drug is stopped (bipolar). Section 2.1: restart, "more than 5
//       half-lives"; discontinuation, "over at least 2 weeks (approximately 50% per week)".
//     Section 12.3, Table 14, mean half-lives.
//   Lamictal XR (version 44), section 2.2, Table 1, 13 years and older, once daily: weeks 1 and 2,
//     25 mg every other day / 25 / 50 mg; weeks 3 and 4, 25 / 50 / 100; week 5, 50 / 100 / 200; week
//     6, 100 / 150 / 300; week 7, 150 / 200 / 400; week 8 onward, 200 to 250 / 300 to 400 / 400 to
//     600 mg, "Dose increases at Week 8 or later should not exceed 100 mg daily at weekly intervals".
//
// The calendar lists the weeks the label fixes. Where the label gives a range or a choice (week 5
// onward in epilepsy), the rule is printed and no date is invented.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { parseDate } from './pa/date.js';

const IR = { brand: 'Lamictal', setId: 'd7e3572d-56fe-4727-2bb4-013ccca22678' };
const XR = { brand: 'Lamictal XR', setId: '3e2c9a35-6a39-41d7-ad84-3c0bb8894b09' };
export const LABELS = { ir: IR, xr: XR };
export const REGIMENS = [
  { value: 'ir-epilepsy', text: 'Immediate-release: epilepsy, older than 12 years', label: IR },
  { value: 'ir-pediatric', text: 'Immediate-release: epilepsy, ages 2 to 12 years', label: IR },
  { value: 'ir-bipolar', text: 'Immediate-release: bipolar disorder, adults', label: IR },
  { value: 'xr', text: 'Lamictal XR: 13 years and older', label: XR },
];
export const COMEDS = [
  { value: 'valproate', text: 'Taking valproate' },
  { value: 'neither', text: 'Taking neither valproate nor an inducer' },
  { value: 'inducer', text: 'Taking carbamazepine, phenytoin, phenobarbital or primidone, and not valproate' },
];
const C = { valproate: 0, neither: 1, inducer: 2 };
// [weeks label, first day offset, last day offset or null, the three columns].
const T1 = [['Weeks 1 and 2', 0, 13, ['25 mg every other day', '25 mg every day', '50 mg a day']], ['Weeks 3 and 4', 14, 27, ['25 mg every day', '50 mg a day', '100 mg a day, in 2 divided doses']]];
const T5 = [['Weeks 1 and 2', 0, 13, ['25 mg every other day', '25 mg daily', '50 mg daily']], ['Weeks 3 and 4', 14, 27, ['25 mg daily', '50 mg daily', '100 mg daily, in divided doses']],
  ['Week 5', 28, 34, ['50 mg daily', '100 mg daily', '200 mg daily, in divided doses']], ['Week 6', 35, 41, ['100 mg daily', '200 mg daily', '300 mg daily, in divided doses']], ['Week 7', 42, 48, ['100 mg daily', '200 mg daily', 'up to 400 mg daily, in divided doses']]];
const TXR = [['Weeks 1 and 2', 0, 13, ['25 mg every other day', '25 mg every day', '50 mg every day']], ['Weeks 3 and 4', 14, 27, ['25 mg every day', '50 mg every day', '100 mg every day']], ['Week 5', 28, 34, ['50 mg every day', '100 mg every day', '200 mg every day']], ['Week 6', 35, 41, ['100 mg every day', '150 mg every day', '300 mg every day']], ['Week 7', 42, 48, ['150 mg every day', '200 mg every day', '400 mg every day']], ['Week 8 onward', 49, null, ['200 to 250 mg every day', '300 to 400 mg every day', '400 to 600 mg every day']]];
const NEXT_EPILEPSY = ['increase by 25 to 50 mg a day every 1 to 2 weeks', 'increase by 50 mg a day every 1 to 2 weeks', 'increase by 100 mg a day every 1 to 2 weeks'];
const MAINT_EPILEPSY = ['100 to 200 mg a day with valproate alone; 100 to 400 mg a day with valproate and drugs that induce glucuronidation (in 1 or 2 divided doses)', '225 to 375 mg a day, in 2 divided doses', '300 to 500 mg a day, in 2 divided doses'];
const PED = [[0.15, 0.3, 0.3], [0.3, 0.6, 0.6], [0.6, 1.2, 1.2]]; // weeks 1-2, weeks 3-4, the week-5 increment
const MAINT_PED = ['1 to 5 mg/kg a day, maximum 200 mg a day (1 to 3 mg/kg a day with valproate alone)', '4.5 to 7.5 mg/kg a day, maximum 300 mg a day', '5 to 15 mg/kg a day, maximum 400 mg a day'];
// Table 3: greater than, less than (kg), weeks 1 and 2, weeks 3 and 4.
export const TABLE3 = [[6.7, 14, '2 mg every other day', '2 mg every day'], [14.1, 27, '2 mg every day', '4 mg every day'], [27.1, 34, '4 mg every day', '8 mg every day'], [34.1, 40, '5 mg every day', '10 mg every day']];
// Table 14 mean half-lives in hours, single and multiple dose, with the printed ranges.
const HALF_LIFE = [
  'taking valproate only, 58.8 hours after a single dose (range 30.5 to 88.8); healthy volunteers on valproate, 70.3 hours at steady state (41.9 to 113.5); with an inducer plus valproate, 27.2 hours (11.2 to 51.6)',
  'taking no other medication, 32.8 hours after a single dose (range 14.0 to 103.0) and 25.4 hours at steady state (11.6 to 61.6)',
  'taking carbamazepine, phenytoin, phenobarbital or primidone, 14.4 hours after a single dose (range 6.4 to 30.4) and 12.6 hours at steady state (7.5 to 23.1)',
];
const FIVE = ['about 12 days by the single-dose mean (5 × 58.8 hours), or about 15 by the steady-state mean', 'about 7 days by the single-dose mean (5 × 32.8 hours), or about 5 by the steady-state mean', 'about 3 days (5 × 14.4 hours, or 5 × 12.6 at steady state)'];
const NOTE = 'This lays out the label\'s escalation table as dates. It does not prescribe. The label warns that exceeding the recommended initial dose or escalation raises the risk of serious rash.';
const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, n) => new Date(d.getTime() + n * DAY);
// The largest dose at or below x that whole 2 mg and 5 mg (and larger) tablets can make.
export const wholeTablets = (x) => { const f = Math.floor(x + 1e-9); return f >= 4 ? f : f >= 2 ? 2 : 0; };

export function lamotrigineTitrationCalendar(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMENS.find((r) => r.value === String(o.regimen ?? '').trim());
  if (!reg) return { valid: false, message: 'Choose the formulation and indication. Each has its own escalation table.' };
  const comed = String(o.comed ?? '').trim();
  if (!(comed in C)) return { valid: false, message: 'Choose the co-medication: valproate, neither, or an inducer without valproate. The label has a column for each, and the doses differ four-fold.' };
  const start = parseDate(o.startDate);
  if (!start) return { valid: false, message: 'Enter the date of the first dose as YYYY-MM-DD.' };
  let w = null;
  if (reg.value === 'ir-pediatric') {
    const f = inputFault([['the weight', o.weightKg, 2, 150, 'kg']]);
    if (f) return { valid: false, message: `${f} The label doses ages 2 to 12 by weight.` };
    w = Number(o.weightKg);
  }
  const L = reg.label; const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's escalation table is withheld, so no calendar is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the escalation from the label in hand.'], note: NOTE };
  const c = C[comed];
  const span = (a, b) => (b === null ? `from ${iso(plus(start, a))}` : `${iso(plus(start, a))} to ${iso(plus(start, b))}`);
  const mk = (rows) => rows.map(([weeks, a, b, cols]) => ({ weeks, from: iso(plus(start, a)), to: b === null ? null : iso(plus(start, b)), dose: cols[c] }));
  const notes = []; let rows; let after = null; let abnormal = false;

  if (reg.value === 'ir-epilepsy') {
    rows = mk(T1);
    after = `Week 5 onward (${span(28, null)}): ${NEXT_EPILEPSY[c]}, to the usual maintenance dose of ${MAINT_EPILEPSY[c]}.`;
  } else if (reg.value === 'ir-bipolar') {
    rows = mk(T5);
    notes.push(`Target dose for bipolar disorder: ${['100 mg a day with valproate', '200 mg a day', '400 mg a day with an inducer and no valproate'][c]}.`);
    notes.push('If a psychotropic drug is stopped later (label Table 6): after valproate, from 100 mg a day go to 150 mg in week 1 and 200 mg from week 2; after an inducer, from 400 mg a day hold 400 mg in week 1, 300 mg in week 2 and 200 mg from week 3; otherwise maintain the dose.');
  } else if (reg.value === 'xr') {
    rows = mk(TXR);
    notes.push('Dose increases at week 8 or later should not exceed 100 mg daily at weekly intervals.');
    notes.push('Coming from immediate-release lamotrigine, the label starts Lamictal XR at the same total daily dose instead of this table.');
  } else {
    const t3 = c === 0 ? TABLE3.find(([lo, hi]) => w > lo && w < hi) : null;
    const text = (mgkg) => { const exact = mgkg * w; const mg = wholeTablets(exact); return { exact: Number(exact.toFixed(2)), mg }; };
    const a = text(PED[c][0]); const b = text(PED[c][1]); const inc = text(PED[c][2]);
    const say = (x) => (x.mg === 0 ? `${x.exact} mg a day by weight, which is below one 2 mg tablet` : x.mg === x.exact ? `${x.mg} mg a day` : `${x.mg} mg a day (${x.exact} mg by weight, rounded down to whole tablets)`);
    if (t3) {
      rows = [{ weeks: 'Weeks 1 and 2', from: iso(start), to: iso(plus(start, 13)), dose: t3[2] }, { weeks: 'Weeks 3 and 4', from: iso(plus(start, 14)), to: iso(plus(start, 27)), dose: t3[3] }];
      notes.push(`Weeks 1 to 4 are the label's weight-based guide for children taking valproate (Table 3), row "greater than ${t3[0]} kg and less than ${t3[1]} kg".`);
    } else {
      rows = [{ weeks: 'Weeks 1 and 2', from: iso(start), to: iso(plus(start, 13)), dose: say(a) }, { weeks: 'Weeks 3 and 4', from: iso(plus(start, 14)), to: iso(plus(start, 27)), dose: say(b) }];
      notes.push(`Weeks 1 to 4 are ${PED[c][0]} then ${PED[c][1]} mg/kg a day (label Table 2), rounded down to the nearest whole tablet; the smallest tablet is 2 mg.`);
      if (c === 0) notes.push(`${w} kg is outside the label's weight-based guide for children taking valproate (Table 3 runs from above 6.7 kg to below 40 kg, with small gaps between its rows), so the Table 2 figure is shown.`);
      if (a.mg === 0 || b.mg === 0) { abnormal = true; notes.push('A calculated dose below 2 mg cannot be given as whole tablets. The label\'s own answer for the smallest children taking valproate is 2 mg every other day, in Table 3.'); }
    }
    after = `Week 5 onward (${span(28, null)}): every 1 to 2 weeks add ${PED[c][2]} mg/kg a day, rounded down to whole tablets (${inc.mg === 0 ? `${inc.exact} mg, below one tablet` : `${inc.mg} mg`}), to the usual maintenance dose of ${MAINT_PED[c]}.`;
    notes.push('Under 30 kg the label says the maintenance dose may need to be increased by as much as 50%, based on clinical response.');
  }
  if (after) notes.unshift(after);
  if (c === 2) notes.push('Patients on rifampin or lopinavir/ritonavir follow this inducer column. For estrogen-containing products and atazanavir/ritonavir the label gives separate instructions in section 2.1, which are not computed here.');
  else notes.push('Estrogen-containing products and atazanavir/ritonavir have their own instructions in section 2.1 of the label, which are not computed here.');
  notes.push(`Restart: if lamotrigine has been stopped for more than 5 half-lives, the label recommends starting again from the initial dosing, not resuming mid-schedule. Mean half-life ${HALF_LIFE[c]}. Five half-lives is ${FIVE[c]}; the ranges are wide.`);
  notes.push('Stopping: the label recommends a stepwise reduction over at least 2 weeks (about 50% a week) unless safety requires faster.');
  notes.push(`Label: ${lr.edition}.`);
  const last = rows[rows.length - 1];
  return {
    valid: true, regimen: reg.value, comed, labelUrl: lr.url, flag: 'calendar', abnormal, rows,
    band: `${L.brand}, ${COMEDS[c].text.toLowerCase()}: ${rows.map((r) => `${r.weeks.toLowerCase()} (${r.to === null ? `from ${r.from}` : `${r.from} to ${r.to}`}), ${r.dose}`).join('; ')}.`,
    bandLabel: `${rows[0].dose} from ${rows[0].from}`,
    lastFixedDate: last.to, notes, note: NOTE,
  };
}
