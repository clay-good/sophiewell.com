// spec-v1659 tool 4: attributable proportion among the exposed.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §6, "Attributable
// proportion" (archive.cdc.gov), read October 19, 2026: (risk for exposed − risk for unexposed) ÷ risk for
// exposed × 100%, the same for rates; it assumes a single causal factor. Example: lung cancer mortality
// 0.57 per 1,000 per year among smokers of 1-14 cigarettes a day, 0.07 among nonsmokers: 87.7%.
// Population attributable fraction, when the share of the population exposed is entered: Levin's formula,
//   PAF = Pe (RR − 1) ÷ [Pe (RR − 1) + 1],
// as stated in Khosravi et al., Glob Epidemiol 2021 (PMC10445975), Eq. (3), and Ferguson et al., Eur J
// Epidemiol 2024 (PMC10904572), Eq. (2), both read October 20, 2026. Both say it holds only without
// confounding; with an adjusted risk ratio Miettinen's case-based formula applies instead (not computed).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r1 = (n) => Math.round(n * 10) / 10;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const LEVIN_NOTE = 'Levin\'s formula assumes the risk ratio is unconfounded, as with crude risks from one population. With a risk ratio adjusted for confounders, Miettinen\'s formula, which uses the share of cases exposed, applies instead.';

export function attributableProportion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the risk or rate among the exposed', o.exposed, null, 1e9, ''],
    ['the risk or rate among the unexposed', o.unexposed, 0, 1e9, ''],
  ]);
  if (f) return { valid: false, message: f };
  const g = blank(o.prevalence) ? null : inputFault([['the share of the population exposed', o.prevalence, 0, 100, '%']]);
  if (g) return { valid: false, message: g };
  const pe = blank(o.prevalence) ? null : Number(o.prevalence);
  const e = Number(o.exposed);
  const u = Number(o.unexposed);
  const rr = u === 0 ? null : e / u;
  if (e < u) {
    return {
      valid: true, attributable: null, populationFraction: null, preventive: r1((1 - e / u) * 100), abnormal: false,
      band: `The exposed have the lower risk (risk ratio ${rr === null ? '—' : Math.round(rr * 100) / 100}), so there is no attributable proportion. The preventive fraction, 1 − risk ratio, is ${r1((1 - e / u) * 100)}%.`,
      bandLabel: 'Lower risk among the exposed',
      notes: ['An attributable proportion assumes the exposure raises risk.', ...(pe === null ? [] : ['No population attributable fraction either: Levin\'s formula is for an exposure that raises risk.'])],
      note: 'CDC, Principles of Epidemiology, Lesson 3 §6.',
    };
  }
  const ap = ((e - u) / e) * 100;
  const notes = [`If the exposure causes the outcome and the groups are otherwise alike, about ${r1(ap)}% of the outcome among the exposed is attributable to it.`];
  let paf = null;
  if (pe === null) notes.push('This is the proportion among the exposed, not in the whole population; enter the share of the population exposed for the population attributable fraction.');
  else if (rr === null) notes.push('No population attributable fraction: the unexposed risk is 0, so there is no risk ratio for Levin\'s formula.');
  else {
    const x = (pe / 100) * (rr - 1);
    paf = (x / (x + 1)) * 100;
    notes.push(`Population attributable fraction (Levin): ${pe}% exposed × (risk ratio ${Math.round(rr * 100) / 100} − 1) = ${Math.round(x * 1000) / 1000}; ÷ (that + 1) = ${r1(paf)}% of the outcome in the whole population.`, LEVIN_NOTE);
  }
  return {
    valid: true, attributable: r1(ap), riskRatio: rr === null ? null : Math.round(rr * 100) / 100, populationFraction: paf === null ? null : r1(paf), abnormal: false,
    band: `Attributable proportion among the exposed: ${r1(ap)}% ((${e} − ${u}) ÷ ${e}).${rr === null ? '' : ` Risk ratio ${Math.round(rr * 100) / 100}.`}${paf === null ? '' : ` Population attributable fraction ${r1(paf)}%.`}`,
    bandLabel: `${r1(ap)}%`,
    notes,
    note: 'CDC, Principles of Epidemiology, Lesson 3 §6. It assumes a single risk factor; with interacting factors the measure may not apply.',
  };
}
