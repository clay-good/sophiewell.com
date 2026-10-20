// spec-v1662: T-MACS (Troponin-only Manchester Acute Coronary Syndromes) probability of ACS.
//
// The derivation (Body R et al., Emerg Med J 2017;34:517-523) is not open access. Under the owner's reprint rule
// (2026-10-17) the model was read in two independent open papers on October 20, 2026, which print the same
// equation:
//   Diagn Progn Res 2021 (PMC8499458), Equation 1, and the PRESTO-era validation protocol in
//   BMJ Open 2019 (PMC6731951): probability = 1 / (1 + e^-(1.713E + 0.847A + 0.607R + 1.417V + 2.058S + 1.208H +
//   0.089T - 4.766)), E ECG ischaemia, A worsening or crescendo angina, R pain radiating to the right arm or
//   shoulder, V pain with vomiting, S sweating observed, H hypotension (systolic below 100 mm Hg), T high-
//   sensitivity troponin T on arrival in ng/L.
//   Risk groups, from the PRESTO protocol (BMJ Open 2019, PMC6830682): very low below 2% ("ACS can be considered
//   ruled out"), low 2% to 5%, moderate 5% to 95%, high 95% or more ("ruled in"); the 2025 comparison in Medicine
//   (PMC11813012) tabulates the same groups as <2%, 2-4%, 5-94% and >=95.
// Every item must be answered: the score only adds, so a blank would understate the probability.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const ITEMS = [
  ['ecg', 'ECG ischaemia', 1.713],
  ['angina', 'Worsening or crescendo angina', 0.847],
  ['rightArm', 'Pain radiating to the right arm or shoulder', 0.607],
  ['vomiting', 'Pain associated with vomiting', 1.417],
  ['sweating', 'Sweating observed', 2.058],
  ['hypotension', 'Hypotension (systolic below 100 mm Hg)', 1.208],
];
const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);

// The fewest decimals (one or more) at which the shown value still falls on the same side of the cut-off as
// the unrounded one, so a printed number never contradicts the category beside it.
const agree = (x, test, from = 1) => {
  for (let dp = from; dp <= 6; dp += 1) {
    const v = Math.round(x * 10 ** dp) / 10 ** dp;
    if (test(v) === test(x)) return v;
  }
  return x;
};

export function tMacs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the high-sensitivity troponin T on arrival', o.troponinT, 0, 100000, 'ng/L']]);
  if (f) return { valid: false, message: f };
  let lp = -4.766 + 0.089 * Number(o.troponinT);
  const present = [];
  for (const [key, label, beta] of ITEMS) {
    if (o[key] !== 'yes' && o[key] !== 'no') return { valid: false, message: `Choose yes or no for ${lc(label)}. Every item is needed: a blank would understate the probability.` };
    if (o[key] === 'yes') { lp += beta; present.push(label); }
  }
  const p = 1 / (1 + Math.exp(-lp));
  const pct = p * 100;
  const group = pct < 2 ? 'Very low risk' : pct < 5 ? 'Low risk' : pct < 95 ? 'Moderate risk' : 'High risk';
  const meaning = {
    'Very low risk': 'below 2%, the group in which the authors\' protocol says ACS can be considered ruled out',
    'Low risk': '2% to 5%, the group in which the protocol calls for serial troponin sampling',
    'Moderate risk': '5% to 95%, the group in which the protocol calls for serial troponin and possibly further imaging',
    'High risk': '95% or more, the group in which the protocol considers ACS ruled in',
  }[group];
  const groupOf = (v) => (v < 2 ? 0 : v < 5 ? 1 : v < 95 ? 2 : 3);
  const shown = pct < 0.1 ? '<0.1' : pct > 99.9 ? '>99.9' : String(agree(pct, groupOf));
  return {
    valid: true, probability: Math.round(p * 10000) / 10000, group, abnormal: pct >= 5,
    band: `T-MACS probability of ACS ${shown}%: ${group.toLowerCase()}, ${meaning}.`,
    bandLabel: `${shown}% (${group})`,
    notes: [present.length ? `Present: ${present.join('; ')}.` : 'None of the six clinical items is present.', `Troponin T ${o.troponinT} ng/L contributes 0.089 per ng/L.`],
    note: 'For high-sensitivity troponin T (ng/L) on arrival, the assay the model was built on. The groups describe a decision aid; the clinician decides.',
  };
}
