// spec-v1635 tool 7: leucovorin rescue after high-dose methotrexate, as the leucovorin label's table
// states it. The single owner of that table in the pharmacy program.
//
// Sources, re-read October 11, 2026:
//   Leucovorin Calcium for Injection label, Sagent, DailyMed set id 9d0e5356-..., version 10,
//   "Leucovorin Rescue After High-Dose Methotrexate Therapy" (Dosage and Administration):
//     "based on a methotrexate dose of 12 to 15 grams/m2 administered by intravenous infusion over
//      4 hours"; "15 mg (approximately 10 mg/m2) every 6 hours for 10 doses starts 24 hours after the
//      beginning of the methotrexate infusion"; levels and creatinine "at least once daily";
//      continue "until the methotrexate level is below 5 x 10-8 M (0.05 micromolar)".
//     Normal elimination: "approximately 10 micromolar at 24 hours after administration, 1 micromolar
//      at 48 hours, and less than 0.2 micromolar at 72 hours" -> 15 mg PO, IM or IV every 6 hours for
//      60 hours.
//     Delayed late elimination: "remaining above 0.2 micromolar at 72 hours, and more than 0.05
//      micromolar at 96 hours" -> continue 15 mg every 6 hours until less than 0.05 micromolar.
//     Delayed early elimination and/or acute renal injury: "50 micromolar or more at 24 hours, or
//      5 micromolar or more at 48 hours after administration, OR; a 100% or greater increase in serum
//      creatinine level at 24 hours ... (e.g., an increase from 0.5 mg/dL to a level of 1 mg/dL or
//      more)" -> 150 mg IV every 3 hours until less than 1 micromolar; then 15 mg IV every 3 hours
//      until less than 0.05 micromolar.
//   Methotrexate Injection label, Accord, set id dd035a9f-..., version 7: section 11, molecular
//     weight 454.44 (so 1 micromolar = 0.45444 mg/L); section 2.2, rescue at 500 mg/m2 or more.
//   VORAXAZE label, set id acaef5a6-..., version 10, section 1: the pointer line above 1 micromolar.
//
// The table names four hours (24, 48, 72, 96) and leaves gaps (a 24-hour level between about 10 and
// 50, a 48-hour level between 1 and 5). A level at another hour, or in a gap, is reported with its
// neighbors and is never classified or interpolated. Protocol nomograms are not in the label.
//
// Pure: the clock is a parameter (used only for the label rows).

import { sigSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Leucovorin Calcium for Injection', setId: '9d0e5356-ff39-4a8e-944c-e808a21ef4b2' };
export const MTX_LABEL = { name: 'Methotrexate Injection', setId: 'dd035a9f-cd40-4314-b9d8-2294b8a924e2' };
export const VORAXAZE_LABEL = { name: 'VORAXAZE', setId: 'acaef5a6-b740-40e3-8ffe-74a75c74745c' };
export const LEVEL_UNITS = [
  { value: 'micromolar', text: 'µmol/L (micromolar)' },
  { value: 'mg-l', text: 'mg/L' },
];
const MG_L_PER_UMOL = 0.45444;
const ROW = {
  normal: 'Normal elimination row: leucovorin 15 mg by mouth, intramuscularly or intravenously every 6 hours for 60 hours (10 doses starting 24 hours after the start of the methotrexate infusion).',
  late: 'Delayed late elimination row: continue leucovorin 15 mg by mouth, intramuscularly or intravenously every 6 hours until the methotrexate level is less than 0.05 µmol/L.',
  early: 'Delayed early elimination or acute renal injury row: leucovorin 150 mg intravenously every 3 hours until the methotrexate level is less than 1 µmol/L, then 15 mg intravenously every 3 hours until it is less than 0.05 µmol/L.',
};
const POINTS = [24, 48, 72, 96];
const AT = {
  24: 'at 24 hours the table reads about 10 µmol/L (normal) and 50 µmol/L or more (delayed early)',
  48: 'at 48 hours it reads 1 µmol/L (normal) and 5 µmol/L or more (delayed early)',
  72: 'at 72 hours it reads less than 0.2 µmol/L (normal) and above 0.2 µmol/L (delayed late, with the 96-hour level)',
  96: 'at 96 hours it reads more than 0.05 µmol/L (delayed late, with the 72-hour level)',
};
const NOTE = 'The leucovorin label\'s table for methotrexate 12 to 15 g/m² over 4 hours, matched to one level. It is not a protocol nomogram, it does not interpolate between the label\'s time points, and it does not replace the treatment protocol in use.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4)).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function hdmtxLeucovorinRescue(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = LEVEL_UNITS.find((u) => u.value === String(o.levelUnit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the unit of the methotrexate level: µmol/L or mg/L.' };
  const f = inputFault([['the hours since the methotrexate infusion started', o.hours, 0, 336, 'hours'], ['the methotrexate level', o.level, 0, unit.value === 'mg-l' ? 2500 : 5000, unit.value === 'mg-l' ? 'mg/L' : 'µmol/L']]);
  if (f) return { valid: false, message: f };
  const crGiven = [o.baselineCreatinine, o.currentCreatinine].filter((v) => !blank(v)).length;
  if (crGiven === 1) return { valid: false, message: 'Enter both the baseline and the current serum creatinine, or neither: the label\'s criterion is the rise from one to the other.' };
  if (crGiven === 2) {
    const cf = inputFault([['the baseline serum creatinine', o.baselineCreatinine, null, 2000, ''], ['the current serum creatinine', o.currentCreatinine, null, 2000, '']]);
    if (cf) return { valid: false, message: cf };
  }
  let level72 = null;
  if (!blank(o.level72)) {
    const lf = inputFault([['the 72-hour methotrexate level', o.level72, 0, 5000, 'µmol/L']]);
    if (lf) return { valid: false, message: lf };
    level72 = Number(o.level72);
  }

  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The leucovorin label's rescue table is withheld: ${lr.why}. Read the table from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const notes = [];
  let level = Number(o.level);
  if (unit.value === 'mg-l') {
    const mr = labelRow(MTX_LABEL.setId, now, table);
    if (!mr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: mr.url, band: `The mg/L conversion is withheld: it rests on the molecular weight in the methotrexate label, and ${mr.why}. Enter the level in µmol/L.`, bandLabel: 'Withheld', notes: [], note: NOTE };
    level = Number(o.level) / MG_L_PER_UMOL;
    notes.push(`${Number(o.level)} mg/L ÷ 0.45444 = ${sig(level)} µmol/L (molecular weight 454.44, from the methotrexate label, ${mr.edition}).`);
  }
  const hours = Number(o.hours);
  const rise = crGiven === 2 ? (Number(o.currentCreatinine) - Number(o.baselineCreatinine)) / Number(o.baselineCreatinine) * 100 : null;
  const riseText = rise === null ? null : `Serum creatinine ${Number(o.baselineCreatinine)} to ${Number(o.currentCreatinine)}: ${rise >= 0 ? 'a rise' : 'a fall'} of ${sig(Math.abs(rise))}%.`;
  // The level shown with enough digits to sit on the right side of every row's cut-off.
  const L = `${sigSafe(level, [50, 10, 5, 1, 0.2, 0.05]).toLocaleString('en-US', { maximumSignificantDigits: 15 })} µmol/L`;

  let flag; let band; let label; let row = null; let abnormal = true;
  if (!POINTS.includes(hours)) {
    flag = 'between-time-points'; label = 'Not a label time point';
    const before = POINTS.filter((p) => p < hours).pop(); const after = POINTS.find((p) => p > hours);
    band = `${hours} hours is ${before === undefined ? 'before the label\'s first time point (24 hours)' : after === undefined ? 'after the label\'s last time point (96 hours)' : 'between the label\'s time points'}: the table names 24, 48, 72 and 96 hours only, so ${L} is not classified and nothing is interpolated.`;
    for (const p of [before, after]) if (p !== undefined) notes.push(`Neighboring time point: ${AT[p]}.`);
    if (riseText) notes.push(`${riseText} The label states its creatinine criterion (a 100% or greater rise) at 24 hours.`);
  } else if (hours === 24) {
    const doubled = rise !== null && rise >= 100 - 1e-9;
    if (level >= 50 || doubled) {
      flag = 'delayed-early'; row = 'early'; label = 'Delayed early elimination or renal injury';
      const why = [level >= 50 ? `${L} is 50 µmol/L or more` : null, doubled ? `serum creatinine rose ${sig(rise)}% (100% or more)` : null].filter(Boolean).join(' and ');
      band = `At 24 hours, ${why}: the label's delayed early elimination or acute renal injury row.`;
      if (riseText && !doubled) notes.push(`${riseText} Under the label's 100%.`);
    } else if (level <= 10 + 1e-9) {
      row = 'normal'; label = 'Normal elimination';
      if (rise === null) { flag = 'normal-creatinine-not-entered'; band = `At 24 hours, ${L} fits the label's normal elimination row by the level alone. The creatinine criterion (a 100% or greater rise at 24 hours puts a patient in the delayed early row) was not tested: no creatinine was entered.`; }
      else { flag = 'normal'; abnormal = false; band = `At 24 hours, ${L} fits the label's normal elimination row (about 10 µmol/L), and creatinine has not risen 100%.`; notes.push(riseText); }
    } else {
      flag = 'no-row-24h'; label = 'In no row of the table';
      band = `At 24 hours, ${L} is in no row: above the normal row's "approximately 10" and under the delayed early row's 50 µmol/L. The label does not settle it; both neighboring rows are below.`;
      notes.push(ROW.normal, ROW.early);
      if (riseText) notes.push(`${riseText} Under the label's 100%.`);
      else notes.push('The creatinine criterion was not tested: a 100% or greater rise at 24 hours is the delayed early row whatever the level.');
    }
    if (level <= 10 + 1e-9 || level >= 50) notes.push('The label\'s "approximately 10 micromolar" is not an exact cutoff; 10 µmol/L or less is read here as fitting it.');
  } else if (hours === 48) {
    if (level >= 5) { flag = 'delayed-early'; row = 'early'; label = 'Delayed early elimination or renal injury'; band = `At 48 hours, ${L} is 5 µmol/L or more: the label's delayed early elimination or acute renal injury row.`; }
    else if (level <= 1) { flag = 'normal'; row = 'normal'; abnormal = false; label = 'Normal elimination'; band = `At 48 hours, ${L} fits the label's normal elimination row (1 µmol/L).`; }
    else { flag = 'no-row-48h'; label = 'In no row of the table'; band = `At 48 hours, ${L} is in no row: above the normal row's 1 µmol/L and under the delayed early row's 5 µmol/L. The label does not settle it; both neighboring rows are below.`; notes.push(ROW.normal, ROW.early); }
    if (riseText) notes.push(`${riseText} The label states its creatinine criterion (a 100% or greater rise) at 24 hours.`);
  } else if (hours === 72) {
    if (level < 0.2) { flag = 'normal'; row = 'normal'; abnormal = false; label = 'Normal elimination'; band = `At 72 hours, ${L} is less than 0.2 µmol/L: the label's normal elimination row.`; }
    else if (level > 0.2) { flag = 'above-0.2-at-72h'; label = 'Above 0.2 at 72 hours'; band = `At 72 hours, ${L} is above 0.2 µmol/L. That is half of the delayed late row, which also needs a 96-hour level above 0.05 µmol/L; it is not classified as delayed late yet.`; notes.push(ROW.late); }
    else { flag = 'no-row-72h'; label = 'In no row of the table'; band = 'At 72 hours, exactly 0.2 µmol/L is neither "less than 0.2" (normal) nor "above 0.2" (delayed late). The label does not settle it.'; notes.push(ROW.normal, ROW.late); }
    if (riseText) notes.push(`${riseText} The label states its creatinine criterion (a 100% or greater rise) at 24 hours.`);
  } else {
    if (level > 0.05 && level72 === null) { flag = 'needs-72h-level'; label = '72-hour level needed'; band = `At 96 hours, ${L} is more than 0.05 µmol/L. The delayed late row also needs the 72-hour level (above 0.2 µmol/L); enter it to match the row.`; notes.push(ROW.late); }
    else if (level > 0.05 && level72 > 0.2) { flag = 'delayed-late'; row = 'late'; label = 'Delayed late elimination'; band = `${sig(level72)} µmol/L at 72 hours and ${L} at 96 hours: the label's delayed late elimination row.`; }
    else if (level > 0.05) { flag = 'no-row-96h'; label = 'In no row of the table'; band = `At 96 hours, ${L} is more than 0.05 µmol/L, but the 72-hour level (${sig(level72)} µmol/L) was not above 0.2, so the delayed late row is not matched. The level is still not below the label's stop level of 0.05 µmol/L.`; }
    else if (level < 0.05) { flag = 'below-stop-level'; abnormal = false; label = 'Below 0.05 µmol/L'; band = `At 96 hours, ${L} is below 0.05 µmol/L, the level the label continues rescue, hydration and urinary alkalinization until.`; }
    else { flag = 'at-stop-level'; label = 'Not below 0.05 µmol/L'; band = 'At 96 hours, exactly 0.05 µmol/L is not "below" the label\'s stop level and not "more than" the delayed late row\'s. The label does not settle it.'; }
    if (riseText) notes.push(`${riseText} The label states its creatinine criterion (a 100% or greater rise) at 24 hours.`);
  }
  if (row) notes.unshift(ROW[row]);
  notes.push('The label continues leucovorin, hydration and urinary alkalinization (pH 7.0 or greater) until the methotrexate level is below 0.05 µmol/L, with serum creatinine and methotrexate levels at least once daily.');
  const nextPoint = POINTS.find((p) => p > hours);
  if (nextPoint !== undefined) notes.push(`Next time point the table names: ${nextPoint} hours (${AT[nextPoint]}).`);
  notes.push('A patient already on the delayed early row stays on its dosing until the levels that row names; one later level does not move them back.');
  if (level > 1) {
    const vr = labelRow(VORAXAZE_LABEL.setId, now, table);
    if (vr.answers) notes.push('Above 1 µmol/L: the glucarpidase (VORAXAZE) label\'s indication is a toxic plasma methotrexate concentration (greater than 1 µmol/L) with delayed clearance due to impaired renal function. See Glucarpidase Dose and Leucovorin Spacing.');
  }
  notes.push('The label states this table is for methotrexate 12 to 15 g/m² given over 4 hours, and says not to give leucovorin intrathecally.');
  notes.push(`Label: ${lr.edition}.`);
  return {
    valid: true, flag, abnormal, labelUrl: lr.url, levelMicromolar: Number(level.toPrecision(6)), row,
    creatinineRisePercent: rise === null ? null : Number(rise.toFixed(1)),
    band, bandLabel: label, notes: notes.filter(Boolean), note: NOTE,
  };
}
