// spec-v1700 (drug-interaction-kinetics tool 5): the size of a CYP3A4 interaction from the substrate's contribution
// ratio (CR) and the precipitant's inhibition ratio (IR) or increase in clearance (IC), Ohno's method:
//   inhibition: AUC ratio = 1 / (1 - CR x IR)   (Ohno 2007, the authors' abstract; Tod 2014 Eq. 1)
//   induction:  AUC ratio = 1 / (1 + CR x IC)   (Ohno 2008, the authors' abstract)
//   back-calculation: CR = (R - 1) / (R x IR); IR = (R - 1) / (R x CR)   (Tod 2014 Eq. 2 and 3)
// Ohno 2007's abstract: predictions within 67-150% of the observed increase for 83% of 50 studies, and within
// 50-200% for 95%. CYP3A4 only, as the papers are. Every CR, IR and IC is the reader's.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';
import { ddiStrengthClassify } from './ddi-strength-classify-v1699.js';

export const MODE_OPTIONS = [
  { value: 'inhibition', text: 'Predict an inhibition (CR and IR)' },
  { value: 'induction', text: 'Predict an induction (CR and IC)' },
  { value: 'solve-cr', text: 'Find the substrate\'s CR from an observed ratio and the inhibitor\'s IR' },
  { value: 'solve-ir', text: 'Find the inhibitor\'s IR from an observed ratio and the substrate\'s CR' },
];
const sig = (x) => Number(x.toPrecision(4));
const VALIDATION = 'Ohno 2007 (abstract): predictions were within 67-150% of the observed increase for 50 studies (83%) and within 50-200% for 57 studies (95%).';

function frac(label, raw) {
  const v = measured(raw);
  if (v === null) return { message: `Enter ${label}, from 0 to 1.` };
  if (v < 0 || v > 1) return { message: `Enter ${label} from 0 to 1.` };
  return { value: v };
}

export function ddiCrIrPredict(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODE_OPTIONS.some((m) => m.value === mode)) return { valid: false, message: 'Choose what to compute: an inhibition, an induction, or CR or IR from an observed ratio.' };
  const dose = String(o.irDose ?? '').trim().slice(0, 120);
  const doseNote = dose ? `IR applies to the inhibitor at ${dose}.` : 'IR depends on the inhibitor\'s dose (Tod 2014); state the dose it was measured at.';
  if (mode === 'inhibition' || mode === 'induction') {
    const cr = frac('CR, the substrate\'s contribution ratio for CYP3A4', o.cr);
    if (cr.message) return { valid: false, message: cr.message };
    let ratio;
    const notes = [];
    if (mode === 'inhibition') {
      const ir = frac('IR, the inhibitor\'s inhibition ratio for CYP3A4', o.ir);
      if (ir.message) return { valid: false, message: ir.message };
      if (cr.value * ir.value >= 1) return { valid: false, message: 'CR x IR of 1 predicts an infinite increase; the method has no answer at its limit.' };
      ratio = 1 / (1 - cr.value * ir.value);
      notes.push(`AUC ratio = 1 / (1 - CR x IR) = 1 / (1 - ${cr.value} x ${ir.value}) = ${sig(ratio)}.`, doseNote);
    } else {
      const ic = measured(o.ic);
      if (ic === null || ic < 0) return { valid: false, message: 'Enter IC, the inducer\'s apparent increase in clearance, 0 or more.' };
      ratio = 1 / (1 + cr.value * ic);
      notes.push(`AUC ratio = 1 / (1 + CR x IC) = 1 / (1 + ${cr.value} x ${ic}) = ${sig(ratio)} (a ${sig((1 - ratio) * 100)}% decrease).`);
    }
    if (!Number.isFinite(ratio)) return { valid: false, message: 'These inputs give no finite ratio.' };
    const cls = ddiStrengthClassify({ role: 'precipitant', ratio });
    if (cls.valid) notes.push(`If the substrate were a sensitive index substrate, that ratio would fall in FDA's ${cls.cls.toLowerCase()} class.`);
    return {
      valid: true, ratio: sig(ratio), abnormal: false,
      band: `Predicted AUC ratio ${sig(ratio)}.`, bandLabel: String(sig(ratio)),
      notes: [...notes, VALIDATION],
      note: 'CYP3A4 only. CR and IR come from clinical studies of other drugs; the prediction is as good as they are.',
    };
  }
  const r = measured(o.observedRatio);
  if (r === null || !(r > 1)) return { valid: false, message: 'Enter the observed AUC ratio with the strong inhibitor, above 1.' };
  if (mode === 'solve-cr') {
    const ir = frac('the inhibitor\'s IR', o.ir);
    if (ir.message) return { valid: false, message: ir.message };
    if (ir.value === 0) return { valid: false, message: 'An IR of 0 inhibits nothing, so it cannot explain an increase.' };
    const cr = (r - 1) / (r * ir.value);
    if (cr > 1) return { valid: false, message: `These give CR ${sig(cr)}, above 1: an inhibitor with IR ${ir.value} cannot raise exposure ${r}-fold. Check the ratio and IR.` };
    return { valid: true, cr: sig(cr), abnormal: false, band: `Substrate CR ${sig(cr)}.`, bandLabel: `CR ${sig(cr)}`, notes: [`CR = (R - 1) / (R x IR) = (${r} - 1) / (${r} x ${ir.value}) = ${sig(cr)} (Tod 2014 Eq. 2).`, doseNote, VALIDATION], note: 'CYP3A4 only.' };
  }
  const cr = frac('the substrate\'s CR', o.cr);
  if (cr.message) return { valid: false, message: cr.message };
  if (cr.value === 0) return { valid: false, message: 'A CR of 0 means the enzyme plays no part, so no IR can be found.' };
  const ir = (r - 1) / (r * cr.value);
  if (ir > 1) return { valid: false, message: `These give IR ${sig(ir)}, above 1: a substrate with CR ${cr.value} cannot rise ${r}-fold. Check the ratio and CR.` };
  return { valid: true, ir: sig(ir), abnormal: false, band: `Inhibitor IR ${sig(ir)}.`, bandLabel: `IR ${sig(ir)}`, notes: [`IR = (R - 1) / (R x CR) = (${r} - 1) / (${r} x ${cr.value}) = ${sig(ir)} (Tod 2014 Eq. 3).`, doseNote, VALIDATION], note: 'CYP3A4 only.' };
}
