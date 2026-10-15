// spec-v1631 tool 10: digoxin loading and maintenance dose by the label's method.
//
// Digoxin tablets label (Amneal, DailyMed version 20), sections 2.2 to 2.6, a label row (spec-v1628
// section 1), re-read on October 11, 2026:
//   Table 1, total oral loading dose: 5 to 10 years 20 to 45 mcg/kg; adults and pediatric patients
//     over 10 years 10 to 15 mcg/kg. "Administer half the total loading dose initially, then 1/4 the
//     loading dose every 6 to 8 hours twice".
//   "Total Maintenance Dose = Loading Dose (i.e. Peak Body Stores) x % Daily Loss/100
//     (% Daily Loss = 14 + Creatinine clearance/5)".
//   Table 3, maintenance dose in mcg once daily for pediatric patients over 10 years and adults, by
//     lean body weight (40 to 100 kg) and corrected creatinine clearance (10 to 100 mL/min), with the
//     days before steady state "if no loading dose administered". One cell is starred as about 30
//     percent lower than the calculated dose.
//   "Reduce the dose of digoxin tablets in patients whose lean weight is an abnormally small fraction
//     of their total body mass because of obesity or edema."
//   Table 3, footnote b (re-read October 14, 2026, version 20): "For adults, creatinine clearance was
//     corrected to 70-kg body weight or 1.73 m2 body surface area. If only serum creatinine
//     concentrations (Scr) are available, a corrected Ccr may be estimated in men as (140 - Age)/Scr.
//     For women, this result should be multiplied by 0.85." The pediatric route it names (the modified
//     Schwartz equation, with a constant k) is not built.
//   Table 6: tablets are 60% to 80% bioavailable; 62.5, 125, 250 and 500 mcg of tablets are
//     equivalent to 50, 100, 200 and 400 mcg intravenously.
//
// The table is read at the row and column at or below the values entered (65 kg reads the 60 kg
// column). That choice is this tool's rule, not the label's, and the result names the cell it read.
// For ages 5 to 10 only the loading range is given; the label's twice-daily maintenance table for
// that age is not carried. This tool does not interpret levels.
//
// The label's figures answer only while the label stands (lib/label-row.js).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { setId: 'dfac7f13-28be-423d-9389-9089da29da17' };
export const WEIGHTS = [40, 50, 60, 70, 80, 90, 100];
// creatinine clearance row -> [doses by weight column..., days to steady state]
export const TABLE = {
  10: [62.5, 125, 125, 187.5, 187.5, 187.5, 250, 19],
  20: [125, 125, 125, 187.5, 187.5, 250, 250, 16],
  30: [125, 125, 187.5, 187.5, 250, 250, 312.5, 14],
  40: [125, 187.5, 187.5, 250, 250, 312.5, 312.5, 13],
  50: [125, 187.5, 187.5, 250, 250, 312.5, 312.5, 12],
  60: [125, 187.5, 250, 250, 312.5, 312.5, 375, 11],
  70: [187.5, 187.5, 250, 250, 312.5, 375, 375, 10],
  80: [187.5, 187.5, 250, 312.5, 312.5, 375, 437.5, 9],
  90: [187.5, 250, 250, 312.5, 375, 437.5, 437.5, 8],
  100: [187.5, 250, 312.5, 312.5, 375, 437.5, 500, 7],
};
export const AGE_GROUPS = [
  { value: 'over-10', text: 'Adult or child over 10 years' },
  { value: '5-10', text: '5 to 10 years' },
];
export const SEXES = [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
];
const LOADING = { 'over-10': [10, 15], '5-10': [20, 45] };
const NOTE = 'The label\'s arithmetic for a loading dose you chose. It says to reduce the dose when lean weight is an abnormally small fraction of total body mass, and it ties every dose to response, levels and toxicity. The tool does not choose a dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function digoxinLabelDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const age = String(o.ageGroup ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(LOADING, age)) return { valid: false, message: 'Choose the age group: adult or child over 10 years, or 5 to 10 years.' };
  const wu = String(o.weightUnit ?? '').trim();
  if (wu !== 'kg' && wu !== 'lb') return { valid: false, message: 'Choose the weight unit: kg or lb.' };
  const f = inputFault([['the lean body weight', o.leanWeight, null, wu === 'lb' ? 660 : 300, wu], ['the loading dose chosen', o.loadMcgPerKg, null, 100, 'mcg/kg']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.leanWeight) * (wu === 'lb' ? 0.45359237 : 1); const perKg = Number(o.loadMcgPerKg);
  const row = labelRow(LABEL.setId, now, table);
  const load = perKg * kg;
  const notes = [`${show(perKg)} mcg/kg × ${show(kg)} kg of lean weight = ${show(load)} mcg total oral loading dose.`];
  const out = { valid: true, loadingMcg: sig(load), leanWeightKg: sig(kg) };
  if (!row.answers) {
    notes.push(`The digoxin label figures are withheld: ${row.why}.`);
    return { ...out, withheld: true, labelUrl: row.url, band: `${show(load)} mcg total loading dose. The label's range, schedule and maintenance figures are withheld.`, bandLabel: `${show(load)} mcg`, notes, note: NOTE };
  }
  const range = LOADING[age];
  const where = sig(perKg) > range[1] ? 'above' : sig(perKg) < range[0] ? 'below' : 'within';
  out.loadingAgainst = where; out.labelLoadingRange = range;
  notes.push(`That is ${where} the label's ${range[0]} to ${range[1]} mcg/kg for ${age === 'over-10' ? 'adults and children over 10 years' : 'ages 5 to 10 years'} (${show(range[0] * kg)} to ${show(range[1] * kg)} mcg at this weight).`);
  notes.push(`Schedule on the label: half (${show(load / 2)} mcg) first, then a quarter (${show(load / 4)} mcg) every 6 to 8 hours twice, with assessment before each dose.`);
  let band = `Loading ${show(load)} mcg in all (${show(load / 2)} mcg, then ${show(load / 4)} mcg twice), ${where} the label range`;
  if (age === '5-10') {
    if (!blank(o.creatinineClearance) || !blank(o.serumCreatinine)) return { valid: false, message: 'For ages 5 to 10 this tool gives the loading range only. Clear the creatinine clearance and serum creatinine, or choose the older age group.' };
    notes.push('Maintenance: the label has its own twice-daily table for ages 5 to 10, which this tool does not carry.');
  } else if (blank(o.creatinineClearance) && blank(o.serumCreatinine)) {
    notes.push('No creatinine clearance or serum creatinine was entered, so no maintenance dose is worked out.');
  } else {
    let crcl;
    if (!blank(o.creatinineClearance)) {
      const cf = inputFault([['the corrected creatinine clearance', o.creatinineClearance, 0, 250, 'mL/min']]);
      if (cf) return { valid: false, message: cf };
      crcl = Number(o.creatinineClearance);
      if (!blank(o.serumCreatinine)) notes.push('A clearance was entered, so the serum creatinine was not used to estimate one.');
    } else {
      // Table 3, footnote b: the adult estimate from a serum creatinine alone.
      const sf = inputFault([['the serum creatinine', o.serumCreatinine, null, 20, 'mg/dL'], ['the age', o.patientAge, 0, 120, 'years']]);
      if (sf) return { valid: false, message: sf };
      const years = Number(o.patientAge);
      if (years < 18) return { valid: false, message: 'The label\'s estimate from a serum creatinine is for adults; for a child it names the modified Schwartz equation, which this tool does not carry. Enter the corrected creatinine clearance instead.' };
      const sex = String(o.sex ?? '').trim();
      if (sex !== 'male' && sex !== 'female') return { valid: false, message: 'Choose male or female: the label multiplies the estimate by 0.85 for women.' };
      if (years >= 140) return { valid: false, message: 'Enter an age under 140: the label\'s estimate is (140 - age) / Scr.' };
      const scr = Number(o.serumCreatinine);
      crcl = ((140 - years) / scr) * (sex === 'female' ? 0.85 : 1);
      out.estimatedClearance = sig(crcl);
      notes.push(`Corrected creatinine clearance estimated by the label (Table 3, footnote b): (140 - ${show(years)}) / ${show(scr)}${sex === 'female' ? ' × 0.85' : ''} = ${show(crcl)} mL/min.`);
    }
    const loss = 14 + crcl / 5; const byFormula = (load * loss) / 100;
    Object.assign(out, { percentDailyLoss: sig(loss), maintenanceByFormulaMcg: sig(byFormula) });
    notes.push(`Maintenance by the label's formula: daily loss 14 + ${show(crcl)} ÷ 5 = ${show(loss)}%; ${show(load)} × ${show(loss)} ÷ 100 = ${show(byFormula)} mcg a day.`);
    const rowKey = Math.min(100, Math.floor(crcl / 10) * 10); const col = WEIGHTS.filter((w) => w <= kg).pop();
    if (rowKey < 10 || col === undefined) notes.push(`Maintenance by the label's table: the table starts at 10 mL/min and 40 kg, so it has no cell for ${show(crcl)} mL/min and ${show(kg)} kg.`);
    else {
      const cells = TABLE[rowKey]; const dose = cells[WEIGHTS.indexOf(col)]; const days = cells[7];
      Object.assign(out, { maintenanceByTableMcg: dose, tableRow: rowKey, tableColumn: col, daysToSteadyState: days });
      notes.push(`Maintenance by the label's table: ${dose} mcg once daily, read at ${rowKey} mL/min and ${col} kg (the row and column at or below the values entered; that choice is this tool's). Steady state in ${days} days if no loading dose is given.${rowKey === 10 && col === 40 ? ' The label stars this cell as about 30 percent below the calculated dose.' : ''}`);
      band += `; maintenance ${dose} mcg daily by the table, ${show(byFormula)} mcg by the formula`;
    }
  }
  notes.push('Tablets and injection: the label gives tablets as 60% to 80% bioavailable, with 62.5, 125, 250 and 500 mcg of tablets equivalent to 50, 100, 200 and 400 mcg intravenously.');
  notes.push(`Label: ${row.edition}.`);
  return { ...out, abnormal: where === 'above', band: `${band}.`, bandLabel: `Load ${show(load)} mcg`, notes, note: NOTE };
}
