// spec-v1635 tool 10: rasburicase dose and vials, as the Elitek label states them.
//
// Source: Elitek (rasburicase) label, Sanofi-Aventis, DailyMed set id 0ae10bc4-..., version 25,
// re-read October 11, 2026:
//   2.1  "The recommended dose of Elitek is 0.2 mg/kg as a 30-minute intravenous infusion daily for
//        up to 5 days. Dosing beyond 5 days or administration of more than one course is not
//        recommended."
//   2.2  vials of 1.5 mg and 7.5 mg.
//   4, 5.2  "Do not administer Elitek to patients with glucose-6-phosphate dehydrogenase (G6PD)
//        deficiency"; "Screen patients at higher risk for G6PD deficiency (e.g., patients of African
//        or Mediterranean ancestry) prior to starting Elitek therapy".
// Label dose only. Fixed 3 mg or 6 mg doses are off-label practice and are not offered.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Elitek', setId: '0ae10bc4-6b65-402f-9db5-2d7753054922' };
export const G6PD = [
  { value: 'normal', text: 'Tested, not deficient' },
  { value: 'deficient', text: 'G6PD deficient' },
  { value: 'not-tested', text: 'Not tested' },
];
const NOTE = 'The labeled dose and the vials that cover it. The label has a boxed warning (hypersensitivity, hemolysis, methemoglobinemia, and interference with uric acid measurements in samples left at room temperature) that this arithmetic does not replace. It does not say whether rasburicase is indicated.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

// The fewest-waste, then fewest-vial, mix of 7.5 mg and 1.5 mg vials covering a dose.
function vials(dose) {
  let best = null;
  for (let a = 0; a <= Math.ceil(dose / 7.5); a += 1) {
    const b = Math.max(0, Math.ceil((dose - 7.5 * a) / 1.5 - 1e-9));
    const waste = 7.5 * a + 1.5 * b - dose;
    if (!best || waste < best.waste - 1e-9 || (Math.abs(waste - best.waste) < 1e-9 && a + b < best.large + best.small)) best = { large: a, small: b, waste };
  }
  return best;
}

export function rasburicaseDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
  if (f) return { valid: false, message: f };
  const g = G6PD.find((x) => x.value === String(o.g6pd ?? '').trim());
  if (!g) return { valid: false, message: 'Choose the G6PD status: deficiency is a contraindication on the label, so it is asked before any dose is shown.' };
  let day = null;
  if (!blank(o.day)) {
    const df = inputFault([['the day of the course', o.day, 1, 60, '']]);
    if (df) return { valid: false, message: df };
    day = Number(o.day);
    if (!Number.isInteger(day)) return { valid: false, message: 'Enter the day of the course as a whole number.' };
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Elitek label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  if (g.value === 'deficient') return { valid: true, flag: 'contraindicated', abnormal: true, labelUrl: lr.url, band: 'G6PD deficiency: the Elitek label says not to administer it. No dose is given.', bandLabel: 'Contraindicated', notes: ['Hemolysis has occurred in patients with G6PD deficiency given rasburicase (label sections 4 and 5.2).', ...tail], note: NOTE };
  if (day !== null && day > 5) return { valid: true, flag: 'beyond-5-days', abnormal: true, labelUrl: lr.url, band: `Day ${day} is past the label's course: dosing beyond 5 days, or more than one course, is not recommended. No dose is given.`, bandLabel: 'Beyond 5 days', notes: tail, note: NOTE };
  const dose = 0.2 * Number(o.weight); const v = vials(dose);
  const mix = [v.large ? `${v.large} × 7.5 mg` : null, v.small ? `${v.small} × 1.5 mg` : null].filter(Boolean).join(' and ');
  const notes = [`0.2 mg/kg × ${Number(o.weight)} kg = ${n2(dose)} mg, as a 30-minute intravenous infusion, once daily for up to 5 days. Not an intravenous bolus.`,
    `Vials: ${mix} (${n2(dose + v.waste)} mg), with ${n2(v.waste)} mg left over.`];
  if (day !== null) notes.push(`Day ${day} of 5: ${5 - day} day${5 - day === 1 ? '' : 's'} of the labeled course remain after this dose.`);
  if (g.value === 'not-tested') notes.push('G6PD not tested: the label says to screen patients at higher risk for G6PD deficiency (for example, patients of African or Mediterranean ancestry) before starting.');
  notes.push(...tail);
  return { valid: true, flag: g.value === 'not-tested' ? 'dose-g6pd-not-tested' : 'dose', abnormal: g.value === 'not-tested', labelUrl: lr.url, doseMg: Number(dose.toFixed(2)), vials75: v.large, vials15: v.small, wasteMg: Number(v.waste.toFixed(2)), band: `Rasburicase ${n2(dose)} mg once daily (0.2 mg/kg), from ${mix}.`, bandLabel: `${n2(dose)} mg`, notes, note: NOTE };
}
