// spec-v1636 tool 1: oral acetylcysteine 72-hour regimen, as the Acetylcysteine Solution label states it.
//
// Source: Acetylcysteine Solution, USP label, Hospira, DailyMed set id 5558a5f5-..., version 22,
// re-read October 11, 2026, "Acetylcysteine as an Antidote" and "Dosage Guide and Preparation":
//   "Administer the loading dose of acetylcysteine, 140 mg per kg"; "a first maintenance dose
//   (70 mg/kg acetylcysteine) 4 hours after the loading dose. The maintenance dose is then repeated at
//   4-hour intervals for a total of 17 doses"; "If the patient vomits any oral dose within 1 hour of
//   administration, repeat that dose."
//   "If patient weighs less than 20 kg ..., calculate the doses ... Each mL of 20% Acetylcysteine
//   Solution, contains 200 mg ... Three (3) mL of diluent are added to each mL of 20% Acetylcysteine
//   Solution. Do not decrease the proportion of diluent."
//   The table, by body weight (kg): grams, mL of 20%, mL of diluent, total mL of 5% solution.
//
// The table's rows are whole-kilogram bands, and each row's dose is 140 mg/kg at the top of its band,
// so a per-kilogram calculation understates the label dose for most adults. A weight between two
// rows (29.5 kg) returns both. The table stops at 109 kg: above it the tool shows the arithmetic and
// says it is not a label row. The label writes its oral instructions for the 20% solution; the 10%
// figures are arithmetic to the same 5% and are marked so.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Acetylcysteine Solution', setId: '5558a5f5-e821-473b-7d8a-5d33d09f0586' };
export const STRENGTHS = [
  { value: '20-percent', text: '20% (200 mg/mL)', mgMl: 200 },
  { value: '10-percent', text: '10% (100 mg/mL)', mgMl: 100 },
];
// [low kg, high kg, load g, mL of 20%, diluent mL, total mL] then the same four for maintenance.
const TABLE = [
  [20, 29, [4, 20, 60, 80], [2, 10, 30, 40]],
  [30, 39, [6, 30, 90, 120], [3, 15, 45, 60]],
  [40, 49, [7, 35, 105, 140], [3.5, 18, 52, 70]],
  [50, 59, [8, 40, 120, 160], [4, 20, 60, 80]],
  [60, 69, [10, 50, 150, 200], [5, 25, 75, 100]],
  [70, 79, [11, 55, 165, 220], [5.5, 28, 82, 110]],
  [80, 89, [13, 65, 195, 260], [6.5, 33, 97, 130]],
  [90, 99, [14, 70, 210, 280], [7, 35, 105, 140]],
  [100, 109, [15, 75, 225, 300], [7.5, 37, 113, 150]],
];
const NOTE = 'The label\'s oral regimen for the weight entered. Whether to treat, and for how long, rests on the acetaminophen level and time of ingestion (see the acetaminophen nomogram tool); this does not decide that, and it is not the intravenous regimen.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
// Grams to two decimals: 70 mg/kg at 15 kg is 1.05 g, and 1.1 g would overstate it.
const g2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

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

// One dose line: grams, and the volumes for the strength chosen.
function prep(name, grams, row, strength, kg) {
  const perKg = `${n1(grams * 1000 / kg)} mg/kg at ${kg} kg`;
  if (strength.mgMl === 200) {
    const [, ml, dil, total] = row || [null, grams * 1000 / 200, grams * 1000 / 200 * 3, grams * 1000 / 200 * 4];
    return `${name}: ${g2(grams)} g (${perKg}) = ${g2(ml)} mL of 20% solution with ${g2(dil)} mL of diluent, ${g2(total)} mL of 5% solution.`;
  }
  const ml = grams * 1000 / 100;
  return `${name}: ${g2(grams)} g (${perKg}) = ${g2(ml)} mL of 10% solution with ${g2(ml)} mL of diluent, ${g2(ml * 2)} mL of 5% solution (arithmetic: the label writes its oral preparation for the 20% solution).`;
}

export function nacOralRegimen(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
  if (f) return { valid: false, message: f };
  const strength = STRENGTHS.find((s) => s.value === String(o.strength ?? '').trim());
  if (!strength) return { valid: false, message: 'Choose the solution strength: 20% or 10%. The volumes differ twofold.' };
  let start = null;
  if (!blank(o.loadTime)) {
    start = parseWhen(o.loadTime);
    if (start === null) return { valid: false, message: 'Enter the time of the loading dose as a date and time (YYYY-MM-DDTHH:MM).' };
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Acetylcysteine Solution label figures are withheld: ${lr.why}. Read the dosage guide from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const kg = Number(o.weight);
  const notes = [];
  let flag = 'table-row'; let abnormal = false; let band; let loadG = null; let maintG = null;
  const row = TABLE.find(([lo, hi]) => kg >= lo && kg <= hi);
  if (kg < 20) {
    loadG = 0.14 * kg; maintG = 0.07 * kg; flag = 'calculated-under-20-kg';
    band = `Under 20 kg the label says to calculate: loading dose ${g2(loadG)} g (140 mg/kg), then ${g2(maintG)} g (70 mg/kg) every 4 hours for 17 doses.`;
    notes.push(prep('Loading dose', loadG, null, strength, kg), prep('Each maintenance dose', maintG, null, strength, kg));
    notes.push('Label: three mL of diluent to each mL of 20% solution. "Do not decrease the proportion of diluent."');
  } else if (row) {
    [loadG] = row[2]; [maintG] = row[3];
    band = `Label row ${row[0]} to ${row[1]} kg: loading dose ${n1(loadG)} g, then ${n1(maintG)} g every 4 hours for 17 doses.`;
    notes.push(prep('Loading dose', loadG, row[2], strength, kg), prep('Each maintenance dose', maintG, row[3], strength, kg));
    notes.push(`The table doses by whole-kilogram bands, each at 140 mg/kg for the top of its band: at ${kg} kg a per-kilogram calculation would give ${g2(0.14 * kg)} g, and the label row gives ${g2(loadG)} g.`);
  } else if (kg > 109) {
    flag = 'above-table'; abnormal = true;
    band = `The label's table stops at 109 kg and has no row for ${kg} kg. Arithmetic only, not a label row: 140 mg/kg is ${g2(0.14 * kg)} g and 70 mg/kg is ${g2(0.07 * kg)} g.`;
    notes.push(`The label's last row, 100 to 109 kg, is a 15 g loading dose and 7.5 g maintenance doses.`);
  } else {
    const below = [...TABLE].reverse().find(([, hi]) => hi < kg); const above = TABLE.find(([lo]) => lo > kg);
    flag = 'between-rows'; abnormal = true;
    band = `${kg} kg falls between two rows of the label's whole-kilogram table (${below[0]} to ${below[1]} kg and ${above[0]} to ${above[1]} kg). Both rows are shown; no dose is chosen.`;
    for (const r of [below, above]) notes.push(`Row ${r[0]} to ${r[1]} kg: loading dose ${n1(r[2][0])} g (${n1(r[2][1])} mL of 20% with ${n1(r[2][2])} mL of diluent); maintenance ${n1(r[3][0])} g (${n1(r[3][1])} mL of 20% with ${n1(r[3][2])} mL of diluent).`);
  }
  const chosen = flag === 'table-row' || flag === 'calculated-under-20-kg';
  if (chosen) notes.push(`Whole course: ${g2(loadG)} g + 17 × ${g2(maintG)} g = ${g2(loadG + 17 * maintG)} g.`);
  notes.push('Schedule: the first maintenance dose 4 hours after the loading dose, then every 4 hours, 17 maintenance doses in all; the last is 68 hours after the loading dose.');
  if (start !== null) {
    notes.push(`Loading dose ${clock(start)}; maintenance doses ${[1, 2, 3].map((k) => clock(start + k * 4 * 3600000)).join(', ')}, and every 4 hours to dose 17 at ${clock(start + 68 * 3600000)}.`);
    notes.push('Times are read as written; a daylight-saving change in between is not adjusted for.');
  }
  notes.push('Label: if the patient vomits any oral dose within 1 hour of administration, repeat that dose.');
  notes.push(`Label: ${lr.edition}.`);
  const out = { valid: true, flag, abnormal, labelUrl: lr.url, band, bandLabel: chosen ? `${g2(loadG)} g, then ${g2(maintG)} g` : flag === 'above-table' ? 'No label row' : 'Two rows shown', notes, note: NOTE };
  if (chosen) Object.assign(out, { loadGrams: Number(loadG.toFixed(2)), maintenanceGrams: Number(maintG.toFixed(2)), courseGrams: Number((loadG + 17 * maintG).toFixed(2)) });
  if (start !== null) out.doseTimes = Array.from({ length: 18 }, (_, k) => clock(start + k * 4 * 3600000));
  return out;
}
