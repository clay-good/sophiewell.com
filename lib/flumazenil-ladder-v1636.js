// spec-v1636 tool 5: flumazenil dose ladder and cumulative caps, as the label states them.
//
// Source: Flumazenil Injection, USP label, Fresenius Kabi, DailyMed set id a72d9fc1-..., version 5,
// re-read October 11, 2026, Dosage and Administration (the spec named a distributor's copy of the
// same text; the manufacturer's label is the one read and watched):
//   Reversal of conscious sedation or general anesthesia, adults: "0.2 mg (2 mL) administered
//    intravenously over 15 seconds. If the desired level of consciousness is not obtained after
//    waiting an additional 45 seconds, a further dose of 0.2 mg (2 mL) can be injected and repeated at
//    60-second intervals where necessary (up to a maximum of 4 additional times) to a maximum total
//    dose of 1 mg (10 mL)." Resedation: "at 20-minute intervals as needed ... no more than 1 mg
//    (given as 0.2 mg/min) should be administered at any one time, and no more than 3 mg should be
//    given in any one hour."
//   Pediatric patients greater than 1 year, conscious sedation: "0.01 mg/kg (up to 0.2 mg) ... to a
//    maximum total dose of 0.05 mg/kg or 1 mg, whichever is lower." "The safety and efficacy of
//    repeated flumazenil administration in pediatric patients experiencing resedation have not been
//    established."
//   Suspected benzodiazepine overdose, adults: "0.2 mg (2 mL) administered intravenously over
//    30 seconds. If the desired level of consciousness is not obtained after waiting 30 seconds, a
//    further dose of 0.3 mg (3 mL) can be administered over another 30 seconds. Further doses of
//    0.5 mg (5 mL) can be administered over 30 seconds at 1-minute intervals up to a cumulative dose
//    of 3 mg." "On rare occasions, patients with a partial response at 3 mg may require additional
//    titration up to a total dose of 5 mg". "If a patient has not responded 5 minutes after receiving
//    a cumulative dose of 5 mg ..., the major cause of sedation is likely not to be due to
//    benzodiazepines". Resedation: 20-minute intervals, no more than 1 mg (given as 0.5 mg/min) at
//    any one time and no more than 3 mg in any one hour.
// The label has no pediatric overdose dosing, and the tool gives none.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Flumazenil Injection', setId: 'a72d9fc1-121c-455d-93a9-002378c9968f' };
export const INDICATIONS = [
  { value: 'sedation-reversal', text: 'Reversal of conscious sedation or general anesthesia' },
  { value: 'suspected-overdose', text: 'Suspected benzodiazepine overdose' },
];
export const PATIENTS = [
  { value: 'adult', text: 'Adult' },
  { value: 'child-over-1-year', text: 'Pediatric patient over 1 year of age' },
];
const NOTE = 'The label\'s next step in its dose series, for the count of doses entered. The label carries a boxed warning about seizures, and reversal is titrated to the patient\'s response; this does not say whether flumazenil should be given.';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
const n3 = (x) => (Math.round(x * 1000) / 1000).toLocaleString('en-US');

export function flumazenilLadder(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const ind = INDICATIONS.find((x) => x.value === String(o.indication ?? '').trim());
  if (!ind) return { valid: false, message: 'Choose the indication: reversal of sedation or anesthesia, or suspected overdose. The label\'s dose series differ.' };
  const pt = PATIENTS.find((x) => x.value === String(o.patient ?? '').trim());
  if (!pt) return { valid: false, message: 'Choose adult or pediatric patient: the pediatric dose is by weight.' };
  const child = pt.value !== 'adult';
  const f = inputFault([['the number of doses given so far in this series', o.dosesGiven, 0, 20, '']]);
  if (f) return { valid: false, message: `${f} Enter 0 before the first dose.` };
  const given = Number(o.dosesGiven);
  if (!Number.isInteger(given)) return { valid: false, message: 'Enter the number of doses given so far as a whole number.' };
  let kg = null;
  if (child) {
    const wf = inputFault([['the weight', o.weight, 3, 150, 'kg']]);
    if (wf) return { valid: false, message: wf };
    kg = Number(o.weight);
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Flumazenil Injection label figures are withheld: ${lr.why}. Read the dose series from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  if (child && ind.value === 'suspected-overdose') return { valid: true, flag: 'not-in-label', abnormal: true, labelUrl: lr.url, band: 'The label gives overdose dosing for adults only. It has no pediatric dose series for suspected benzodiazepine overdose, and none is shown.', bandLabel: 'Not in the label', notes: tail, note: NOTE };

  // The series: each step's dose in mg, and the label's caps.
  let steps; let cap; let hardCap; let over; let wait; const notes = [];
  if (ind.value === 'sedation-reversal') {
    const per = child ? Math.min(0.01 * kg, 0.2) : 0.2;
    cap = child ? Math.min(0.05 * kg, 1) : 1; hardCap = cap;
    steps = [];
    for (let i = 0, total = 0; i < 5 && total < cap - 1e-9; i += 1) { const d = Math.min(per, cap - total); steps.push(d); total += d; }
    over = 'over 15 seconds'; wait = (n) => (n === 0 ? 'now' : n === 1 ? 'after waiting a further 45 seconds' : 'at a 60-second interval');
    notes.push(child ? `Pediatric series: 0.01 mg/kg (up to 0.2 mg) per dose, ${n3(per)} mg at ${kg} kg, up to 4 additional times, to a maximum total of 0.05 mg/kg or 1 mg, whichever is lower (${n3(cap)} mg).` : 'Adult series: 0.2 mg, then a further 0.2 mg up to 4 additional times, to a maximum total of 1 mg.');
    notes.push(child ? 'Resedation: the label says the safety and efficacy of repeated flumazenil in pediatric patients with resedation have not been established.' : 'Resedation: repeated doses at 20-minute intervals as needed; no more than 1 mg (given as 0.2 mg/min) at any one time, and no more than 3 mg in any one hour.');
    if (child) notes.push('The label does not establish reversal of conscious sedation below 1 year of age.');
  } else {
    steps = [0.2, 0.3, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]; cap = 3; hardCap = 5;
    over = 'over 30 seconds'; wait = (n) => (n === 0 ? 'now' : n === 1 ? 'after waiting 30 seconds' : 'at a 1-minute interval');
    notes.push('Overdose series: 0.2 mg, then 0.3 mg, then 0.5 mg doses at 1-minute intervals up to a cumulative 3 mg. The label says most patients respond to 1 to 3 mg, and that on rare occasions a partial response at 3 mg may need titration up to a total of 5 mg.');
    notes.push('Resedation: repeated doses at 20-minute intervals if needed; no more than 1 mg (given as 0.5 mg/min) at any one time, and no more than 3 mg in any one hour.');
    notes.push('The label says not to rush administration, and that the patient should have a secure airway and intravenous access first.');
  }
  const sum = (n) => steps.slice(0, n).reduce((a, b) => a + b, 0);
  const cum = sum(Math.min(given, steps.length));
  notes.unshift(`${given} dose${given === 1 ? '' : 's'} entered as given: ${n3(cum)} mg in this series, counted at the label's doses.`);
  let flag; let band; let label; let abnormal = false; let nextMg = null;
  if (given >= steps.length || cum >= hardCap - 1e-9) {
    flag = 'series-complete'; abnormal = true; label = 'No further dose in the label';
    band = ind.value === 'suspected-overdose'
      ? 'A cumulative 5 mg has been reached. The label gives no further dose: with no response 5 minutes after a cumulative 5 mg, the major cause of sedation is likely not benzodiazepines, and more flumazenil is likely to have no effect.'
      : `The maximum total of ${n3(cap)} mg for this series has been reached. The label gives no further dose in the series${child ? '' : '; for resedation it gives repeated doses at 20-minute intervals'}.`;
  } else {
    nextMg = steps[given]; const after = cum + nextMg;
    const beyond = ind.value === 'suspected-overdose' && cum >= cap - 1e-9;
    flag = beyond ? 'beyond-3-mg' : 'next-dose'; abnormal = beyond; label = `${n3(nextMg)} mg next`;
    band = `${beyond ? 'A cumulative 3 mg has been given. The label says doses beyond 3 mg do not reliably add effect, and only on rare occasions is titration to 5 mg needed. If given: ' : 'Next dose: '}${n3(nextMg)} mg (${n2(nextMg / 0.1)} mL of 0.1 mg/mL) ${over}, ${wait(given)}; cumulative ${n3(after)} mg.`;
    notes.push(`After this dose: ${n3(Math.max(0, cap - after))} mg left under ${n3(cap)} mg${hardCap !== cap ? `, ${n3(hardCap - after)} mg under ${hardCap} mg` : ''}.`);
  }
  notes.push(...tail);
  return { valid: true, flag, abnormal, labelUrl: lr.url, nextDoseMg: nextMg === null ? null : Number(nextMg.toFixed(3)), cumulativeMg: Number(cum.toFixed(3)), capMg: Number(cap.toFixed(3)), band, bandLabel: label, notes, note: NOTE };
}
