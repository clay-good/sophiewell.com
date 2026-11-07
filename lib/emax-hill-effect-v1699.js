// spec-v1699 (drug-interaction-kinetics tool 9): the sigmoid Emax (Hill) model and its inverse.
// E = E0 + Emax C^n / (EC50^n + C^n); C = EC50 (dE / (Emax - dE))^(1/n), dE = E - E0. Every parameter is the
// reader's. Hill 1910 is cited for the equation's name only (not opened).
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

const sig = (x) => Number(x.toPrecision(4));
export const effectAt = (c, { e0, emax, ec50, n }) => e0 + (emax * c ** n) / (ec50 ** n + c ** n);

export function emaxHillEffect(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const e0 = measured(o.e0);
  const emax = measured(o.emax);
  const ec50 = measured(o.ec50);
  const n = measured(o.hill);
  if (e0 === null) return { valid: false, message: 'Enter the baseline effect E0 (0 if none).' };
  if (emax === null) return { valid: false, message: 'Enter Emax (negative for an inhibitory effect).' };
  if (emax === 0) return { valid: false, message: 'Emax cannot be 0: the curve would be flat.' };
  if (ec50 === null || !(ec50 > 0)) return { valid: false, message: 'Enter EC50, above 0.' };
  if (n === null || !(n > 0)) return { valid: false, message: 'Enter the Hill coefficient n, above 0 (1 is the plain Emax model).' };
  const c = measured(o.concentration);
  const target = measured(o.targetEffect);
  if (c !== null && target !== null) return { valid: false, message: 'Enter a concentration or a target effect, not both.' };
  if (c === null && target === null) return { valid: false, message: 'Enter a concentration to get its effect, or a target effect to get the concentration.' };
  const p = { e0, emax, ec50, n };
  const points = [0.1, 1, 10].map((m) => [m, m * ec50, effectAt(m * ec50, p)]);
  if (!points.every(([, x, y]) => Number.isFinite(x) && Number.isFinite(y))) return { valid: false, message: 'These parameters are outside the range this curve can be computed over; check EC50 and n.' };
  const table = points.map(([m, x, y]) => `At ${m} x EC50 (${sig(x)}): effect ${sig(y)}.`);
  const curve = Array.from({ length: 41 }, (_, i) => { const c = ec50 * 10 ** (-2 + i / 10); return { c: sig(c), effect: sig(effectAt(c, p)) }; });
  if (c !== null) {
    if (c < 0) return { valid: false, message: 'The concentration cannot be negative.' };
    const e = effectAt(c, p);
    if (!Number.isFinite(e)) return { valid: false, message: 'These inputs give no finite effect.' };
    return {
      valid: true, effect: sig(e), curve, abnormal: false,
      band: `Effect ${sig(e)} at concentration ${c}.`, bandLabel: String(sig(e)),
      notes: [`E = E0 + Emax C^n / (EC50^n + C^n) = ${e0} + ${emax} x ${c}^${n} / (${ec50}^${n} + ${c}^${n}) = ${sig(e)}; ${sig((100 * (e - e0)) / emax)}% of Emax.`, ...table],
      note: 'The model and its parameters are the reader\'s; the curve says nothing outside the range of concentrations it was fitted to.',
    };
  }
  const dE = target - e0;
  const lo = Math.min(0, emax);
  const hi = Math.max(0, emax);
  if (!(dE > lo && dE < hi)) return { valid: false, message: `A target effect must lie strictly between E0 (${e0}) and E0 + Emax (${e0 + emax}); the curve approaches both ends and never reaches them.` };
  const conc = ec50 * (dE / (emax - dE)) ** (1 / n);
  if (!Number.isFinite(conc)) return { valid: false, message: 'These inputs give no finite concentration.' };
  return {
    valid: true, concentration: sig(conc), curve, abnormal: false,
    band: `Concentration ${sig(conc)} for effect ${target}.`, bandLabel: String(sig(conc)),
    notes: [`C = EC50 (dE / (Emax - dE))^(1/n), dE = ${target} - ${e0} = ${dE}: ${ec50} x (${dE} / ${emax - dE})^(1/${n}) = ${sig(conc)}.`, ...table],
    note: 'The concentration is in the unit EC50 was entered in.',
  };
}
