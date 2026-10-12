// spec-v1636 tool 9: deferoxamine for acute iron poisoning, rate and 24-hour total, from the label.
//
// Source: Deferoxamine Mesylate for Injection label, Fresenius Kabi, DailyMed set id d91e16df-...,
// version 9, re-read October 11, 2026, section 2.1:
//   Intramuscular: "Use for all patients not in shock. The initial recommended dose ... is 1,000 mg
//    intramuscularly (IM) once. If needed based on the clinical response, administer subsequent doses
//    of 500 mg every 4 hours to 12 hours. The maximum recommended daily dose is 6,000 mg in 24 hours."
//   Intravenous: "to patients in a state of cardiovascular collapse and then only by slow infusion.
//    As soon as the clinical condition of the patient permits, intravenous administration should be
//    discontinued, and the drug should be administered intramuscularly. The initial recommended IV
//    dose ... is 1,000 mg administered at an infusion rate of up to 15 mg/kg/hr. If needed based on
//    the clinical response administer additional doses of 500 mg over 4 hours to 12 hours at a slower
//    infusion rate of up to 125 mg/hr. The maximum recommended daily dose is 6,000 mg in 24 hours."
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Deferoxamine Mesylate for Injection', setId: 'd91e16df-8daa-4cd2-86a2-273eaa2446e0' };
export const ROUTES = [
  { value: 'intramuscular', text: 'Intramuscular (the label\'s route for all patients not in shock)' },
  { value: 'intravenous', text: 'Intravenous (the label: only in cardiovascular collapse, by slow infusion)' },
];
const NOTE = 'The label\'s dose, rate limit and 24-hour total for acute iron poisoning. Whether to chelate, and when to stop, rest on the clinical picture and the poison center; this does not decide either.';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const hm = (hours) => { const min = Math.round(hours * 60); return `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`; };

export function deferoxamineAcuteIron(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
  if (f) return { valid: false, message: f };
  const route = ROUTES.find((r) => r.value === String(o.route ?? '').trim());
  if (!route) return { valid: false, message: 'Choose the route: the label gives intramuscular dosing for all patients not in shock, and intravenous only in cardiovascular collapse.' };
  const gf = inputFault([['the deferoxamine given in the last 24 hours', o.givenLast24h, 0, 20000, 'mg']]);
  if (gf) return { valid: false, message: `${gf} Enter 0 if none has been given.` };
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Deferoxamine Mesylate for Injection label figures are withheld: ${lr.why}. Read section 2.1 from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const kg = Number(o.weight); const given = Number(o.givenLast24h);
  const first = given === 0; const dose = first ? 1000 : 500;
  const iv = route.value === 'intravenous';
  const after = given + dose; const left = 6000 - given;
  const notes = [];
  if (iv) {
    if (first) { const rate = 15 * kg; notes.push(`Initial intravenous dose: 1,000 mg at up to 15 mg/kg/hr. At ${kg} kg that is up to ${n0(rate)} mg/hour, so 1,000 mg takes no less than ${hm(1000 / rate)}.`); }
    else notes.push('Additional intravenous doses: 500 mg over 4 to 12 hours, at a slower rate of up to 125 mg/hour, so 500 mg takes no less than 4 hours.');
    notes.push('Label: intravenous only for a patient in cardiovascular collapse, and only by slow infusion; change to intramuscular as soon as the patient\'s condition permits.');
  } else {
    notes.push(first ? 'Initial intramuscular dose: 1,000 mg once.' : 'Subsequent intramuscular doses: 500 mg every 4 to 12 hours, if needed on the clinical response.');
    notes.push('Label: the intramuscular route is for all patients not in shock.');
  }
  notes.push(`24-hour total: ${n0(given)} mg given + ${n0(dose)} mg = ${n0(after)} mg of the label's maximum of 6,000 mg in 24 hours.`);
  const over = after > 6000;
  if (!over) notes.push(`Left under 6,000 mg after this dose: ${n0(6000 - after)} mg.`);
  if (!first) notes.push('Any amount entered as already given is taken as after the initial 1,000 mg dose, so the next dose shown is the 500 mg dose.');
  notes.push(`Label: ${lr.edition}.`);
  const rateText = iv ? (first ? `, at up to ${n0(15 * kg)} mg/hour (no less than ${hm(1000 / (15 * kg))})` : ', at up to 125 mg/hour (no less than 4 hours)') : '';
  return {
    valid: true, flag: over ? 'past-24-hour-maximum' : first ? 'initial-dose' : 'subsequent-dose', abnormal: over, labelUrl: lr.url,
    doseMg: dose, maxRateMgPerHour: iv ? (first ? Number((15 * kg).toFixed(1)) : 125) : null, minimumHours: iv ? Number((first ? 1000 / (15 * kg) : 4).toFixed(2)) : null,
    totalAfterMg: after, remainingMg: Math.max(0, 6000 - after),
    band: over ? `A further ${n0(dose)} mg would bring the 24-hour total to ${n0(after)} mg, past the label's maximum of 6,000 mg in 24 hours; ${n0(Math.max(0, left))} mg remains under it.`
      : `${first ? 'Initial' : 'Next'} dose ${n0(dose)} mg ${iv ? 'intravenously' : 'intramuscularly'}${rateText}; 24-hour total ${n0(after)} mg of 6,000 mg.`,
    bandLabel: over ? 'Past 6,000 mg in 24 hours' : `${n0(dose)} mg${iv ? `, ${first ? `${n0(15 * kg)}` : '125'} mg/h max` : ''}`, notes, note: NOTE,
  };
}
