// spec-v1635 tool 12: epoetin and darbepoetin in chemotherapy anemia, by the label rules.
//
// Sources, DailyMed labels re-read October 11, 2026:
//   Epogen (epoetin alfa), Amgen, set 1f2d0b28-..., version 137, section 2.4:
//     "Initiate Epogen in patients on cancer chemotherapy only if the hemoglobin is less than
//      10 g/dL, and if there is a minimum of two additional months of planned chemotherapy."
//     Starting dose, adults: 150 Units/kg subcutaneously 3 times per week, or 40,000 Units
//      subcutaneously weekly; pediatric patients (5 to 18 years): 600 Units/kg intravenously weekly.
//     "Reduce dose by 25% if: Hemoglobin increases greater than 1 g/dL in any 2-week period or
//      Hemoglobin reaches a level needed to avoid RBC transfusion. Withhold dose if hemoglobin
//      exceeds a level needed to avoid RBC transfusion. Reinitiate at a dose 25% below the previous
//      dose when hemoglobin approaches a level where RBC transfusions may be required."
//     "After the initial 4 weeks of Epogen therapy, if hemoglobin increases by less than 1 g/dL and
//      remains below 10 g/dL, increase dose to: 300 Units/kg three times per week in adults or
//      60,000 Units weekly in adults; 900 Units/kg (maximum 60,000 Units) weekly in pediatric
//      patients. After 8 weeks of therapy, if there is no response as measured by hemoglobin levels
//      or if RBC transfusions are still required, discontinue Epogen."
//   Aranesp (darbepoetin alfa), Amgen, set 0fd36cb9-..., version 161, section 2.3 and Table 2:
//     the same initiation sentence; 2.25 mcg/kg every week or 500 mcg every 3 weeks; reductions of
//     40%; "If hemoglobin increases by less than 1 g/dL and remains below 10 g/dL after 6 weeks of
//     therapy": weekly schedule "Increase dose to 4.5 mcg/kg/week", every-3-week schedule "No dose
//     adjustment"; discontinue after 8 weeks without response or with transfusions still required,
//     and "Following completion of a chemotherapy course".
//
// The label puts "a level needed to avoid RBC transfusion" in words, not in g/dL, so the reader says
// where the hemoglobin stands against it. Nor does it put a number on "no response" at 8 weeks.
//
// Pure: the clock is a parameter (used only for the label rows).

import { dpSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  epoetin: { name: 'Epogen', setId: '1f2d0b28-9cc5-4523-80b8-637fdaf3f7a5' },
  darbepoetin: { name: 'Aranesp', setId: '0fd36cb9-c4f6-4167-93c9-8530865db3f9' },
};
export const SCHEDULES = [
  { value: 'epoetin-three-weekly-doses', text: 'Epoetin alfa, adult, 3 times per week', agent: 'epoetin', perKg: true, unit: 'Units', every: '3 times per week', cut: 25, start: 150, raise: 300, raiseAfter: 4 },
  { value: 'epoetin-weekly', text: 'Epoetin alfa, adult, weekly', agent: 'epoetin', perKg: false, unit: 'Units', every: 'weekly', cut: 25, startFlat: 40000, raiseFlat: 60000, raiseAfter: 4 },
  { value: 'epoetin-pediatric-weekly', text: 'Epoetin alfa, pediatric (5 to 18 years), weekly', agent: 'epoetin', perKg: true, unit: 'Units', every: 'weekly, intravenously', cut: 25, start: 600, raise: 900, raiseCap: 60000, raiseAfter: 4 },
  { value: 'darbepoetin-weekly', text: 'Darbepoetin alfa, weekly', agent: 'darbepoetin', perKg: true, unit: 'mcg', every: 'weekly', cut: 40, start: 2.25, raise: 4.5, raiseAfter: 6 },
  { value: 'darbepoetin-every-3-weeks', text: 'Darbepoetin alfa, every 3 weeks', agent: 'darbepoetin', perKg: false, unit: 'mcg', every: 'every 3 weeks', cut: 40, startFlat: 500, raiseAfter: 6 },
];
export const STAGES = [
  { value: 'not-started', text: 'Not started: test the label\'s conditions for starting' },
  { value: 'on-therapy', text: 'On therapy: test the dose-adjustment rules' },
];
export const TRANSFUSION_LEVELS = [
  { value: 'below', text: 'Below the level needed to avoid transfusion' },
  { value: 'reached', text: 'Has reached the level needed to avoid transfusion' },
  { value: 'exceeds', text: 'Exceeds the level needed to avoid transfusion' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
const NOTE = 'The label\'s rule for the numbers entered. The label puts the transfusion-avoiding hemoglobin in words, not in g/dL, so that part is the reader\'s determination. ESAs carry a boxed warning (death, cardiovascular and thromboembolic events, tumor progression) that this arithmetic does not replace.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// A hemoglobin rise to one decimal, or more where one would put it on the other side of the 1 g/dL rule.
const rise1 = (x) => dpSafe(x, [1 + 1e-9, 1], 1);
const fmt = (x, unit) => `${(unit === 'mcg' ? Math.round(x * 100) / 100 : Math.round(x)).toLocaleString('en-US')} ${unit}`;
const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());

export function esaChemoDoseAdjust(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const s = pick(SCHEDULES, o.schedule);
  if (!s) return { valid: false, message: 'Choose the agent and schedule: each has its own starting dose and adjustment rules.' };
  const stage = pick(STAGES, o.stage);
  if (!stage) return { valid: false, message: 'Choose the stage: not started, or on therapy. The label\'s rules differ.' };
  const f = inputFault([['the hemoglobin now', o.hemoglobin, 2, 25, 'g/dL']]);
  if (f) return { valid: false, message: f };
  const hgb = Number(o.hemoglobin);
  let kg = null;
  if (s.perKg) {
    const wf = inputFault([['the weight', o.weight, 2, 300, 'kg']]);
    if (wf) return { valid: false, message: wf };
    kg = Number(o.weight);
  }
  const L = LABELS[s.agent];
  const starting = stage.value === 'not-started';
  let months; let dose; let weeks; let level; let still; let course; let twoWeeks = null; let baseline = null;
  if (starting) {
    const mf = inputFault([['the months of chemotherapy still planned', o.monthsPlanned, 0, 60, 'months']]);
    if (mf) return { valid: false, message: mf };
    months = Number(o.monthsPlanned);
  } else {
    const df = inputFault([['the current dose', o.currentDose, null, s.unit === 'mcg' ? 2000 : 120000, s.unit], ['the weeks on therapy', o.weeksOnTherapy, 0, 520, 'weeks']]);
    if (df) return { valid: false, message: df };
    dose = Number(o.currentDose); weeks = Number(o.weeksOnTherapy);
    level = pick(TRANSFUSION_LEVELS, o.transfusionLevel);
    if (!level) return { valid: false, message: 'Choose where the hemoglobin stands against the level needed to avoid transfusion. The label states that level in words, not in g/dL.' };
    still = pick(YES_NO, o.transfusionsStillRequired);
    if (!still) return { valid: false, message: 'Choose whether red cell transfusions are still required.' };
    course = pick(YES_NO, o.chemoCompleted);
    if (!course) return { valid: false, message: 'Choose whether the chemotherapy course is completed: the label gives the ESA until then.' };
    for (const [key, label] of [['hemoglobinTwoWeeksAgo', 'the hemoglobin 2 weeks ago'], ['hemoglobinAtStart', 'the hemoglobin when the ESA was started']]) {
      if (blank(o[key])) continue;
      const hf = inputFault([[label, o[key], 2, 25, 'g/dL']]);
      if (hf) return { valid: false, message: hf };
      if (key === 'hemoglobinTwoWeeksAgo') twoWeeks = Number(o[key]); else baseline = Number(o[key]);
    }
  }
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label rules are withheld: ${lr.why}. Read the dosing section from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const name = s.agent === 'epoetin' ? 'Epoetin alfa' : 'Darbepoetin alfa';

  if (starting) {
    const fails = [hgb < 10 ? null : `hemoglobin ${hgb} g/dL is not less than 10 g/dL`, months >= 2 ? null : `${months} month${months === 1 ? '' : 's'} of planned chemotherapy is under the minimum of two additional months`].filter(Boolean);
    if (fails.length) return { valid: true, flag: 'initiation-not-met', abnormal: true, labelUrl: lr.url, band: `The label's conditions for starting are not met: ${fails.join(', and ')}. No starting dose is given.`, bandLabel: 'Conditions not met', notes: ['Label: initiate "only if the hemoglobin is less than 10 g/dL, and if there is a minimum of two additional months of planned chemotherapy."', ...tail], note: NOTE };
    const d = s.perKg ? s.start * kg : s.startFlat;
    return { valid: true, flag: 'starting-dose', abnormal: false, labelUrl: lr.url, action: 'start', newDose: Number(d.toFixed(2)), unit: s.unit,
      band: `Both starting conditions are met. ${name} starting dose: ${fmt(d, s.unit)} ${s.every}${s.perKg ? ` (${s.start} ${s.unit}/kg × ${kg} kg)` : ''}.`, bandLabel: fmt(d, s.unit),
      notes: [`Hemoglobin ${hgb} g/dL is less than 10 g/dL, and ${months} months of chemotherapy are still planned (minimum two).`, 'The label says to use the lowest dose necessary to avoid red cell transfusions, until completion of the chemotherapy course.', ...tail], note: NOTE };
  }

  const cut = (1 - s.cut / 100) * dose;
  const rise2 = twoWeeks === null ? null : hgb - twoWeeks;
  const riseStart = baseline === null ? null : hgb - baseline;
  const notes = []; let flag; let band; let label; let action; let newDose = null; let abnormal = true;
  if (course.value === 'yes') {
    flag = 'discontinue-course-complete'; action = 'discontinue'; label = 'Discontinue';
    band = `${name}: the chemotherapy course is completed. The label gives the ESA until completion of a chemotherapy course${s.agent === 'darbepoetin' ? ' and says to discontinue following it' : ''}.`;
  } else if (weeks >= 8 && still.value === 'yes') {
    flag = 'discontinue-week-8'; action = 'discontinue'; label = 'Discontinue';
    band = `${name}: after ${weeks} weeks, red cell transfusions are still required. The label says to discontinue after 8 weeks of therapy if there is no response or transfusions are still required.`;
  } else if (level.value === 'exceeds') {
    flag = 'withhold'; action = 'withhold'; label = 'Withhold'; newDose = cut;
    band = `${name}: hemoglobin exceeds the level needed to avoid transfusion. The label says to withhold the dose, and to restart ${s.cut}% below the previous dose, ${fmt(cut, s.unit)} ${s.every}, when hemoglobin approaches a level where transfusions may be required.`;
  } else if (level.value === 'reached' || (rise2 !== null && rise2 > 1 + 1e-9)) {
    flag = 'reduce'; action = 'reduce'; label = `Reduce ${s.cut}%`; newDose = cut;
    const why = [rise2 !== null && rise2 > 1 + 1e-9 ? `hemoglobin rose ${rise1(rise2)} g/dL in 2 weeks (more than 1 g/dL)` : null, level.value === 'reached' ? 'hemoglobin has reached the level needed to avoid transfusion' : null].filter(Boolean).join(' and ');
    band = `${name}: ${why}. The label says to reduce the dose by ${s.cut}%: ${fmt(dose, s.unit)} to ${fmt(cut, s.unit)} ${s.every}.`;
  } else if (weeks >= s.raiseAfter && riseStart !== null && riseStart < 1 - 1e-9 && hgb < 10) {
    if (s.raise || s.raiseFlat) {
      const raw = s.perKg ? s.raise * kg : s.raiseFlat; const up = s.raiseCap ? Math.min(raw, s.raiseCap) : raw;
      flag = 'increase'; action = 'increase'; label = 'Increase'; newDose = up;
      band = `${name}: after ${weeks} weeks hemoglobin has risen ${rise1(riseStart)} g/dL (less than 1 g/dL) and is below 10 g/dL. The label's increase is to ${fmt(up, s.unit)} ${s.every}${s.perKg ? ` (${s.raise} ${s.unit}/kg × ${kg} kg${s.raiseCap && raw > s.raiseCap ? `, capped at the label's maximum of ${fmt(s.raiseCap, s.unit)}` : ''})` : ''}.`;
    } else {
      flag = 'no-increase-on-this-schedule'; action = 'continue'; label = 'No dose adjustment';
      band = `${name}: after ${weeks} weeks hemoglobin has risen ${rise1(riseStart)} g/dL (less than 1 g/dL) and is below 10 g/dL. For the every-3-week schedule the label's table reads "No dose adjustment"; the increase to 4.5 mcg/kg/week is for the weekly schedule only.`;
    }
  } else {
    const untested = [rise2 === null ? 'the 2-week rise (no hemoglobin from 2 weeks ago was entered)' : null, riseStart === null && weeks >= s.raiseAfter && hgb < 10 ? `the rise since the ESA was started (no starting hemoglobin was entered), which the increase rule after ${s.raiseAfter} weeks turns on` : null].filter(Boolean);
    action = 'continue';
    if (untested.length) { flag = 'no-rule-met-incomplete'; label = 'Rules not all tested'; band = `${name}: no adjustment rule is met by what was entered, but not every rule was tested: ${untested.join('; and ')}.`; }
    else { flag = 'no-rule-met'; abnormal = false; label = 'No adjustment rule met'; band = `${name}: none of the label's reduce, withhold, increase or discontinue rules is met by these numbers. Current dose ${fmt(dose, s.unit)} ${s.every}.`; }
  }
  if (rise2 !== null) notes.push(`Hemoglobin ${twoWeeks} to ${hgb} g/dL over 2 weeks: ${rise2 >= 0 ? 'a rise' : 'a fall'} of ${rise1(Math.abs(rise2))} g/dL. The reduce rule is a rise greater than 1 g/dL in any 2-week period.`);
  if (riseStart !== null) notes.push(`Hemoglobin ${baseline} g/dL at the start to ${hgb} g/dL now: ${riseStart >= 0 ? 'a rise' : 'a fall'} of ${rise1(Math.abs(riseStart))} g/dL over ${weeks} weeks. The increase rule (a rise under 1 g/dL with hemoglobin still below 10 g/dL) applies after ${s.raiseAfter} weeks.`);
  if (weeks >= 8 && !action.startsWith('discontinue')) notes.push('At 8 weeks or more the label also says to discontinue "if there is no response as measured by hemoglobin levels." It puts no number on response, so that is not decided here.');
  if (s.perKg && action !== 'discontinue') notes.push(`Current dose ${fmt(dose, s.unit)} is ${Number((dose / kg).toFixed(s.unit === 'mcg' ? 2 : 0)).toLocaleString('en-US')} ${s.unit}/kg at ${kg} kg; the label's starting dose is ${s.start} ${s.unit}/kg.`);
  notes.push(`Label reductions for this agent are ${s.cut}% of the previous dose. The label says to use the lowest dose necessary to avoid red cell transfusions.`);
  notes.push(...tail);
  return { valid: true, flag, abnormal, labelUrl: lr.url, action, newDose: newDose === null ? null : Number(newDose.toFixed(2)), unit: s.unit, band, bandLabel: label, notes, note: NOTE };
}
