// spec-v1633 tool 14: tacrolimus, cyclosporine and mycophenolate formulation switches, as the labels state them.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Envarsus XR (Veloxis, DailyMed version 16), section 2.3: "administer ENVARSUS XR once daily at a
//     dose that is 80% of the total daily dose of the tacrolimus immediate-release product. Monitor
//     tacrolimus whole blood trough concentrations".
//   Neoral (Novartis, version 30), Dosage and Administration: "Neoral should be started with the same
//     daily dose as was previously used with Sandimmune (1:1 dose conversion). The Neoral dose should
//     subsequently be adjusted to attain the pre-conversion cyclosporine blood trough concentration."
//     Warnings: "Because Neoral is not bioequivalent to Sandimmune, conversion from Neoral to
//     Sandimmune using a 1:1 ratio (mg/kg/day) may result in lower cyclosporine blood concentrations."
//   Myfortic (Novartis, version 36), section 12.3: "near equimolar dosing of Myfortic 720 mg twice
//     daily and MMF 1,000 mg twice daily (739 mg as MPA)". Section 1.2: "Myfortic delayed-release
//     tablets and mycophenolate mofetil tablets and capsules should not be used interchangeably."
//   CellCept (Genentech, version 51), section 2: "should not be used interchangeably with
//     mycophenolic acid delayed-release tablets without supervision of a physician with experience in
//     immunosuppressive therapy because the rates of absorption ... are not equivalent".
//
// Neoral to Sandimmune and the two mycophenolate products are not given a new dose: the labels warn
// against a milligram-for-milligram switch, so the tool reports the caution, and for mycophenolate
// the mycophenolic acid content of the regimen.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const ENVARSUS = { brand: 'Envarsus XR', setId: 'de2315b0-6344-43ac-9aea-3e3b68d828e7' };
const NEORAL = { brand: 'Neoral', setId: '94461af3-11f1-4670-95d4-2965b9538ae3' };
const MYFORTIC = { brand: 'Myfortic', setId: 'eed26501-890d-4ff6-88e7-6dbea4726e53' };
const CELLCEPT = { brand: 'CellCept', setId: '37241e87-4af4-4dc3-a1aa-ea6f20d8dc40' };
export const LABELS = { envarsus: ENVARSUS, neoral: NEORAL, myfortic: MYFORTIC, cellcept: CELLCEPT };
export const SWITCHES = [
  { value: 'tacrolimus-ir-to-envarsus', text: 'Tacrolimus immediate-release to Envarsus XR', labels: [ENVARSUS] },
  { value: 'sandimmune-to-neoral', text: 'Sandimmune to Neoral (cyclosporine)', labels: [NEORAL] },
  { value: 'neoral-to-sandimmune', text: 'Neoral to Sandimmune (cyclosporine)', labels: [NEORAL] },
  { value: 'mmf-to-myfortic', text: 'Mycophenolate mofetil (CellCept) to Myfortic', labels: [MYFORTIC, CELLCEPT] },
  { value: 'myfortic-to-mmf', text: 'Myfortic to mycophenolate mofetil (CellCept)', labels: [MYFORTIC, CELLCEPT] },
];
// The Myfortic label: 1,000 mg of mycophenolate mofetil is 739 mg as mycophenolic acid.
export const MMF_TO_MPA = 0.739;
const NOTE = 'This reports what the labels state for the switch. It does not prescribe. Each of these drugs is adjusted to blood concentrations or under specialist supervision after any change.';
const say = (x) => Number(x.toFixed(2)).toLocaleString('en-US');

export function transplantFormulationSwitch(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const sw = SWITCHES.find((s) => s.value === String(o.switch ?? '').trim());
  if (!sw) return { valid: false, message: 'Choose the switch: the drug and the two products.' };
  const f = inputFault([['the current total daily dose', o.dailyDose, null, 10000, 'mg']]);
  if (f) return { valid: false, message: f };
  const rows = sw.labels.map((L) => ({ L, lr: labelRow(L.setId, now, table) }));
  const dead = rows.find((r) => !r.lr.answers);
  if (dead) return { valid: true, withheld: true, labelUrl: dead.lr.url, band: `The ${dead.L.brand} label's statement is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${dead.L.brand} label rows are withheld: ${dead.lr.why}.`, 'Read the conversion from the label in hand.'], note: NOTE };
  const d = Number(o.dailyDose);
  const base = { valid: true, switch: sw.value, dailyDose: d, labelUrl: rows[0].lr.url, note: NOTE };
  const tail = rows.map((r) => `Label: ${r.lr.edition}.`);

  if (sw.value === 'tacrolimus-ir-to-envarsus') {
    const target = d * 0.8;
    return { ...base, flag: 'dose', abnormal: false, targetDailyDose: Number(target.toFixed(2)), band: `The Envarsus XR label: once daily at 80% of the total daily dose of the immediate-release tacrolimus, which is ${say(target)} mg once daily from ${say(d)} mg a day.`, bandLabel: `${say(target)} mg once daily`, notes: ['The label then titrates to whole blood trough concentrations (4 to 11 ng/mL in the conversion setting).', 'The label gives no rounding rule; the figure is 80% as calculated, and Envarsus XR tablets come in 0.75 mg, 1 mg and 4 mg.', 'This statement is for kidney transplant patients. No rule is held here for Astagraf XL.', ...tail] };
  }
  if (sw.value === 'sandimmune-to-neoral') {
    return { ...base, flag: 'dose', abnormal: false, targetDailyDose: d, band: `The Neoral label: start Neoral at the same daily dose as the Sandimmune, ${say(d)} mg a day (1:1), then adjust to the pre-conversion cyclosporine trough concentration.`, bandLabel: `${say(d)} mg a day, then adjust to trough`, notes: ['The label says the same trough target gives greater cyclosporine exposure with Neoral than with Sandimmune, and that patients with suspected poor absorption of Sandimmune need a different approach.', 'Neoral and Sandimmune are not bioequivalent and cannot be used interchangeably without physician supervision.', ...tail] };
  }
  if (sw.value === 'neoral-to-sandimmune') {
    return { ...base, flag: 'no-recommendation-given', abnormal: true, band: 'The Neoral label gives no dose for a switch from Neoral to Sandimmune. It warns that a 1:1 conversion may result in lower cyclosporine blood concentrations, and that the switch should be made with increased monitoring to avoid underdosing.', bandLabel: 'No dose given', notes: ['Neoral and Sandimmune are not bioequivalent and cannot be used interchangeably without physician supervision.', ...tail] };
  }
  const fromMmf = sw.value === 'mmf-to-myfortic';
  const mpa = fromMmf ? d * MMF_TO_MPA : d;
  return { ...base, flag: 'content-comparison', abnormal: true, mpaDailyMg: Number(mpa.toFixed(2)),
    band: fromMmf ? `${say(d)} mg a day of mycophenolate mofetil is ${say(mpa)} mg a day as mycophenolic acid (739 mg per 1,000 mg). Myfortic tablets are labeled in mg of mycophenolic acid.` : `${say(d)} mg a day of Myfortic is ${say(d)} mg a day of mycophenolic acid; the same amount as mycophenolate mofetil would be ${say(d / MMF_TO_MPA)} mg (1,000 mg per 739 mg).`,
    bandLabel: `${say(mpa)} mg a day as mycophenolic acid`,
    notes: ['The Myfortic label calls Myfortic 720 mg twice daily and mycophenolate mofetil 1,000 mg twice daily "near equimolar" (739 mg as mycophenolic acid), with similar mean exposure in its crossover trials.', 'Both labels say the two products should not be used interchangeably without physician supervision: their rates of absorption are not equivalent. The tool gives the content, not a new dose.', ...tail] };
}
