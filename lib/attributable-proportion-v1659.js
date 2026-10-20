// spec-v1659 tool 4: attributable proportion among the exposed.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §6, "Attributable
// proportion" (archive.cdc.gov), read October 19, 2026: (risk for exposed − risk for unexposed) ÷ risk for
// exposed × 100%, the same for rates; it assumes a single causal factor. Example: lung cancer mortality
// 0.57 per 1,000 per year among smokers of 1-14 cigarettes a day, 0.07 among nonsmokers: 87.7%.
// The population attributable fraction (Levin) is not computed: no source stating it was read.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r1 = (n) => Math.round(n * 10) / 10;

export function attributableProportion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the risk or rate among the exposed', o.exposed, null, 1e9, ''],
    ['the risk or rate among the unexposed', o.unexposed, 0, 1e9, ''],
  ]);
  if (f) return { valid: false, message: f };
  const e = Number(o.exposed);
  const u = Number(o.unexposed);
  const rr = u === 0 ? null : e / u;
  if (e < u) {
    return {
      valid: true, attributable: null, preventive: r1((1 - e / u) * 100), abnormal: false,
      band: `The exposed have the lower risk (risk ratio ${rr === null ? '—' : Math.round(rr * 100) / 100}), so there is no attributable proportion. The preventive fraction, 1 − risk ratio, is ${r1((1 - e / u) * 100)}%.`,
      bandLabel: 'Lower risk among the exposed',
      notes: ['An attributable proportion assumes the exposure raises risk.'],
      note: 'CDC, Principles of Epidemiology, Lesson 3 §6.',
    };
  }
  const ap = ((e - u) / e) * 100;
  return {
    valid: true, attributable: r1(ap), riskRatio: rr === null ? null : Math.round(rr * 100) / 100, abnormal: false,
    band: `Attributable proportion among the exposed: ${r1(ap)}% ((${e} − ${u}) ÷ ${e}).${rr === null ? '' : ` Risk ratio ${Math.round(rr * 100) / 100}.`}`,
    bandLabel: `${r1(ap)}%`,
    notes: [
      `If the exposure causes the outcome and the groups are otherwise alike, about ${r1(ap)}% of the outcome among the exposed is attributable to it.`,
      'This is the proportion among the exposed, not in the whole population; the population fraction also needs how common the exposure is.',
    ],
    note: 'CDC, Principles of Epidemiology, Lesson 3 §6. It assumes a single risk factor; with interacting factors the measure may not apply.',
  };
}
