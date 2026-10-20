// spec-v1659 tool 7: standardized mortality (or incidence) ratio, observed over expected.
//
// Arithmetic: SMR = observed ÷ expected. With age strata, expected = Σ (reference rate × the stratum's
// person-time), the indirect standardization the NHSN SIR guide (March 2024) calls "similar to the method
// used to calculate the Standardized Mortality Ratio". No interval is computed: the exact Poisson limits
// were not read in a source.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// "12000, 0.0015" per line: person-time in the stratum, reference rate per person-time unit.
export function parseStrata(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length === 3) c.shift();
    if (c.length !== 2 || !c.every((x) => /^\d*\.?\d+(e-?\d+)?$/i.test(x))) return { error: `Line ${i + 1} needs the stratum's person-time and the reference rate, such as 12000, 0.0015.` };
    out.push({ pt: Number(c[0]), rate: Number(c[1]) });
  }
  return { strata: out };
}

export function smr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the observed events', o.observed, 0, 1e9, '']]);
  if (f) return { valid: false, message: f };
  const obs = Number(o.observed);
  if (!Number.isInteger(obs)) return { valid: false, message: 'The observed events must be a whole number.' };
  let exp;
  const notes = [];
  if (!blank(o.strata)) {
    const p = parseStrata(o.strata);
    if (p.error) return { valid: false, message: p.error };
    if (!p.strata.length) return { valid: false, message: 'Enter each stratum\'s person-time and reference rate.' };
    exp = p.strata.reduce((s, x) => s + x.pt * x.rate, 0);
    notes.push(`Expected ${r(exp, 2)}: the sum over ${p.strata.length} strata of person-time × reference rate.`);
  } else {
    const g = inputFault([['the expected events', o.expected, null, 1e9, '']]);
    if (g) return { valid: false, message: `${g} Or enter the strata to compute it.` };
    exp = Number(o.expected);
  }
  if (!(exp > 0)) return { valid: false, message: 'The expected count is zero, so there is no ratio. Check the strata.' };
  const v = obs / exp;
  return {
    valid: true, smr: r(v), expected: r(exp, 2), abnormal: v > 1,
    band: `SMR ${r(v)}: ${obs} observed ÷ ${r(exp, 2)} expected; ${v > 1 ? 'more' : v < 1 ? 'fewer' : 'as many'} events than the reference rates predict.`,
    bandLabel: r(v).toFixed(3),
    notes: [...notes, 'Whether the ratio differs from 1 needs its confidence interval, which is not computed here.'],
    note: 'Observed over expected, with the expected count from the reference population\'s rates applied to the study population\'s person-time.',
  };
}
