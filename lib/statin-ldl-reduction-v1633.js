// spec-v1633 tool 21: statin dose and mean LDL-C change, from the comparative trial table on the Crestor label.
//
// One label row (spec-v1628 section 1): Crestor (rosuvastatin; AstraZeneca, DailyMed version 19),
// section 14 (Clinical Studies), Table 11, re-read on October 11, 2026: "Percent Change in LDL-C by
// Dose of CRESTOR, Atorvastatin, Simvastatin, and Pravastatin From Baseline to Week 6 (LS Mean)", a
// "multicenter, open-label, dose-ranging study of 2,240 patients with hypercholesterolemia or mixed
// dyslipidemia", sample sizes 156 to 167 per group, standard errors about 1.00, mean baseline LDL-C
// 189 mg/dL:
//   Crestor       10 mg -46   20 mg -52   40 mg -55
//   Atorvastatin  10 mg -37   20 mg -43   40 mg -48   80 mg -51
//   Simvastatin   10 mg -28   20 mg -35   40 mg -39   80 mg -46
//   Pravastatin   10 mg -20   20 mg -24   40 mg -30
//
//   projected LDL-C = baseline x (1 + mean change / 100)
//
// These are one trial's group means, not a prediction for a patient. Rosuvastatin 5 mg is in a
// different table (a different study) and is not here. No intensity category (high, moderate, low) is
// reported: that needs a current guideline table, which was not read.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { brand: 'Crestor', setId: '325a5d0e-9a72-4015-9fcd-1655fb504cee' };
export const TABLE = {
  rosuvastatin: { 10: -46, 20: -52, 40: -55 },
  atorvastatin: { 10: -37, 20: -43, 40: -48, 80: -51 },
  simvastatin: { 10: -28, 20: -35, 40: -39, 80: -46 },
  pravastatin: { 10: -20, 20: -24, 40: -30 },
};
export const STATINS = Object.keys(TABLE).map((s) => ({ value: s, text: s[0].toUpperCase() + s.slice(1) }));
const NOTE = 'These are group means from one 6-week comparative trial printed on the Crestor label (about 160 patients per group, mean baseline LDL-C 189 mg/dL). An individual response varies. This reports the table; it does not choose a statin or a dose.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function statinLdlReduction(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const statin = String(o.statin ?? '').trim();
  if (!TABLE[statin]) return { valid: false, message: 'Choose the statin. The table covers rosuvastatin, atorvastatin, simvastatin and pravastatin.' };
  const f = inputFault([['the daily dose', o.dose, null, 200, 'mg']]);
  if (f) return { valid: false, message: f };
  let baseline = null;
  if (!blank(o.baselineLdl)) {
    const bf = inputFault([['the baseline LDL-C', o.baselineLdl, 20, 700, 'mg/dL']]);
    if (bf) return { valid: false, message: bf };
    baseline = Number(o.baselineLdl);
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: 'The Crestor label\'s trial table is withheld, so nothing is reported.', bandLabel: 'Withheld', notes: [`The label rows are withheld: ${lr.why}.`, 'Read the table from the label in hand.'], note: NOTE };
  const d = Number(o.dose); const doses = Object.keys(TABLE[statin]).map(Number);
  const base = { valid: true, statin, dose: d, labelUrl: lr.url, note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  if (!doses.includes(d)) {
    const five = statin === 'rosuvastatin' && d === 5 ? ' Rosuvastatin 5 mg is in a different table on the label, from a different study, and is not combined with this one.' : '';
    return { ...base, flag: 'not-in-table', abnormal: true, band: `${d} mg of ${statin} is not a dose in the trial table. Its ${statin} doses are ${doses.join(', ')} mg.${five}`, bandLabel: 'Not in the table', notes: tail };
  }
  const change = TABLE[statin][d];
  // For each other statin, the dose whose trial mean is nearest this one.
  const nearest = Object.entries(TABLE).filter(([s]) => s !== statin).map(([s, row]) => {
    const [dose, c] = Object.entries(row).map(([k, v]) => [Number(k), v]).sort((a, b) => Math.abs(a[1] - change) - Math.abs(b[1] - change) || a[0] - b[0])[0];
    return { statin: s, dose, change: c };
  });
  const notes = [`Nearest trial means among the other three: ${nearest.map((n) => `${n.statin} ${n.dose} mg (${n.change}%)`).join(', ')}. "Nearest" is the closest number in the table, not an equivalent dose.`,
    'No intensity category (high, moderate or low) is given: that is a guideline classification, and a current guideline table was not read.'];
  const out = { ...base, flag: 'trial-mean', abnormal: false, meanChangePercent: change, nearest };
  if (baseline === null) return { ...out, band: `In the trial table on the Crestor label, ${statin} ${d} mg a day had a mean LDL-C change of ${change}% at 6 weeks.`, bandLabel: `${change}% mean LDL-C change`, notes: [...notes, ...tail] };
  const projected = baseline * (1 + change / 100);
  return { ...out, baselineLdl: baseline, projectedLdl: Number(projected.toFixed(1)), band: `In the trial table on the Crestor label, ${statin} ${d} mg a day had a mean LDL-C change of ${change}% at 6 weeks. Applied to a baseline of ${baseline} mg/dL, that is ${Number(projected.toFixed(1))} mg/dL.`, bandLabel: `${change}%, to ${Number(projected.toFixed(1))} mg/dL`, notes: ['The projection applies a trial mean to one baseline; it is arithmetic, not a forecast for this patient.', ...notes, ...tail] };
}
