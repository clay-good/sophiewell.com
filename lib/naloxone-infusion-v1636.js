// spec-v1636 backfill 4: a naloxone infusion rate from the bolus that produced reversal.
//
// Sources, re-read October 12, 2026:
//   Goldfrank L, Weisman RS, Errick JK, Lo MW. A dosing nomogram for continuous infusion
//     intravenous naloxone. Ann Emerg Med. 1986;15(5):566-570 (PMID 3963538), abstract: "A computer
//     simulation ... found that a continuous infusion of two-thirds of the bolus dose that resulted
//     in reversal each hour will maintain the plasma naloxone levels equal to or greater than the
//     naloxone levels that would have existed 30 minutes following the bolus dose." A simulation
//     from ten volunteers; the paper's full text was not read.
//   Naloxone Hydrochloride Injection, Hospira (set 8535cc84-..., version 35): "The addition of 2 mg
//     of naloxone hydrochloride in 500 mL of either solution provides a concentration of
//     0.004 mg/mL. Mixtures should be used within 24 hours. ... The rate of administration should
//     be titrated in accordance with the patient's response."
//
// The mL/hour is shown at the label's 0.004 mg/mL and, when entered, at the reader's own
// concentration. The label gives a dilution, not a rate; the rate is Goldfrank's.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Naloxone Hydrochloride Injection (Hospira)', setId: '8535cc84-ad4a-4d67-8480-fb5a2e3406f8' };
const LABEL_MG_PER_ML = 0.004;
const r2 = (n) => Math.round(n * 100) / 100;
const r0 = (n) => Math.round(n);
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function naloxoneInfusion(input, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([['the bolus dose that produced reversal', o.bolusMg, 0.02, 20, 'mg']]);
  if (fault) return { valid: false, message: fault };
  const own = o.concentration === undefined || o.concentration === null || String(o.concentration).trim() === '' ? null : o.concentration;
  if (own !== null) {
    const cf = inputFault([['the bag concentration', own, 0.001, 1, 'mg/mL']]);
    if (cf) return { valid: false, message: cf };
  }
  const bolus = Number(o.bolusMg);
  // The rate is worked out from the unrounded mg/hour; only the shown values are rounded.
  const rawMgPerHour = bolus * 2 / 3;
  const mgPerHour = Number(rawMgPerHour.toPrecision(3));
  const notes = [`Two-thirds of a ${fmt(bolus)} mg bolus each hour is ${fmt(mgPerHour)} mg/hour (Goldfrank 1986: a computer simulation from ten volunteers, which found this rate keeps the plasma level at or above the level 30 minutes after the bolus).`];
  const out = { valid: true, flag: 'rate', mgPerHour, bandLabel: 'Infusion rate', band: `Naloxone infusion ${fmt(mgPerHour)} mg/hour.` };
  if (own !== null) {
    out.mlPerHour = r2(rawMgPerHour / Number(own));
    notes.push(`At the entered ${fmt(Number(own))} mg/mL that is ${fmt(out.mlPerHour)} mL/hour.`);
  }
  const row = labelRow(LABEL.setId, now, table);
  if (row.answers) {
    out.labelMlPerHour = r0(rawMgPerHour / LABEL_MG_PER_ML);
    notes.push(`The naloxone label's dilution is 2 mg in 500 mL of 0.9% sodium chloride or 5% dextrose (0.004 mg/mL), used within 24 hours; at that concentration ${fmt(mgPerHour)} mg/hour is ${fmt(out.labelMlPerHour)} mL/hour. The label gives no infusion rate: it says to titrate to the patient's response.`);
  } else notes.push(`The label's dilution is not shown. ${row.why}`);
  notes.push('This is the published arithmetic, not an order.');
  return { ...out, notes, note: notes.join(' ') };
}
