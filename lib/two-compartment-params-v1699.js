// spec-v1699 (drug-interaction-kinetics tool 8): two-compartment parameters from the reader's own biexponential
// fit after an IV bolus, C(t) = A e^(-alpha t) + B e^(-beta t). Standard identities of the two-compartment model:
// k21 = (A beta + B alpha) / (A + B); k10 = alpha beta / k21; k12 = alpha + beta - k21 - k10; Vc = Dose / (A + B);
// AUC = A/alpha + B/beta; CL = Dose / AUC; Vss = Vc (1 + k12/k21); Vbeta = CL / beta.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

const sig = (x) => Number(x.toPrecision(4));

export function twoCompartmentParams(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const v = {};
  for (const [k, label] of [['dose', 'the IV bolus dose'], ['a', 'A'], ['alpha', 'alpha'], ['b', 'B'], ['beta', 'beta']]) {
    v[k] = measured(o[k]);
    if (v[k] === null) return { valid: false, message: `Enter ${label}.` };
    if (!(v[k] > 0)) return { valid: false, message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be above 0.` };
  }
  const { dose, a, alpha, b, beta } = v;
  if (!(alpha > beta)) return { valid: false, message: 'Alpha must be larger than beta: alpha is the fast (distribution) phase and beta the slow (elimination) phase.' };
  const k21 = (a * beta + b * alpha) / (a + b);
  const k10 = (alpha * beta) / k21;
  const k12 = alpha + beta - k21 - k10;
  if (!(k21 > 0) || !(k10 > 0) || k12 < 0 || ![k21, k10, k12].every(Number.isFinite)) return { valid: false, message: `These constants give a negative or undefined micro-constant (k12 ${sig(k12)}), so they do not describe a two-compartment model.` };
  const vc = dose / (a + b);
  const auc = a / alpha + b / beta;
  const cl = dose / auc;
  const vss = vc * (1 + k12 / k21);
  const vbeta = cl / beta;
  const vals = [vc, auc, cl, vss, vbeta];
  if (!vals.every(Number.isFinite)) return { valid: false, message: 'These inputs give no finite result.' };
  const agree = sig(cl) === sig(k10 * vc);
  return {
    valid: true, k21: sig(k21), k10: sig(k10), k12: sig(k12), vc: sig(vc), auc: sig(auc), cl: sig(cl), vss: sig(vss), vbeta: sig(vbeta),
    halfLifeAlpha: sig(Math.LN2 / alpha), halfLifeBeta: sig(Math.LN2 / beta), abnormal: false,
    band: `CL ${sig(cl)}, Vc ${sig(vc)}, Vss ${sig(vss)}, terminal half-life ${sig(Math.LN2 / beta)}.`,
    bandLabel: `CL ${sig(cl)}`,
    notes: [
      `Micro-constants: k21 = (A beta + B alpha) / (A + B) = ${sig(k21)}; k10 = alpha beta / k21 = ${sig(k10)}; k12 = alpha + beta - k21 - k10 = ${sig(k12)} (per time unit of alpha and beta).`,
      `Vc = Dose / (A + B) = ${sig(vc)}; AUC = A/alpha + B/beta = ${sig(auc)}; CL = Dose / AUC = ${sig(cl)}.`,
      `Vss = Vc (1 + k12/k21) = ${sig(vss)}; Vbeta = CL / beta = ${sig(vbeta)}.`,
      `Half-lives: distribution ln 2 / alpha = ${sig(Math.LN2 / alpha)}, terminal ln 2 / beta = ${sig(Math.LN2 / beta)}.`,
      agree ? `Check: CL equals k10 x Vc (${sig(k10 * vc)}) to four significant figures.` : `Check failed: CL ${sig(cl)} and k10 x Vc ${sig(k10 * vc)} differ.`,
    ],
    note: 'Units follow the inputs: dose in mg and A, B in mg/L give volumes in L; alpha and beta per hour give CL in L/h. The parameters are only as good as the fit they come from.',
  };
}
