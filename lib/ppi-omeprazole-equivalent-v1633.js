// spec-v1633 tool 19: a proton-pump inhibitor dose in omeprazole equivalents.
//
// Source: Kirchheiner J, Glatt S, Fuhr U, et al. Relative potency of proton-pump inhibitors:
// comparison of effects on intragastric pH. Eur J Clin Pharmacol 2009;65(1):19-31 (PMID 18925391).
// The abstract was re-read on October 11, 2026; the full paper is not open and was not read.
//   "Based on the mean 24-h gastric pH, the relative potencies of the five PPIs compared to
//   omeprazole were 0.23, 0.90, 1.00, 1.60, and 1.82 for pantoprazole, lansoprazole, omeprazole,
//   esomeprazole, and rabeprazole, respectively."
//   "patients with GERD needed a 1.9-fold higher dose and Helicobacter pylori-positive individuals
//   needed only about 20% of the dose to achieve a given increase in mean 24-h intragastric pH."
//   "our estimates must be viewed with caution because only a limited dose range has been tested and
//   not exactly the same study conditions were applied for the different substances."
//
//   omeprazole equivalent (mg) = dose (mg) x relative potency
//   dose of another PPI (mg)   = omeprazole equivalent / that PPI's relative potency
//
// The paper gives no clinical bands and none are invented. Dexlansoprazole is not in the paper.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const PPIS = [
  { value: 'pantoprazole', text: 'Pantoprazole', potency: 0.23 },
  { value: 'lansoprazole', text: 'Lansoprazole', potency: 0.90 },
  { value: 'omeprazole', text: 'Omeprazole', potency: 1.00 },
  { value: 'esomeprazole', text: 'Esomeprazole', potency: 1.60 },
  { value: 'rabeprazole', text: 'Rabeprazole', potency: 1.82 },
];
const NOTE = 'A potency estimate from a meta-analysis of gastric pH studies, read from the paper\'s abstract. The authors say to view it with caution: only a limited dose range was tested, and study conditions differed between the drugs. It is not a dosing recommendation.';
const say = (x) => Number(x.toPrecision(4)).toLocaleString('en-US', { maximumFractionDigits: 2 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function ppiOmeprazoleEquivalent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ppi = PPIS.find((p) => p.value === String(o.ppi ?? '').trim());
  if (!ppi) return { valid: false, message: 'Choose the proton-pump inhibitor. The paper covers five; dexlansoprazole is not among them.' };
  const f = inputFault([['the daily dose', o.dailyDose, null, 1000, 'mg']]);
  if (f) return { valid: false, message: f };
  let target = null;
  if (!blank(o.target)) {
    target = PPIS.find((p) => p.value === String(o.target).trim());
    if (!target) return { valid: false, message: 'Choose the target proton-pump inhibitor from the list, or leave it blank.' };
    if (target === ppi) return { valid: false, message: 'The target is the same drug. Choose another, or leave it blank for the omeprazole equivalent alone.' };
  }
  const d = Number(o.dailyDose); const oe = d * ppi.potency;
  const notes = [`Relative potency against omeprazole, by mean 24-hour gastric pH: pantoprazole 0.23, lansoprazole 0.90, omeprazole 1.00, esomeprazole 1.60, rabeprazole 1.82 (Kirchheiner 2009).`,
    'The same analysis found patients with GERD needed a 1.9-fold higher dose than healthy volunteers, and Helicobacter pylori-positive individuals about 20% of the dose, for a given rise in gastric pH.',
    'The figure is not rounded to a marketed strength.'];
  const out = { valid: true, ppi: ppi.value, flag: 'equivalent', abnormal: false, omeprazoleEquivalentMg: Number(oe.toPrecision(4)), notes, note: NOTE };
  if (!target) return { ...out, band: `${say(d)} mg a day of ${ppi.value} × ${ppi.potency} = ${say(oe)} mg a day in omeprazole equivalents.`, bandLabel: `${say(oe)} mg omeprazole equivalents` };
  const t = oe / target.potency;
  return { ...out, target: target.value, targetDoseMg: Number(t.toPrecision(4)), band: `${say(d)} mg a day of ${ppi.value} × ${ppi.potency} = ${say(oe)} mg a day in omeprazole equivalents, which is ${say(t)} mg a day of ${target.value} (÷ ${target.potency}).`, bandLabel: `${say(t)} mg of ${target.value}` };
}
