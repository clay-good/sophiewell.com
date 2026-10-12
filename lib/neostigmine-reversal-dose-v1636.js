// spec-v1636 tool 8: neostigmine reversal dose, as the BLOXIVERZ label states it.
//
// Source: BLOXIVERZ (neostigmine methylsulfate) label, Exela, DailyMed set id d2f55643-..., version 18,
// re-read October 11, 2026, section 2.2:
//   "There must be a twitch response to the first stimulus in the TOF of at least 10% of its baseline
//    level ... prior to the administration of BLOXIVERZ."
//   "The 0.03 mg/kg dose is recommended for: 1. Reversal of NMBAs with shorter half-lives, e.g.,
//    rocuronium, or 2. When the first twitch response to the TOF stimulus is substantially greater
//    than 10% of baseline or when a second twitch is present."
//   "The 0.07 mg/kg dose is recommended for 1. NMBAs with longer half-lives, e.g., vecuronium and
//    pancuronium, or 2. When the first twitch response is relatively weak, i.e., not substantially
//    greater than 10% of baseline or 3. There is need for more rapid recovery."
//   "The recommended maximum total dose is 0.07 mg/kg or up to a total of 5 mg, whichever is less."
//   "injected slowly by intravenous route over a period of at least 1 minute."
//   2.4: "An anticholinergic agent, e.g., atropine sulfate or glycopyrrolate, should be administered
//    prior to or concomitantly with BLOXIVERZ ... using a separate syringe. In the presence of
//    bradycardia, it is recommended that the anticholinergic agent be administered prior".
//   3: 0.5 mg/mL and 1 mg/mL.
//
// The two dose rows are joined by "or", so the half-life and the twitch response can point to
// different rows (rocuronium with a weak first twitch). The label does not say which governs: both
// rows are shown and none is chosen.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'BLOXIVERZ', setId: 'd2f55643-2b0d-4ef9-a9d8-b7138b314372' };
export const TWITCH = [
  { value: 'first-twitch-well-above-10-percent', text: 'First twitch substantially above 10% of baseline, or a second twitch present', row: 0.03 },
  { value: 'first-twitch-near-10-percent', text: 'First twitch relatively weak: not substantially above 10% of baseline', row: 0.07 },
  { value: 'first-twitch-under-10-percent', text: 'First twitch under 10% of baseline, or no twitch', row: null },
];
export const HALF_LIFE = [
  { value: 'shorter-acting-blocker', text: 'Shorter half-life blocker (for example rocuronium)', row: 0.03 },
  { value: 'longer-acting-blocker', text: 'Longer half-life blocker (for example vecuronium, pancuronium)', row: 0.07 },
];
export const CONCENTRATIONS = [
  { value: '0.5-mg-ml', text: '0.5 mg/mL', mgMl: 0.5 },
  { value: '1-mg-ml', text: '1 mg/mL', mgMl: 1 },
];
const NOTE = 'The label\'s dose row for the entries made, with its maximum applied. Reversal is judged by train-of-four monitoring and clinical assessment, which this does not replace, and it does not choose between the two rows when they differ.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
const LINES = ['Label: an anticholinergic (atropine or glycopyrrolate) is given before or with neostigmine, intravenously in a separate syringe; before it when there is bradycardia.', 'Label: inject slowly, intravenously, over at least 1 minute.'];

export function neostigmineReversalDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
  if (f) return { valid: false, message: f };
  const twitch = TWITCH.find((x) => x.value === String(o.twitch ?? '').trim());
  if (!twitch) return { valid: false, message: 'Choose the train-of-four response: the label sets the dose by it, and requires a first twitch of at least 10% of baseline before any dose.' };
  const half = HALF_LIFE.find((x) => x.value === String(o.halfLife ?? '').trim());
  if (!half) return { valid: false, message: 'Choose the half-life class of the neuromuscular blocker being reversed.' };
  const conc = CONCENTRATIONS.find((x) => x.value === String(o.concentration ?? '').trim());
  if (!conc) return { valid: false, message: 'Choose the concentration in hand: 0.5 mg/mL or 1 mg/mL.' };
  let prior = null;
  if (!blank(o.priorDose)) {
    const pf = inputFault([['the neostigmine already given', o.priorDose, 0, 10, 'mg']]);
    if (pf) return { valid: false, message: pf };
    prior = Number(o.priorDose);
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The BLOXIVERZ label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [...LINES, `Label: ${lr.edition}.`];
  if (twitch.row === null) return { valid: true, flag: 'no-dose-under-10-percent', abnormal: true, labelUrl: lr.url, band: 'The label requires a first-twitch response of at least 10% of baseline before neostigmine is given. No dose is shown.', bandLabel: 'No dose yet', notes: tail, note: NOTE };

  const kg = Number(o.weight);
  const cap = Math.min(0.07 * kg, 5);
  const capText = `Maximum total: 0.07 mg/kg or 5 mg, whichever is less; at ${kg} kg that is ${n2(cap)} mg.`;
  const line = (perKg) => {
    const raw = perKg * kg; const dose = Math.min(raw, cap);
    return { perKg, dose, text: `${perKg} mg/kg × ${kg} kg = ${n2(raw)} mg${raw > cap + 1e-9 ? `, held to the maximum of ${n2(cap)} mg` : ''}: ${n2(dose / conc.mgMl)} mL of ${conc.text}.` };
  };
  const notes = [];
  let flag; let band; let label; let abnormal = false; let doseMg = null;
  if (twitch.row === half.row) {
    const d = line(twitch.row); doseMg = d.dose; flag = twitch.row === 0.03 ? 'dose-0.03-mg-kg' : 'dose-0.07-mg-kg';
    band = `Neostigmine ${n2(d.dose)} mg (${d.perKg} mg/kg), ${n2(d.dose / conc.mgMl)} mL of ${conc.text}: both the half-life and the twitch response point to the label's ${d.perKg} mg/kg row.`;
    label = `${n2(d.dose)} mg`; notes.push(d.text);
  } else {
    const a = line(0.07); const b = line(0.03);
    flag = 'rows-differ'; abnormal = true; label = 'Two rows shown';
    band = `The label's two rows point different ways: the ${half.text.split(' (')[0].toLowerCase()} is in its ${half.row} mg/kg row, and the twitch response in its ${twitch.row} mg/kg row. It joins the criteria with "or" and does not say which governs; both doses are shown, the larger first.`;
    notes.push(a.text, b.text, 'The label also puts a need for more rapid recovery in the 0.07 mg/kg row.');
  }
  notes.push(capText);
  if (prior !== null) {
    const left = cap - prior;
    notes.push(left <= 1e-9 ? `${n2(prior)} mg already given is at or past the maximum total of ${n2(cap)} mg: nothing remains under it.` : `${n2(prior)} mg already given leaves ${n2(left)} mg under the maximum total.`);
    if (left <= 1e-9 || (doseMg !== null && doseMg > left + 1e-9)) { abnormal = true; flag = 'past-maximum-with-prior-dose'; band = `With ${n2(prior)} mg already given, ${left <= 1e-9 ? 'nothing remains' : `only ${n2(left)} mg remains`} under the label's maximum total of ${n2(cap)} mg. ${band}`; }
  }
  notes.push(...tail);
  return { valid: true, flag, abnormal, labelUrl: lr.url, doseMg: doseMg === null ? null : Number(doseMg.toFixed(3)), maximumMg: Number(cap.toFixed(3)), band, bandLabel: label, notes, note: NOTE };
}
