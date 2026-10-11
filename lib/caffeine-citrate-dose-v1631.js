// spec-v1631 tool 12: caffeine citrate for apnea of prematurity.
//
// Caffeine Citrate Injection and Oral Solution label (Sagent, DailyMed version 10), a label row
// (spec-v1628 section 1), re-read on October 11, 2026. Its dosing table:
//   Loading dose      1 mL/kg     20 mg/kg  intravenous (over 30 minutes)                one time
//   Maintenance dose  0.25 mL/kg  5 mg/kg   intravenous (over 10 minutes) or orally      every 24
//                                           hours, beginning 24 hours after the loading dose
// "NOTE THAT THE DOSE OF CAFFEINE BASE IS ONE-HALF THE DOSE WHEN EXPRESSED AS CAFFEINE CITRATE";
// each mL holds 20 mg of caffeine citrate. "Serious toxicity has been associated with serum levels
// greater than 50 mg/L." In its trial "caffeine levels ranged from 8 to 40 mg/L" and "a therapeutic
// plasma concentration range of caffeine could not be determined", so the tool shows no target range.
//
// The label's figures answer only while the label stands (lib/label-row.js). The tool reports what
// the label gives for a weight; it does not say what to give.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { setId: '5f38c395-0093-4afd-89ec-f96e5dc0934a', mgPerMl: 20, loadMgPerKg: 20, maintenanceMgPerKg: 5, toxicAbove: 50 };
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'g', text: 'g' },
  { value: 'lb', text: 'lb' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const NOTE = 'The label\'s doses for a weight, in caffeine citrate; the caffeine base is half. The label gives no therapeutic range. The tool does not say what to give.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function caffeineCitrateDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, g or lb.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 20000 : wu === 'lb' ? 44 : 20, wu]]);
  if (wf) return { valid: false, message: `${wf} This label is for apnea of prematurity.` };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: 'That weight is below the 0.2 kg this tool accepts. Check the weight and its unit.' };
  let level = null;
  if (!blank(o.level)) {
    const lf = inputFault([['the serum caffeine level', o.level, 0, 500, 'mg/L']]);
    if (lf) return { valid: false, message: lf };
    level = Number(o.level);
  }
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, weightKg: sig(kg), band: 'The caffeine citrate label figures are withheld, so no dose is shown.', bandLabel: 'Withheld', notes: [`The caffeine citrate label figures are withheld: ${row.why}.`, 'Read the dose for this weight from the label in hand.'], note: NOTE };
  }
  const load = LABEL.loadMgPerKg * kg; const maint = LABEL.maintenanceMgPerKg * kg;
  const notes = [
    `Loading dose: 20 mg/kg × ${show(kg)} kg = ${show(load)} mg of caffeine citrate (${show(load / 2)} mg of caffeine base), ${show(load / LABEL.mgPerMl)} mL of the 20 mg/mL solution, intravenously over 30 minutes, one time.`,
    `Maintenance dose: 5 mg/kg × ${show(kg)} kg = ${show(maint)} mg of caffeine citrate (${show(maint / 2)} mg of base), ${show(maint / LABEL.mgPerMl)} mL, intravenously over 10 minutes or orally, every 24 hours, beginning 24 hours after the loading dose.`,
  ];
  if (wu !== 'kg') notes.unshift(`Weight: ${show(Number(o.weight))} ${wu} = ${show(kg)} kg.`);
  const out = { valid: true, weightKg: sig(kg), loadingMg: sig(load), loadingBaseMg: sig(load / 2), loadingMl: sig(load / LABEL.mgPerMl), maintenanceMg: sig(maint), maintenanceBaseMg: sig(maint / 2), maintenanceMl: sig(maint / LABEL.mgPerMl) };
  let abnormal = false;
  if (level === null) notes.push('No serum level was entered. The label says a therapeutic range could not be determined from its trial, where levels ran from 8 to 40 mg/L, so no range is shown.');
  else {
    abnormal = level > LABEL.toxicAbove;
    out.levelAgainst = abnormal ? 'above 50 mg/L' : '50 mg/L or under';
    notes.push(`Serum level ${show(level)} mg/L: ${abnormal ? 'above' : 'not above'} the 50 mg/L the label associates with serious toxicity. The label gives no therapeutic range; in its trial levels ran from 8 to 40 mg/L.`);
  }
  notes.push(`Label: ${row.edition}.`);
  return {
    ...out, abnormal,
    band: `Loading ${show(load)} mg of caffeine citrate (${show(load / LABEL.mgPerMl)} mL) once; maintenance ${show(maint)} mg (${show(maint / LABEL.mgPerMl)} mL) every 24 hours${abnormal ? '; the level entered is above 50 mg/L' : ''}.`,
    bandLabel: `${show(load)} mg, then ${show(maint)} mg daily`,
    notes, note: NOTE,
  };
}
