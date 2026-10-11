// spec-v1631 tool 14: a lithium level (timing, range and a proportional dose).
//
// Lithium carbonate tablets and capsules label (Hikma, DailyMed version 3), a label row (spec-v1628
// section 1), re-read on October 11, 2026:
//   Section 2: "Obtain serum lithium concentration assay after 3 days, drawn 12 hours after the last
//     oral dose"; acute manic or mixed episodes "Titrate to serum lithium concentrations 0.8 to 1.2
//     mEq/L"; maintenance "0.8 to 1 mEq/L"; mild to moderate renal impairment (creatinine clearance
//     30 to 89 mL/min) "Start with dosages less than those for patients with normal renal function,
//     titrate slowly with frequent monitoring"; "not recommended for use in patients with severe
//     renal impairment (creatinine clearance less than 30 mL/min evaluated by Cockcroft-Gault)".
//   Section 5.1: "The toxic concentrations for lithium (>=1.5 mEq/L) are close to the therapeutic
//     range (0.8 to 1.2 mEq/L)", and some patients show toxic signs within the range.
//
//   dose for a target level = current daily dose x target / level
// That step is arithmetic on the reader's own level. It assumes linear kinetics, steady state, a
// 12-hour sample and unchanged kidney function, and the result says so; it is not a prediction method.
//
// The label's figures answer only while the label stands (lib/label-row.js).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { setId: 'b839ff4b-f62d-41ab-a823-550a756d58ec', acute: [0.8, 1.2], maintenance: [0.8, 1], toxicFrom: 1.5, sampleHours: 12 };
export const PHASES = [
  { value: 'acute', text: 'Acute manic or mixed episode' },
  { value: 'maintenance', text: 'Maintenance treatment' },
];
const NOTE = 'The label warns that toxic levels are close to the range and that some patients show toxicity inside it; a number in range is not a finding of safety. The tool does not choose a dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function lithiumLevelCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const phase = String(o.phase ?? '').trim();
  if (phase !== 'acute' && phase !== 'maintenance') return { valid: false, message: 'Choose acute or maintenance treatment: the label gives a different range for each.' };
  const f = inputFault([['the lithium level', o.level, 0, 10, 'mEq/L'], ['the hours since the last dose', o.hoursSinceDose, 0, 200, 'hours']]);
  if (f) return { valid: false, message: f };
  const level = Number(o.level); const hours = Number(o.hoursSinceDose);
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, band: `Lithium ${show(level)} mEq/L. The label's ranges are withheld.`, bandLabel: `${show(level)} mEq/L`, notes: [`The lithium label figures are withheld: ${row.why}.`, 'Read the ranges from the label in hand.'], note: NOTE };
  }
  const range = LABEL[phase];
  const where = level >= LABEL.toxicFrom ? 'toxic' : level > range[1] ? 'above' : level < range[0] ? 'below' : 'within';
  const timed = Math.abs(hours - LABEL.sampleHours) <= 1;
  const notes = [
    where === 'toxic'
      ? `${show(level)} mEq/L is at or above the 1.5 mEq/L the label gives as toxic.`
      : `${show(level)} mEq/L is ${where} the label's ${range[0]} to ${range[1]} mEq/L for ${phase === 'acute' ? 'acute manic or mixed episodes' : 'maintenance treatment'}; the label gives 1.5 mEq/L or more as toxic.`,
    timed
      ? `Timing: drawn ${show(hours)} hours after the last dose, as the label asks (12 hours after the last oral dose).`
      : `Timing: drawn ${show(hours)} hours after the last dose. The label's ranges are for a sample 12 hours after the last oral dose, so this level is not comparable to them.`,
  ];
  const out = { valid: true, levelAgainst: where, timedAsLabel: timed, labelRange: range };
  if (!blank(o.creatinineClearance)) {
    const cf = inputFault([['the creatinine clearance', o.creatinineClearance, 0, 300, 'mL/min']]);
    if (cf) return { valid: false, message: cf };
    const crcl = Number(o.creatinineClearance);
    out.renal = crcl < 30 ? 'severe' : crcl < 90 ? 'mild to moderate' : 'normal';
    notes.push(crcl < 30 ? `Creatinine clearance ${show(crcl)} mL/min: the label says lithium is not recommended in severe renal impairment (under 30 mL/min by Cockcroft-Gault).`
      : crcl < 90 ? `Creatinine clearance ${show(crcl)} mL/min: for 30 to 89 mL/min the label says to start with lower dosages and titrate slowly with frequent monitoring.`
        : `Creatinine clearance ${show(crcl)} mL/min: the label's renal dosing statements start below 90 mL/min.`);
  }
  const hasDose = !blank(o.dailyDose); const hasTarget = !blank(o.target);
  if (hasDose !== hasTarget) return { valid: false, message: 'For a proportional dose enter both the current daily dose and the target level.' };
  if (hasDose) {
    const df = inputFault([['the current daily dose', o.dailyDose, null, 5000, 'mg/day'], ['the target level', o.target, null, 1.5, 'mEq/L']]);
    if (df) return { valid: false, message: df };
    if (!(level > 0)) return { valid: false, message: 'A level of 0 gives no proportion to scale the dose by.' };
    const dose = (Number(o.dailyDose) * Number(o.target)) / level;
    out.proportionalDose = sig(dose);
    notes.push(`Proportional dose: ${show(Number(o.dailyDose))} mg/day × ${show(Number(o.target))} ÷ ${show(level)} = ${show(dose)} mg/day. This assumes linear kinetics, steady state, a 12-hour sample and unchanged kidney function${timed ? '' : '; this sample was not drawn at 12 hours'}.`);
  }
  notes.push(`Label: ${row.edition}.`);
  const abnormal = where === 'toxic' || where === 'above' || out.renal === 'severe';
  return {
    ...out, abnormal,
    band: `Lithium ${show(level)} mEq/L: ${where === 'toxic' ? 'at or above the 1.5 mEq/L the label gives as toxic' : `${where} the label's ${range[0]} to ${range[1]} mEq/L`}${timed ? '' : '; not a 12-hour sample, so not comparable to the range'}.`,
    bandLabel: where === 'toxic' ? 'At or above 1.5 mEq/L' : `${where[0].toUpperCase()}${where.slice(1)} ${range[0]} to ${range[1]} mEq/L`,
    notes, note: NOTE,
  };
}
