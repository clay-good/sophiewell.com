// spec-v1633 tool 12: a step-up titration as dates, from a label's schedule or the reader's own steps.
//
// Five label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Topamax (topiramate; Janssen, DailyMed version 31). Table 1, monotherapy epilepsy, adults and
//     children 10 and older, morning and evening: week 1, 25 and 25 mg; 2, 50 and 50; 3, 75 and 75;
//     4, 100 and 100; 5, 150 and 150; 6, 200 and 200. Table 3, preventive treatment of migraine, 12
//     and older: week 1, none and 25 mg; 2, 25 and 25; 3, 25 and 50; 4, 50 and 50.
//   Chantix (varenicline; Pfizer, version 49), section 2.1: "Days 1 - 3: 0.5 mg once daily; Days 4 -
//     7: 0.5 mg twice daily; Day 8 - end of treatment: 1 mg twice daily. Patients should be treated
//     with CHANTIX for 12 weeks."
//   Otezla (apremilast; Amgen, version 38), Table 1, adults: day 1, 10 mg in the morning; day 2, 10
//     and 10; day 3, 10 and 20; day 4, 20 and 20; day 5, 20 and 30; day 6 and thereafter, 30 mg twice
//     daily or Otezla XR 75 mg once daily.
//   Memantine hydrochloride tablets (Lupin, version 13): "starting dose ... 5 mg once daily ...
//     increased in 5 mg increments to 10 mg/day (5 mg twice daily), 15 mg/day (5 mg and 10 mg as
//     separate doses), and 20 mg/day (10 mg twice daily). The minimum recommended interval between
//     dose increases is one week."
//   Entresto (sacubitril/valsartan; Novartis, version 25), sections 2.1 and 2.2: "allow a washout
//     period of 36 hours" after an ACE inhibitor; "starting dose ... 49/51 mg orally twice-daily.
//     Double the dose ... after 2 to 4 weeks to the target maintenance dose of 97/103 mg twice daily".
//
// No GLP-1 schedules here: those are in the GLP-1 Dose Escalation Check. Where a label leaves the
// length of a step open (memantine, Entresto), the reader enters it.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { parseStrengths, tabletsFor } from './tablet-combo.js';
import { parseDate } from './pa/date.js';

const TOPAMAX = { brand: 'Topamax', setId: '21628112-0c47-11df-95b3-498d55d89593' };
const CHANTIX = { brand: 'Chantix', setId: 'f0ff4f27-5185-4881-a749-c6b7a0ca5696' };
const OTEZLA = { brand: 'Otezla', setId: 'f6b1f516-4972-4d82-bced-113e47b41cc5' };
const MEMANTINE = { brand: 'memantine tablets (Lupin)', setId: '1b4a0162-9cb4-4ba6-8c02-95c2955734ae' };
const ENTRESTO = { brand: 'Entresto', setId: '000dc81d-ab91-450c-8eae-8eb74e72296f' };
export const LABELS = { topamax: TOPAMAX, chantix: CHANTIX, otezla: OTEZLA, memantine: MEMANTINE, entresto: ENTRESTO };
const week = (n, dose) => [`Week ${n}`, (n - 1) * 7, 7, dose];
export const PRESETS = [
  { value: 'topiramate-epilepsy', text: 'Topiramate: epilepsy monotherapy, 10 years and older (Topamax)', label: TOPAMAX,
    steps: [week(1, '25 mg in the morning and 25 mg in the evening'), week(2, '50 mg in the morning and 50 mg in the evening'), week(3, '75 mg in the morning and 75 mg in the evening'), week(4, '100 mg in the morning and 100 mg in the evening'), week(5, '150 mg in the morning and 150 mg in the evening'), ['Week 6 onward', 35, null, '200 mg in the morning and 200 mg in the evening']],
    notes: ['The label\'s recommended dose is 400 mg a day in two divided doses, reached by this schedule.'] },
  { value: 'topiramate-migraine', text: 'Topiramate: migraine prevention, 12 years and older (Topamax)', label: TOPAMAX,
    steps: [week(1, 'none in the morning and 25 mg in the evening'), week(2, '25 mg in the morning and 25 mg in the evening'), week(3, '25 mg in the morning and 50 mg in the evening'), ['Week 4 onward', 21, null, '50 mg in the morning and 50 mg in the evening']],
    notes: ['The label says dose and titration rate should be guided by clinical outcome, and that longer intervals between adjustments can be used.'] },
  // Topamax section 2.2 (version 31, re-read October 15, 2026): adjunctive therapy, every figure a range
  // the prescriber chooses within; the tool checks each choice against it.
  { value: 'topiramate-adjunctive', text: 'Topiramate: adjunctive epilepsy therapy, adults 17 and older (Topamax)', label: TOPAMAX, ask: 'adjunctive' },
  { value: 'topiramate-adjunctive-pediatric', text: 'Topiramate: adjunctive epilepsy therapy, ages 2 to 16 (Topamax)', label: TOPAMAX, ask: 'adjunctive' },
  { value: 'varenicline', text: 'Varenicline (Chantix)', label: CHANTIX,
    steps: [['Days 1 to 3', 0, 3, '0.5 mg once daily'], ['Days 4 to 7', 3, 4, '0.5 mg twice daily'], ['Day 8 to the end of week 12', 7, 77, '1 mg twice daily']],
    notes: ['The label treats for 12 weeks, and recommends another 12 weeks for patients who have stopped smoking at the end of it.', 'Section 2.1 of the label gives the ways of choosing a quit date around this schedule.'] },
  { value: 'apremilast', text: 'Apremilast: adults (Otezla)', label: OTEZLA,
    steps: [['Day 1', 0, 1, '10 mg in the morning'], ['Day 2', 1, 1, '10 mg in the morning and 10 mg in the evening'], ['Day 3', 2, 1, '10 mg in the morning and 20 mg in the evening'], ['Day 4', 3, 1, '20 mg in the morning and 20 mg in the evening'], ['Day 5', 4, 1, '20 mg in the morning and 30 mg in the evening'], ['Day 6 onward', 5, null, '30 mg twice daily, or Otezla XR 75 mg once daily']],
    notes: ['Otezla tablets are used for the titration whichever product is used for maintenance.', 'In severe renal impairment the label uses the morning doses only and a maintenance dose of 30 mg once daily.'] },
  // Otezla section 2.1, Table 2 (version 38, re-read October 15, 2026): 6 years and older, at least 20 kg.
  { value: 'apremilast-pediatric', text: 'Apremilast: children 6 years and older, at least 20 kg (Otezla)', label: OTEZLA, ask: 'weightKg' },
  { value: 'memantine', text: 'Memantine tablets', label: MEMANTINE, ask: 'weeksPerStep' },
  { value: 'sacubitril-valsartan', text: 'Sacubitril/valsartan: adult heart failure (Entresto)', label: ENTRESTO, ask: 'weeksToDouble' },
  // Entresto section 2.3, Table 1 (version 25, re-read October 15, 2026): tablets, 1 year and older.
  { value: 'sacubitril-valsartan-pediatric', text: 'Sacubitril/valsartan: children 1 year and older, tablets (Entresto)', label: ENTRESTO, ask: 'weightKg' },
  { value: 'custom', text: 'My own steps', label: null },
];
const MEMANTINE_STEPS = ['5 mg once daily', '5 mg twice daily (10 mg a day)', '5 mg and 10 mg as separate doses (15 mg a day)', '10 mg twice daily (20 mg a day)'];
const NOTE = 'This lays out a schedule as dates. It does not prescribe, and a preset is the label\'s schedule for the usual patient: the label\'s adjustments for kidney or liver function are not applied here.';
const DAY = 86400000; const HOUR = 3600000;
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, n) => new Date(d.getTime() + n * DAY);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi); const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}

// "25, 2, 7" per line: dose in mg, times a day, days. -> [{ dose, times, days }] or { fault }.
function parseSteps(v) {
  const lines = String(v ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { fault: 'Enter your steps, one per line: the dose in mg, a comma, the times a day, a comma, then the number of days.' };
  if (lines.length > 60) return { fault: 'Enter at most 60 steps.' };
  const out = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 3) return { fault: `Step line ${i + 1}: enter the dose in mg, the times a day, and the number of days, separated by commas.` };
    const f = inputFault([[`the dose on step line ${i + 1}`, p[0], null, 1e6, 'mg'], [`the times a day on step line ${i + 1}`, p[1], 1, 24, ''], [`the days on step line ${i + 1}`, p[2], 1, 3650, 'days']]);
    if (f) return { fault: f };
    if (!Number.isInteger(Number(p[1])) || !Number.isInteger(Number(p[2]))) return { fault: `Step line ${i + 1}: the times a day and the number of days must be whole numbers.` };
    out.push({ dose: Number(p[0]), times: Number(p[1]), days: Number(p[2]) });
  }
  return { steps: out };
}

export function labelTitrationCalendar(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const preset = PRESETS.find((p) => p.value === String(o.preset ?? '').trim());
  if (!preset) return { valid: false, message: 'Choose a label schedule, or "My own steps".' };
  const start = parseDate(o.startDate);
  if (!start) return { valid: false, message: 'Enter the start date as YYYY-MM-DD.' };
  const row = (label, from, days, dose) => ({ step: label, from: iso(plus(start, from)), to: days === null ? null : iso(plus(start, from + days - 1)), days, dose });

  if (preset.value === 'custom') {
    const ps = parseSteps(o.steps);
    if (ps.fault) return { valid: false, message: ps.fault };
    let at = 0; const rows = [];
    for (const [i, s] of ps.steps.entries()) {
      rows.push({ ...row(`Step ${i + 1}`, at, s.days, `${s.dose} mg ${s.times === 1 ? 'once' : `${s.times} times`} a day`), doses: s.times * s.days, totalMg: Number((s.dose * s.times * s.days).toFixed(4)) });
      at += s.days;
    }
    const total = Number(rows.reduce((a, r) => a + r.totalMg, 0).toFixed(4));
    // spec-v1633 tool 12: whole tablets by the strengths stocked, per dose and per step.
    const tabNotes = []; const byStrength = new Map();
    if (!blank(o.strengths)) {
      const st = parseStrengths(o.strengths);
      if (st.message) return { valid: false, message: st.message };
      for (const [i, s] of ps.steps.entries()) {
        const t = tabletsFor(s.dose, st.strengths);
        if (!t) { tabNotes.push(`Step ${i + 1}: no whole-tablet combination of ${st.strengths.join(', ')} mg makes ${s.dose} mg.`); continue; }
        rows[i].tablets = t.text; rows[i].unitsToDispense = t.combo.map(([mg, k]) => ({ mg, units: k * s.times * s.days }));
        for (const [mg, k] of t.combo) byStrength.set(mg, (byStrength.get(mg) || 0) + k * s.times * s.days);
        tabNotes.push(`Step ${i + 1}: ${t.text} a dose; ${t.combo.map(([mg, k]) => `${k * s.times * s.days} × ${mg} mg`).join(' and ')} for the step.`);
      }
      if (byStrength.size) tabNotes.push(`To dispense for the steps that have a combination: ${[...byStrength.entries()].sort((a, b) => b[0] - a[0]).map(([mg, n]) => `${n} × ${mg} mg`).join(', ')}. Whole tablets only; the fewest tablets a dose, larger strengths first.`);
    }
    return { valid: true, preset: 'custom', ...(byStrength.size ? { dispenseByStrength: Object.fromEntries([...byStrength.entries()].map(([mg, n]) => [`${mg} mg`, n])) } : {}), flag: 'calendar', abnormal: false, rows, endDate: rows[rows.length - 1].to, totalMg: total, band: `Your ${rows.length} step${rows.length === 1 ? '' : 's'} run from ${rows[0].from} to ${rows[rows.length - 1].to}, ${at} day${at === 1 ? '' : 's'} and ${total.toLocaleString('en-US')} mg in all.`, bandLabel: `${rows.length} steps, to ${rows[rows.length - 1].to}`, notes: ['These are your own steps; no label schedule is applied and nothing is checked against one.', ...rows.map((r) => `${r.step}: ${r.doses} dose${r.doses === 1 ? '' : 's'}, ${r.totalMg.toLocaleString('en-US')} mg.`), ...tabNotes], note: NOTE };
  }

  const L = preset.label;
  let steps = preset.steps; const notes = [...(preset.notes || [])]; const extra = {};
  if (preset.value === 'memantine') {
    const f = inputFault([['the number of weeks at each step', o.weeksPerStep, 1, 52, '']]);
    if (f) return { valid: false, message: `${f} The label's minimum interval between memantine dose increases is one week; the tool does not assume it.` };
    const wk = Number(o.weeksPerStep);
    if (!Number.isInteger(wk)) return { valid: false, message: 'Enter the weeks at each step as a whole number. The label\'s minimum is one week.' };
    steps = MEMANTINE_STEPS.map((dose, i) => [i === 3 ? `Step ${i + 1} onward` : `Step ${i + 1}`, i * wk * 7, i === 3 ? null : wk * 7, dose]);
    notes.push(`Each step is ${wk} week${wk === 1 ? '' : 's'}, as entered. The label's minimum between increases is one week, and it says to increase only if the previous dose was well tolerated.`, 'In severe renal impairment the label\'s target dose is 5 mg twice daily.');
  }
  if (preset.value === 'sacubitril-valsartan') {
    const f = inputFault([['the number of weeks before the dose is doubled', o.weeksToDouble, 2, 4, '']]);
    if (f) return { valid: false, message: `${f} The label doubles the dose after 2 to 4 weeks; the tool does not pick a point in that range.` };
    const wk = Number(o.weeksToDouble);
    if (!Number.isInteger(wk)) return { valid: false, message: 'Enter the weeks before the dose is doubled as a whole number from 2 to 4.' };
    steps = [['Start', 0, wk * 7, '49/51 mg twice daily'], ['Target, as tolerated', wk * 7, null, '97/103 mg twice daily']];
    notes.push('The label\'s reduced starting dose (24/26 mg twice daily) for patients new to or on a low dose of an ACE inhibitor or ARB, with severe renal impairment or with moderate hepatic impairment is not applied here.');
    if (!blank(o.lastAceDose)) {
      const ace = parseWhen(o.lastAceDose);
      if (ace === null) return { valid: false, message: 'Enter the last ACE-inhibitor dose as a date and time (YYYY-MM-DDTHH:MM), or leave it blank.' };
      const earliest = ace + 36 * HOUR; const stamp = new Date(earliest).toISOString().slice(0, 16).replace('T', ' ');
      extra.earliestFirstDose = stamp;
      const tooSoon = plus(start, 1).getTime() <= earliest; // the whole start date falls inside the washout
      extra.washoutConflict = tooSoon;
      notes.unshift(`ACE-inhibitor washout: 36 hours after the last dose is ${stamp}; the first Entresto dose is no earlier than that.${tooSoon ? ` The start date entered, ${iso(start)}, ends before it.` : ''}`);
    } else notes.push('Coming from an ACE inhibitor the label requires a 36-hour washout before the first dose; enter the time of the last ACE-inhibitor dose to see it as a clock time.');
  }
  if (preset.ask === 'adjunctive') {
    const adult = preset.value === 'topiramate-adjunctive';
    const r = adjunctiveSteps(o, adult);
    if (r.message) return { valid: false, message: r.message };
    steps = r.steps; notes.push(...r.notes);
  }
  if (preset.ask === 'weightKg') {
    const f = inputFault([['the weight', o.weightKg, null, 300, 'kg']]);
    if (f) return { valid: false, message: `${f} The label's pediatric schedule is by weight.` };
    const kg = Number(o.weightKg);
    if (preset.value === 'apremilast-pediatric') {
      if (kg < 20) return { valid: false, message: 'The Otezla label\'s pediatric schedule is for children weighing at least 20 kg; it gives none below.' };
      const big = kg >= 50;
      steps = [['Day 1', 0, 1, '10 mg in the morning'], ['Day 2', 1, 1, '10 mg in the morning and 10 mg in the evening'], ['Day 3', 2, 1, '10 mg in the morning and 20 mg in the evening'], ['Day 4', 3, 1, '20 mg in the morning and 20 mg in the evening'], ['Day 5', 4, 1, `20 mg in the morning and ${big ? 30 : 20} mg in the evening`], ['Day 6 onward', 5, null, big ? '30 mg twice daily (or Otezla XR 75 mg once daily)' : '20 mg twice daily']];
      notes.push(`Weight band: ${big ? '50 kg or more' : '20 kg to less than 50 kg'} (label Table 2). Otezla tablets are used for the titration whichever product is used for maintenance.`, 'In severe renal impairment the label uses the morning doses only for the titration.');
    } else {
      // Table 1: twice-daily doses at three steps, adjusted every 2 weeks as tolerated.
      const band = kg < 40 ? null : kg < 50 ? ['24 mg/26 mg', '49 mg/51 mg', '72 mg/78 mg'] : ['49 mg/51 mg', '72 mg/78 mg', '97 mg/103 mg'];
      const perKg = (mg) => `${mg} mg/kg (${Number((mg * kg).toFixed(1))} mg of sacubitril and valsartan combined at ${kg} kg)`;
      const d = band || [perKg(1.6), perKg(2.3), perKg(3.1)];
      steps = [['Starting dose', 0, 14, `${d[0]} twice daily`], ['Second dose', 14, 14, `${d[1]} twice daily`], ['Final dose, as tolerated', 28, null, `${d[2]} twice daily`]];
      notes.push(`Weight band: ${kg < 40 ? 'less than 40 kg' : kg < 50 ? 'at least 40 kg, less than 50 kg' : 'at least 50 kg'} (label Table 1, tablets). The label adjusts pediatric doses every 2 weeks as tolerated; the dates assume each step is tolerated.`);
      if (kg < 40) notes.push('Under 40 kg the label recommends the oral suspension or oral pellets (its Table 2) over tablets; the mg/kg doses are of the combined amount of both drugs.');
      if (band) notes.push('72 mg/78 mg can be given as three 24 mg/26 mg tablets, as the label notes.');
    }
  }
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's schedule is withheld, so no calendar is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the schedule from the label in hand.'], note: NOTE };
  const rows = steps.map(([label, from, days, dose]) => row(label, from, days, dose));
  const last = rows[rows.length - 1];
  return {
    valid: true, preset: preset.value, labelUrl: lr.url, flag: 'calendar', abnormal: Boolean(extra.washoutConflict), rows, ...extra,
    band: `${L.brand} label schedule from ${iso(start)}: ${rows.map((r) => `${r.step.toLowerCase()} (${r.to === null ? `from ${r.from}` : r.from === r.to ? r.from : `${r.from} to ${r.to}`}), ${r.dose}`).join('; ')}.`,
    bandLabel: last.to === null ? `${last.dose.split(',')[0]} from ${last.from}` : `To ${last.to}`,
    notes: [...notes, `Label: ${lr.edition}.`], note: NOTE,
  };
}

// Topamax 2.2. Adults: "initiated at 25 to 50 mg/day, followed by titration to an effective dose in
// increments of 25 to 50 mg/day every week"; 200 to 400 mg/day in two divided doses (400 for primary
// generalized tonic-clonic seizures); "Doses above 400 mg/day have not been shown to improve responses".
// Ages 2 to 16: "begin at 25 mg/day (or less, based on a range of 1 to 3 mg/kg/day) nightly for the first
// week", then "increased at 1- or 2-week intervals by increments of 1 to 3 mg/kg/day (administered in two
// divided doses)" to "approximately 5 to 9 mg/kg/day". Not exported.
function adjunctiveSteps(o, adult) {
  const num = (k) => Number(o[k]);
  const fmt = (x) => Number(x.toFixed(1)).toLocaleString('en-US');
  if (adult) {
    const f = inputFault([['the starting dose', o.startMg, null, 400, 'mg/day'], ['the weekly increment', o.stepMg, null, 400, 'mg/day'], ['the target dose', o.targetMg, null, 1000, 'mg/day']]);
    if (f) return { message: f };
    const a = num('startMg'); const inc = num('stepMg'); const target = num('targetMg');
    if (a < 25 || a > 50) return { message: 'Enter a starting dose from 25 to 50 mg/day, the label\'s range.' };
    if (inc < 25 || inc > 50) return { message: 'Enter a weekly increment from 25 to 50 mg/day, the label\'s range.' };
    if (target < a) return { message: 'Enter a target dose at or above the starting dose.' };
    const steps = []; let dose = a; let wk = 1;
    while (dose < target - 1e-9 && wk <= 40) { steps.push([`Week ${wk}`, (wk - 1) * 7, 7, `${fmt(dose)} mg/day${dose > 25 ? ', in two divided doses' : ''}`]); dose = Math.min(target, dose + inc); wk += 1; }
    steps.push([`Week ${wk} onward`, (wk - 1) * 7, null, `${fmt(target)} mg/day, in two divided doses`]);
    const notes = [`Starting ${fmt(a)} mg/day, up ${fmt(inc)} mg/day every week to ${fmt(target)} mg/day: the label's ranges are 25 to 50 mg/day to start and 25 to 50 mg/day a week, and it says 25 mg steps may delay reaching an effective dose.`];
    notes.push(target < 200 ? 'The target is below the label\'s recommended 200 to 400 mg/day for partial-onset seizures or Lennox-Gastaut syndrome.' : target > 400 ? 'The target is above 400 mg/day; the label says doses above 400 mg/day have not been shown to improve responses in adults with partial-onset seizures.' : 'The target is within the label\'s 200 to 400 mg/day (400 mg/day for primary generalized tonic-clonic seizures).');
    return { steps, notes };
  }
  const f = inputFault([['the weight', o.weightKg, null, 150, 'kg'], ['the increment', o.stepMgKg, null, 10, 'mg/kg/day'], ['the weeks between increases', o.weeksPerStep, null, 2, 'weeks'], ['the target', o.targetMgKg, null, 20, 'mg/kg/day']]);
  if (f) return { message: f };
  const kg = num('weightKg'); const inc = num('stepMgKg'); const wks = num('weeksPerStep'); const target = num('targetMgKg');
  if (inc < 1 || inc > 3) return { message: 'Enter an increment from 1 to 3 mg/kg/day, the label\'s range.' };
  if (wks !== 1 && wks !== 2) return { message: 'Enter 1 or 2 weeks between increases: the label increases at 1- or 2-week intervals.' };
  if (target < 5 || target > 9) return { message: 'Enter a target from 5 to 9 mg/kg/day, the label\'s approximate range.' };
  // Week 1: 25 mg nightly, or less where 25 mg is above 3 mg/kg/day; then increments in mg/kg.
  const first = Math.min(25, 3 * kg);
  const steps = [['Week 1', 0, 7, `${fmt(first)} mg nightly${first < 25 ? ` (3 mg/kg/day at ${fmt(kg)} kg, below 25 mg)` : ''}`]];
  let dose = first; let day = 7; let n = 2; const targetMg = target * kg;
  while (dose < targetMg - 1e-9 && n <= 40) {
    dose = Math.min(targetMg, dose + inc * kg);
    const last = dose >= targetMg - 1e-9;
    steps.push([last ? `Step ${n} onward (target)` : `Step ${n}`, day, last ? null : wks * 7, `${fmt(dose)} mg/day, in two divided doses (${fmt(dose / kg)} mg/kg/day)`]);
    day += wks * 7; n += 1;
  }
  return { steps, notes: [`${fmt(kg)} kg: week 1 is 25 mg nightly, or 1 to 3 mg/kg/day where that is less; then up ${fmt(inc)} mg/kg/day (${fmt(inc * kg)} mg) every ${wks} week${wks === 1 ? '' : 's'} to ${fmt(target)} mg/kg/day (${fmt(targetMg)} mg/day). The label gives approximately 5 to 9 mg/kg/day in two divided doses as the target.`] };
}
