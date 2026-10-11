// spec-v1631 tool 11: theophylline and aminophylline, IV start and level-guided adjustment, by the label.
//
// Two label rows (spec-v1628 section 1), re-read on October 11, 2026:
//
// Aminophylline Injection (Hospira, DailyMed version 29), Dosage and Administration:
//   "a loading dose of intravenous theophylline of 4.6 mg/kg (5.7 mg/kg as aminophylline), calculated
//     on the basis of ideal body weight and administered over 30 minutes, on average, will produce a
//     maximum post-distribution serum concentration of 10 mcg/mL with a range of 6-16 mcg/mL."
//   "D = (Desired C - Measured C) (V) ... The mean volume of distribution can be assumed to be
//     0.5 L/kg" (actual range 0.3 to 0.7). "A loading dose should not be given before obtaining a
//     serum theophylline concentration if the patient has received any theophylline in the previous
//     24 hours."
//   Table V, initial theophylline infusion rates for a target of 10 mcg/mL (GROUPS below), with
//     "Aminophylline=theophylline/0.8" and the two ceilings, 900 and 400 mg/day, each "unless serum
//     levels indicate the need for a larger dose."
//   "In patients with cor pulmonale, cardiac decompensation, or liver dysfunction, or in those taking
//     drugs that markedly reduce theophylline clearance ..., the initial theophylline infusion rate
//     should not exceed 17 mg/hr (21 mg/hr as aminophylline) unless serum concentrations can be
//     monitored at 24-hour intervals."
//   Table VI, final adjustment by peak level, for an infusion (BANDS below, the `iv` wording).
//   Description: "Aminophylline (dihydrate) is approximately 79% of anhydrous theophylline by weight."
//
// Theophylline Extended-Release Tablets (Teva, version 4), Dosage and Administration, Table VI: the
//   same percentages for an oral dose (BANDS, the `oral` wording).
//
// Table VI prints "<9.9" and then "10 to 14.9": a level of exactly 9.9 has no row. The tool reads the
// level to one decimal, as the table prints it, treats 9.9 as the 10 to 14.9 row and says so.
//
// Each label's figures answer only while that label stands (lib/label-row.js).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  iv: '9a663ef3-881f-48bd-2689-3713b24545c2',
  oral: '25eabefa-518b-4030-9b72-01ac8b3deba9',
};
export const LOAD = { theophylline: 4.6, aminophylline: 5.7, volume: 0.5, volumeRange: [0.3, 0.7], salt: 0.8, expected: 10, expectedRange: [6, 16] };
export const MODES = [
  { value: 'iv-start', text: 'IV start: loading dose and infusion rate' },
  { value: 'adjust', text: 'Adjustment from a peak steady-state level' },
];
export const PRODUCTS = [
  { value: 'theophylline', text: 'Theophylline' },
  { value: 'aminophylline', text: 'Aminophylline' },
];
// Table V. rate in mg/kg/h of theophylline; q12 in mg/kg every 12 hours; cap in mg/day.
export const GROUPS = [
  { value: 'neonate-early', text: 'Neonate, postnatal age up to 24 days', q12: 1 },
  { value: 'neonate-late', text: 'Neonate, postnatal age beyond 24 days', q12: 1.5 },
  { value: 'infant', text: 'Infant, 6 to 52 weeks old', byWeeks: true },
  { value: 'child-1-9', text: 'Child, 1 to 9 years', rate: 0.8 },
  { value: 'child-9-12', text: 'Child, 9 to 12 years', rate: 0.7 },
  { value: 'adolescent-smoker', text: 'Adolescent 12 to 16, cigarette or marijuana smoker', rate: 0.7 },
  { value: 'adolescent', text: 'Adolescent 12 to 16, nonsmoker', rate: 0.5, cap: 900 },
  { value: 'adult', text: 'Adult 16 to 60, otherwise healthy nonsmoker', rate: 0.4, cap: 900 },
  { value: 'elderly', text: 'Over 60 years', rate: 0.3, cap: 400 },
  { value: 'impaired', text: 'Cardiac decompensation, cor pulmonale, liver dysfunction, sepsis with multiorgan failure, or shock', rate: 0.2, cap: 400 },
];
export const PRIOR = [
  { value: 'none', text: 'No theophylline in the past 24 hours' },
  { value: 'taken', text: 'Theophylline taken in the past 24 hours' },
];
export const ROUTES = [
  { value: 'iv', text: 'IV infusion (mg/h)' },
  { value: 'oral', text: 'Oral product (mg/day)' },
];
// Table VI. [highest level of the band, factor on the current dose or null to maintain, key].
export const BANDS = [
  { top: 9.8, key: 'low', factor: 1.25 },
  { top: 14.9, key: 'maintain', factor: null },
  { top: 19.9, key: 'consider', factor: 0.9 },
  { top: 24.9, key: 'decrease', factor: 0.75 },
  { top: 30, key: 'hold', factor: 0.75 },
  { top: Infinity, key: 'overdose', factor: 0.5 },
];
const WORDS = {
  iv: {
    low: 'Label, below 9.9 mcg/mL: if symptoms are not controlled and the current dosage is tolerated, increase the infusion rate about 25%. Recheck the level after 12 hours in children and 24 hours in adults.',
    maintain: 'Label, 10 to 14.9 mcg/mL: if symptoms are controlled and the dosage is tolerated, maintain the infusion rate and recheck the level at 24-hour intervals. If symptoms are not controlled, consider adding other medication.',
    consider: 'Label, 15 to 19.9 mcg/mL: consider a 10% decrease in the infusion rate for a greater margin of safety, even if the current dosage is tolerated.',
    decrease: 'Label, 20 to 24.9 mcg/mL: decrease the infusion rate by 25% even if no adverse effects are present. Recheck the level after 12 hours in children and 24 hours in adults.',
    hold: 'Label, 25 to 30 mcg/mL: stop the infusion for 12 hours in children and 24 hours in adults, and decrease the subsequent rate at least 25% even if no adverse effects are present. Recheck after 12 hours in children and 24 hours in adults. If symptomatic, stop the infusion and consider whether overdose treatment is indicated.',
    overdose: 'Label, above 30 mcg/mL: stop the infusion and treat overdose as indicated. If theophylline is later resumed, decrease the infusion rate by at least 50% and recheck after 12 hours in children and 24 hours in adults.',
  },
  oral: {
    low: 'Label, below 9.9 mcg/mL: if symptoms are not controlled and the current dosage is tolerated, increase the dose about 25%. Recheck the level after three days.',
    maintain: 'Label, 10 to 14.9 mcg/mL: if symptoms are controlled and the dosage is tolerated, maintain the dose and recheck the level at 6 to 12 month intervals. If symptoms are not controlled, consider adding other medication.',
    consider: 'Label, 15 to 19.9 mcg/mL: consider a 10% decrease in dose for a greater margin of safety, even if the current dosage is tolerated.',
    decrease: 'Label, 20 to 24.9 mcg/mL: decrease the dose by 25% even if no adverse effects are present. Recheck the level after 3 days.',
    hold: 'Label, 25 to 30 mcg/mL: skip the next dose and decrease subsequent doses at least 25% even if no adverse effects are present. Recheck the level after 3 days. If symptomatic, consider whether overdose treatment is indicated.',
    overdose: 'Label, above 30 mcg/mL: treat overdose as indicated. If theophylline is later resumed, decrease the dose by at least 50% and recheck the level after 3 days.',
  },
};
const NOTE = 'The label says the dose must be individualized on serum theophylline levels and that these figures are upper limits for adjustment. The tool does the label\'s arithmetic; it does not choose the dose.';
const TRIGGER = 'The label adds that a dose reduction or a level is indicated whenever adverse effects are present, something that lowers theophylline clearance occurs (such as sustained fever), or an interacting drug is added or stopped.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const withheld = (row, what) => ({ valid: true, withheld: true, labelUrl: row.url, band: `The ${what} label's figures are withheld, so nothing is worked out.`, bandLabel: 'Withheld', notes: [`The ${what} label figures are withheld: ${row.why}.`, 'Work the dose from the label in hand.'], note: NOTE });

function adjust(o, now, table) {
  const route = String(o.route ?? '').trim();
  if (route !== 'iv' && route !== 'oral') return { valid: false, message: 'Choose what the patient is on: an IV infusion or an oral product. The label\'s actions and recheck times differ.' };
  const unit = route === 'iv' ? 'mg/h' : 'mg/day';
  const f = inputFault([['the peak steady-state level', o.level, 0, 200, 'mcg/mL'], [route === 'iv' ? 'the current infusion rate' : 'the current daily dose', o.current, null, route === 'iv' ? 200 : 3000, unit]]);
  if (f) return { valid: false, message: f };
  const row = labelRow(LABELS[route], now, table);
  if (!row.answers) return withheld(row, route === 'iv' ? 'aminophylline injection' : 'theophylline extended-release');
  const level = Math.round(Number(o.level) * 10) / 10; const current = Number(o.current);
  const b = BANDS.find((x) => level <= x.top);
  const notes = [WORDS[route][b.key]];
  if (level === 9.9) notes.push('The label\'s table goes from "below 9.9" to "10 to 14.9" and gives 9.9 itself no row; this tool reads it as the 10 to 14.9 row.');
  if (Number(o.level) !== level) notes.push(`The level is read to one decimal, as the table prints its bands: ${show(level)} mcg/mL.`);
  let next = null; let line;
  if (b.factor === null) line = `maintain ${show(current)} ${unit}`;
  else {
    next = current * b.factor;
    const pct = Math.round(Math.abs(b.factor - 1) * 100);
    const least = b.key === 'hold' || b.key === 'overdose';
    notes.push(`${show(current)} ${unit} × ${b.factor} = ${show(next)} ${unit}${least ? `, the most the label allows (a decrease of at least ${pct}%)` : ''}.`);
    line = b.key === 'low' ? `an increase of about 25% is ${show(next)} ${unit}`
      : b.key === 'consider' ? `a 10% decrease is ${show(next)} ${unit}`
        : b.key === 'decrease' ? `a 25% decrease is ${show(next)} ${unit}`
          : b.key === 'hold' ? `${route === 'iv' ? 'stop the infusion first' : 'skip the next dose first'}; then no more than ${show(next)} ${unit}`
            : `treat as overdose; if resumed, no more than ${show(next)} ${unit}`;
  }
  notes.push(TRIGGER, `Label: ${row.edition}.`);
  return {
    valid: true, mode: 'adjust', level, row: b.key, adjusted: next === null ? null : sig(next), abnormal: level >= 20,
    band: `Peak ${show(level)} mcg/mL: ${line}.`,
    bandLabel: next === null ? 'Maintain' : `${show(next)} ${unit}`,
    notes, note: NOTE,
  };
}

export function theophyllineLabelDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (mode !== 'iv-start' && mode !== 'adjust') return { valid: false, message: 'Choose the mode: an IV start, or an adjustment from a peak steady-state level.' };
  if (mode === 'adjust') return adjust(o, now, table);

  const product = String(o.product ?? '').trim();
  if (product !== 'theophylline' && product !== 'aminophylline') return { valid: false, message: 'Choose the product: theophylline or aminophylline. The milligrams differ.' };
  const group = GROUPS.find((g) => g.value === String(o.group ?? '').trim());
  if (!group) return { valid: false, message: 'Choose the patient group from the label\'s Table V.' };
  const prior = String(o.prior ?? '').trim();
  if (prior !== 'none' && prior !== 'taken') return { valid: false, message: 'Say whether any theophylline was taken in the past 24 hours: the label gives no loading dose without a level if it was.' };
  const wf = inputFault([['the ideal body weight', o.weight, 0.4, 200, 'kg']]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight);
  let weeks = null;
  if (group.byWeeks) {
    const af = inputFault([['the age', o.ageWeeks, 6, 52, 'weeks']]);
    if (af) return { valid: false, message: af };
    weeks = Number(o.ageWeeks);
  }
  let measured = null; let target = null;
  if (prior === 'taken') {
    if (blank(o.level)) return { valid: false, message: 'Theophylline was taken in the past 24 hours: the label says a loading dose should not be given before a serum level. Enter the measured level.' };
    if (blank(o.target)) return { valid: false, message: 'Enter the desired level. The label says it should be conservative and gives 10 mcg/mL as its example.' };
    const lf = inputFault([['the measured level', o.level, 0, 200, 'mcg/mL'], ['the desired level', o.target, null, 20, 'mcg/mL']]);
    if (lf) return { valid: false, message: lf };
    measured = Number(o.level); target = Number(o.target);
  } else if (!blank(o.level)) {
    return { valid: false, message: 'A measured level is entered with "no theophylline in the past 24 hours". Clear the level, or choose "taken" to work the loading dose from it.' };
  }
  const row = labelRow(LABELS.iv, now, table);
  if (!row.answers) return withheld(row, 'aminophylline injection');

  const amino = product === 'aminophylline';
  const asProduct = (mgTheo) => (amino ? mgTheo / LOAD.salt : mgTheo);
  const notes = [];
  const out = { valid: true, mode: 'iv-start', product };
  let loadLine;
  if (prior === 'none') {
    const load = (amino ? LOAD.aminophylline : LOAD.theophylline) * kg;
    out.loadingDose = sig(load);
    notes.push(`Loading dose, no theophylline in 24 hours: ${amino ? '5.7 mg/kg as aminophylline (the label\'s figure for 4.6 mg/kg of theophylline)' : '4.6 mg/kg'} × ${show(kg)} kg = ${show(load)} mg over 30 minutes. The label expects about 10 mcg/mL afterward, range 6 to 16.`);
    loadLine = `load ${show(load)} mg ${product} over 30 minutes`;
  } else if (measured >= target) {
    out.loadingDose = 0;
    notes.push(`The measured ${show(measured)} mcg/mL is not below the desired ${show(target)} mcg/mL, so the label's formula gives no loading dose.`);
    loadLine = 'no loading dose (the level is already at the desired level)';
  } else {
    const theo = (target - measured) * LOAD.volume * kg;
    const load = asProduct(theo);
    out.loadingDose = sig(load);
    notes.push(`Loading dose from the level: (${show(target)} − ${show(measured)}) mcg/mL × 0.5 L/kg × ${show(kg)} kg = ${show(theo)} mg of theophylline${amino ? `, ÷ 0.8 = ${show(load)} mg of aminophylline` : ''}. The label assumes 0.5 L/kg; the actual range is 0.3 to 0.7.`);
    loadLine = `load ${show(load)} mg ${product}`;
  }

  let rateLine;
  if (group.q12) {
    const dose = asProduct(group.q12 * kg);
    out.doseEvery12h = sig(dose);
    notes.push(`Table V, ${group.text.toLowerCase()}: ${group.q12} mg/kg of theophylline every 12 hours × ${show(kg)} kg${amino ? ' ÷ 0.8' : ''} = ${show(dose)} mg of ${product} every 12 hours, for a target of 7.5 mcg/mL in neonatal apnea.`);
    rateLine = `then ${show(dose)} mg every 12 hours`;
  } else {
    const perKg = group.byWeeks ? 0.008 * weeks + 0.21 : group.rate;
    let theo = perKg * kg; let capped = false;
    if (group.cap && theo * 24 > group.cap) { theo = group.cap / 24; capped = true; }
    const rate = asProduct(theo);
    Object.assign(out, { ratePerKg: sig(perKg), infusionRate: sig(rate), capped });
    notes.push(`Table V, ${group.text.charAt(0).toLowerCase()}${group.text.slice(1)}: ${group.byWeeks ? `0.008 × ${show(weeks)} weeks + 0.21 = ${show(perKg)}` : show(perKg)} mg/kg/h of theophylline × ${show(kg)} kg = ${show(perKg * kg)} mg/h (${show(perKg * kg * 24)} mg/day), for a target of 10 mcg/mL.`);
    if (capped) notes.push(`That is above the label's ${group.cap} mg/day for this group ("unless serum levels indicate the need for a larger dose"), so ${group.cap} ÷ 24 = ${show(theo)} mg/h of theophylline.`);
    else if (group.cap) notes.push(`The label's ceiling for this group is ${group.cap} mg/day unless serum levels indicate the need for a larger dose.`);
    if (amino) notes.push(`As aminophylline (Table V: theophylline ÷ 0.8): ${show(rate)} mg/h.`);
    if (group.value === 'impaired') notes.push('The label also says that in cor pulmonale, cardiac decompensation or liver dysfunction, or with drugs that markedly reduce theophylline clearance, the initial rate should not exceed 17 mg/h of theophylline (21 mg/h as aminophylline) unless levels can be monitored at 24-hour intervals.');
    rateLine = `then ${show(rate)} mg/h`;
  }
  notes.push('The label doses on ideal body weight: theophylline distributes poorly into body fat. It says to take a level 30 minutes after a loading dose and another one expected half-life after starting the infusion.');
  if (amino) notes.push('The label\'s description gives aminophylline as approximately 79% theophylline by weight; its loading figure (5.7 mg/kg) and its dosing table (÷ 0.8) are the numbers used here.');
  notes.push(`Label: ${row.edition}.`);
  return {
    ...out,
    band: `${amino ? 'Aminophylline' : 'Theophylline'} on ${show(kg)} kg ideal weight: ${loadLine}, ${rateLine}.`,
    bandLabel: rateLine.replace('then ', ''),
    notes, note: NOTE,
  };
}
