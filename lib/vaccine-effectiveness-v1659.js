// spec-v1659 tool 5: vaccine efficacy or effectiveness from attack rates.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §6, "Vaccine
// efficacy or vaccine effectiveness" (archive.cdc.gov), read October 19, 2026: VE = (risk among the
// unvaccinated − risk among the vaccinated) ÷ risk among the unvaccinated, or 1 − risk ratio. Efficacy is
// the term for ideal (trial) conditions, effectiveness for field conditions. Example: varicella, Oregon
// 2002 (Table 3.13 in §5): 18 of 152 vaccinated, 3 of 7 unvaccinated, risk ratio 0.28, VE 72%.
// The interval is 1 minus the risk ratio's 95% interval from two-by-two-effect.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { twoByTwoEffect } from './two-by-two-effect-v1634.js';

const r1 = (n) => Math.round(n * 10) / 10;

export const TERMS = [
  { value: 'effectiveness', text: 'Effectiveness (field conditions)' },
  { value: 'efficacy', text: 'Efficacy (trial conditions)' },
];

export function vaccineEffectiveness(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the cases among the vaccinated', o.casesVaccinated, 0, 1e9, ''],
    ['the vaccinated persons', o.vaccinated, null, 1e10, ''],
    ['the cases among the unvaccinated', o.casesUnvaccinated, 0, 1e9, ''],
    ['the unvaccinated persons', o.unvaccinated, null, 1e10, ''],
  ]);
  if (f) return { valid: false, message: f };
  const [a, n1, c, n2] = [o.casesVaccinated, o.vaccinated, o.casesUnvaccinated, o.unvaccinated].map(Number);
  if (a > n1 || c > n2) return { valid: false, message: 'More cases than persons in a group. Check the counts.' };
  const word = o.term === 'efficacy' ? 'Vaccine efficacy' : 'Vaccine effectiveness';
  const arv = a / n1;
  const aru = c / n2;
  const rates = `Attack rate ${r1(arv * 100)}% vaccinated (${a} of ${n1}), ${r1(aru * 100)}% unvaccinated (${c} of ${n2}).`;
  if (c === 0) {
    return { valid: true, ve: null, abnormal: false, band: `No cases among the unvaccinated, so the ${word.toLowerCase()} is undefined. ${rates}`, bandLabel: 'Undefined', notes: [], note: 'CDC, Principles of Epidemiology, Lesson 3 §6.' };
  }
  const rr = arv / aru;
  const ve = (1 - rr) * 100;
  const notes = [rates];
  const e = twoByTwoEffect({ events1: a, total1: n1, events2: c, total2: n2 });
  if (e.valid && e.riskRatioCi) notes.push(`95% interval ${r1((1 - e.riskRatioCi[1]) * 100)}% to ${r1((1 - e.riskRatioCi[0]) * 100)}%, from the risk ratio's interval.`);
  if (o.term !== 'efficacy' && o.term !== 'effectiveness') notes.push('Choose efficacy (a trial) or effectiveness (field conditions); the arithmetic is the same.');
  return {
    valid: true, ve: r1(ve), riskRatio: Math.round(rr * 100) / 100, abnormal: false,
    band: `${word} ${r1(ve)}%: 1 − risk ratio ${Math.round(rr * 100) / 100}.`,
    bandLabel: `${r1(ve)}%`,
    notes,
    note: 'The proportionate reduction in disease among the vaccinated, as CDC\'s Principles of Epidemiology, Lesson 3 §6, defines it.',
  };
}
