// spec-v1636 tool 4: pralidoxime and DuoDote by weight, as the labels state them.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   PROTOPAM Chloride (pralidoxime), Baxter (set 2741d8fd-..., version 15), Dosage and Administration.
//     Adult intravenous: "an initial dose of 1000 to 2000 mg ..., preferably as an infusion in 100 mL
//      of normal saline, over a 15- to 30-minute period" or "slowly (over not less than five minutes)
//      ... as a 50 mg/mL solution"; "A second dose of 1000 to 2000 mg may be indicated after about
//      one hour ... Additional doses may be given every 10-12 hours if muscle weakness persists";
//      "The intermittent infusion rate should not exceed 200 mg/minute."
//     Adult intramuscular (about 300 mg/mL): mild, 600 mg (2 mL), repeated after 15 minutes to a
//      third dose, 1800 mg in all; severe, three 600 mg doses in rapid succession; the series may be
//      repeated about 1 hour after the last injection.
//     Pediatric (16 years and under) intravenous: "20-50 mg/kg (not to exceed 2000 mg/dose) over
//      15-30 minutes followed by a continuous infusion of 10-20 mg/kg/hour", or an intermittent
//      20-50 mg/kg dose, a second after about one hour, and repeats every 10-12 hours.
//     Pediatric intramuscular, Table 1: under 40 kg, 15 mg/kg per injection and 45 mg/kg per
//      three-injection course; 40 kg or more, 600 mg per injection and 1800 mg per course.
//   DuoDote (atropine and pralidoxime), Meridian (set 241f42a0-..., version 17), 2.2: for adults and
//     pediatric patients weighing more than 41 kg (90 pounds): one injection for two or more mild
//     symptoms; three in rapid succession for any severe symptom. Each holds pralidoxime chloride
//     600 mg and atropine 2.1 mg.
//
// Mild or severe is the reader's finding from the label's symptom lists. The label says atropine and
// supportive care come with pralidoxime; this tool is the pralidoxime arithmetic only.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  protopam: { name: 'PROTOPAM Chloride', setId: '2741d8fd-51c2-46be-880b-99f2b20a6137' },
  duodote: { name: 'DuoDote', setId: '241f42a0-1a33-40e8-8221-201767d999e5' },
};
export const PATIENTS = [
  { value: 'adult', text: 'Adult' },
  { value: 'pediatric-16-or-under', text: 'Pediatric patient, 16 years and under' },
];
export const ROUTES = [
  { value: 'pralidoxime-iv', text: 'Pralidoxime, intravenous' },
  { value: 'pralidoxime-im', text: 'Pralidoxime, intramuscular' },
  { value: 'duodote-autoinjector', text: 'DuoDote autoinjector' },
];
export const SEVERITIES = [
  { value: 'mild-symptoms', text: 'Mild symptoms' },
  { value: 'severe-symptoms', text: 'Severe symptoms' },
];
const NOTE = 'The pralidoxime dose the label gives for the entries made. The label gives atropine, decontamination and supportive care with it, and at least 48 to 72 hours of observation; none of that is replaced here, and the severity is the reader\'s finding.';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

export function pralidoximeDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const pt = PATIENTS.find((x) => x.value === String(o.patient ?? '').trim());
  if (!pt) return { valid: false, message: 'Choose adult, or pediatric patient 16 years and under: the label doses them differently.' };
  const route = ROUTES.find((x) => x.value === String(o.route ?? '').trim());
  if (!route) return { valid: false, message: 'Choose the route: intravenous, intramuscular, or the DuoDote autoinjector.' };
  const child = pt.value !== 'adult'; const iv = route.value === 'pralidoxime-iv'; const duo = route.value === 'duodote-autoinjector';
  let sev = null;
  if (!iv) {
    sev = SEVERITIES.find((x) => x.value === String(o.severity ?? '').trim());
    if (!sev) return { valid: false, message: 'Choose mild or severe symptoms: the intramuscular and autoinjector doses turn on it.' };
  }
  let kg = null;
  if (child || duo) {
    const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
    if (f) return { valid: false, message: f };
    kg = Number(o.weight);
  }
  const L = LABELS[duo ? 'duodote' : 'protopam'];
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const severe = sev && sev.value === 'severe-symptoms';
  const notes = []; let band; let label; let flag = 'dose'; let abnormal = false; const out = {};

  if (duo) {
    if (kg <= 41) return { valid: true, flag: 'not-in-label', abnormal: true, labelUrl: lr.url, band: `DuoDote is labeled for adults and pediatric patients weighing more than 41 kg (90 pounds). At ${kg} kg the label gives no DuoDote dose.`, bandLabel: 'No label dose', notes: tail, note: NOTE };
    const count = severe ? 3 : 1; out.autoinjectors = count; out.doseMg = count * 600;
    band = severe ? 'DuoDote: three autoinjectors in rapid succession (pralidoxime chloride 1,800 mg and atropine 6.3 mg in all), for any severe symptom.' : 'DuoDote: one autoinjector (pralidoxime chloride 600 mg and atropine 2.1 mg), for two or more mild symptoms.';
    label = `${count} autoinjector${count === 1 ? '' : 's'}`;
    if (!severe) notes.push('Label: if at any time after the first dose a severe symptom develops, give two more injections in rapid succession. Wait 10 to 15 minutes for the first dose to take effect.');
    notes.push('Label: three autoinjectors should be available for each patient at risk; the injection goes into the mid-lateral thigh, and definitive medical care follows.');
  } else if (iv && !child) {
    out.doseMgLow = 1000; out.doseMgHigh = 2000;
    band = 'Pralidoxime 1,000 to 2,000 mg intravenously, preferably in 100 mL of normal saline over 15 to 30 minutes. The label gives the dose as a range and does not pick a point in it.'; label = '1,000 to 2,000 mg';
    notes.push('If an infusion is not practical, or pulmonary edema is present: slowly, over not less than 5 minutes, as a 50 mg/mL solution (20 to 40 mL for 1,000 to 2,000 mg).', 'A second 1,000 to 2,000 mg dose may be indicated after about 1 hour if muscle weakness is not relieved, and further doses every 10 to 12 hours if it persists.', 'The intermittent infusion rate should not exceed 200 mg/minute.', 'The adult intravenous dose does not depend on weight.');
  } else if (iv) {
    const lo = Math.min(20 * kg, 2000); const hi = Math.min(50 * kg, 2000);
    out.doseMgLow = lo; out.doseMgHigh = hi;
    band = `Pralidoxime 20 to 50 mg/kg intravenously over 15 to 30 minutes: ${n0(lo)} to ${n0(hi)} mg at ${kg} kg${50 * kg > 2000 ? ', held to the label\'s 2,000 mg per dose' : ''}.`; label = `${n0(lo)} to ${n0(hi)} mg`;
    notes.push(`Then either a continuous infusion of 10 to 20 mg/kg/hour (${n0(10 * kg)} to ${n0(20 * kg)} mg/hour), or a second 20 to 50 mg/kg dose after about 1 hour if muscle weakness is not relieved, repeated every 10 to 12 hours.`, 'The label gives the dose as a range by severity and does not pick a point in it.');
  } else {
    const per = child && kg < 40 ? 15 * kg : 600; const course = per * 3;
    out.doseMg = Number(per.toFixed(1)); out.courseMg = Number(course.toFixed(1));
    const basis = child ? (kg < 40 ? `15 mg/kg at ${kg} kg` : '40 kg or more: the adult dose') : 'the adult dose';
    band = severe
      ? `Pralidoxime intramuscularly, severe symptoms: three injections of ${n0(per)} mg (${n2(per / 300)} mL each at about 300 mg/mL) in rapid succession, ${n0(course)} mg in all (${basis}).`
      : `Pralidoxime intramuscularly, mild symptoms: ${n0(per)} mg (${n2(per / 300)} mL at about 300 mg/mL), repeated after 15 minutes if symptoms persist, to a third dose and ${n0(course)} mg in all (${basis}).`;
    label = `${n0(per)} mg per injection`;
    if (!severe) notes.push('Label: if at any time after the first dose severe symptoms develop, give the two remaining injections in rapid succession.');
    notes.push('Label: if symptoms persist after the full three-injection course, the series may be repeated beginning about 1 hour after the last injection.');
    if (child) notes.push('The pediatric table switches to the adult doses at 40 kg, which the label says is about the 50th percentile for a 12-year-old.');
  }
  notes.push(...tail);
  return { valid: true, flag, abnormal, labelUrl: lr.url, ...out, band, bandLabel: label, notes, note: NOTE };
}
