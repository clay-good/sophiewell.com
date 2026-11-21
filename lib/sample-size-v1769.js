// spec-v1769 (public-health-epidemiology tools 10 and 11): sample sizes for proportions, from the WHO manual.
//
// Source: Lwanga SK, Lemeshow S. Sample size determination in health studies: a practical manual. World Health
// Organization, Geneva, 1991 (ISBN 92 4 154405 8; WHO IRIS 10665/40062), read November 21, 2026.
//   One sample, absolute precision (Table 1):  n = z²(1−α/2) · P(1 − P) / d²
//   One sample, relative precision (Table 2):  n = z²(1−α/2) · (1 − P) / (ε² · P)
//   Two samples, the difference with absolute precision (Table 4): n = z²(1−α/2) · [P1(1 − P1) + P2(1 − P2)] / d²
//   Two samples, hypothesis test (Table 5, page 36), per group:
//     n = {z(1−α) √[2P̄(1 − P̄)] + z(1−β) √[P1(1 − P1) + P2(1 − P2)]}² / (P1 − P2)²,  P̄ = (P1 + P2)/2,
//     with z(1−α/2) in place of z(1−α) for a two-sided test.
// Rounding is the manual's own: Tables 1 and 2 print the nearest whole number (Example 2: 96.04 prints 96),
// Tables 4 and 5 round up (Example 11: 152.27 prints 153). A design effect multiplies the result (Example 2: a
// cluster design effect of 2 makes 96 into 192), rounded up here. The manual covers proportions only
// ("Continuous response variables are not considered in this manual") and gives no finite-population correction
// or non-response allowance, so none is applied. Its small-proportion (arcsine) tables for proportions under 5%
// are not computed; the answer says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { gammaP } from './gamma-quantile.js';

export const CONFIDENCE_OPTIONS = [
  { value: '90', text: '90%' },
  { value: '95', text: '95%' },
  { value: '99', text: '99%' },
];
export const PRECISION_MODES = [
  { value: 'absolute', text: 'Absolute precision (percentage points)' },
  { value: 'relative', text: 'Relative precision (a percentage of the proportion)' },
];
export const TWO_GROUP_MODES = [
  { value: 'test', text: 'Test whether the two proportions differ' },
  { value: 'difference', text: 'Estimate the difference to a set precision' },
];
export const SIDES = [
  { value: 'one', text: 'One-sided' },
  { value: 'two', text: 'Two-sided' },
];

const normalCdf = (z) => 0.5 * (1 + Math.sign(z) * gammaP(0.5, (z * z) / 2));

// zQuantile(p) -> the standard normal z with P(Z <= z) = p, by bisection; null outside 0 < p < 1.
export function zQuantile(p) {
  if (typeof p !== 'number' || !(p > 0 && p < 1)) return null;
  if (p === 0.5) return 0;
  let lo = -40; let hi = 40;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (normalCdf(mid) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const z6 = (z) => z.toFixed(6);
const frac = (pct) => Number((pct / 100).toPrecision(12));
const whole = (n) => n.toLocaleString('en-US');
const two = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Round up, ignoring floating-point dust: 1.1 × 100 is 110.00000000000001, not 111.
const up = (x) => Math.ceil(x - 1e-9);

// A percentage strictly between 0 and 100.
function openPercent(label, raw, unit) {
  const f = inputFault([[label, raw, null, 100, unit]]);
  if (f) return { message: f };
  const n = Number(String(raw).trim());
  if (n >= 100) return { message: `${label.charAt(0).toUpperCase()}${label.slice(1)} must be greater than 0 and less than 100 ${unit}. Check the value entered.` };
  return { value: n };
}

// The optional design effect: blank is simple random sampling (1).
function designEffect(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') return { value: 1, entered: false };
  const f = inputFault([['the design effect', raw, 1, 100, '']]);
  if (f) return { message: f };
  return { value: Number(String(raw).trim()), entered: true };
}

function deffLines(n, d, unitWord) {
  if (!d.entered) return { final: n, line: 'Design effect 1: simple random sampling (none entered). A cluster or other design needs a larger sample; enter its design effect to multiply the result.' };
  const final = up(n * d.value);
  return { final, line: `Times the design effect of ${d.value}: ${whole(n)} × ${d.value} = ${whole(final)}${unitWord}, rounded up.` };
}

const SCOPE = 'The manual covers proportions only. It gives no finite-population correction and no allowance for non-response, and none is applied here.';

export function sampleSizeProportion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!PRECISION_MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose absolute or relative precision.' };
  const conf = String(o.confidence ?? '').trim();
  if (!CONFIDENCE_OPTIONS.some((c) => c.value === conf)) return { valid: false, message: 'Choose the confidence level (90%, 95% or 99%).' };
  const P = openPercent('the anticipated proportion', o.proportion, '%');
  if (P.message) return { valid: false, message: P.message };
  const prec = mode === 'absolute'
    ? openPercent('the absolute precision', o.precision, 'percentage points')
    : openPercent('the relative precision', o.relativePrecision, '% of the proportion');
  if (prec.message) return { valid: false, message: prec.message };
  const deff = designEffect(o.designEffect);
  if (deff.message) return { valid: false, message: deff.message };

  const z = zQuantile(1 - (1 - Number(conf) / 100) / 2);
  const p = frac(P.value);
  const e = frac(prec.value);
  const raw = mode === 'absolute' ? (z * z * p * (1 - p)) / (e * e) : (z * z * (1 - p)) / (e * e * p);
  const n = Math.round(raw);
  if (!Number.isFinite(raw) || n < 1) {
    return { valid: false, message: `These values ask for fewer than one person (the formula gives ${raw.toPrecision(2)}). Check the precision entered.` };
  }
  const formula = mode === 'absolute'
    ? `n = z² P(1 − P) / d² = ${z6(z)}² × ${p} × ${frac(100 - P.value)} ÷ ${e}² = ${two(raw)}`
    : `n = z² (1 − P) / (ε² P) = ${z6(z)}² × ${frac(100 - P.value)} ÷ (${e}² × ${p}) = ${two(raw)}`;
  const d = deffLines(n, deff, '');
  const within = mode === 'absolute'
    ? `within ${prec.value} percentage points of an anticipated ${P.value}%`
    : `within ${prec.value}% of an anticipated ${P.value}% (that is, ±${Number((P.value * e).toPrecision(6))} percentage points)`;
  const notes = [
    `${formula}, rounded to the nearest whole number as the manual's tables print it: ${whole(n)}. z = ${z6(z)} for ${conf}% confidence.`,
    d.line,
  ];
  if (mode === 'absolute') notes.push('If the proportion is unknown, 50% is the manual\'s "safest" choice: for a given absolute precision it gives the largest sample.');
  return {
    valid: true, n: d.final, nSimple: n, raw: Number(raw.toPrecision(8)), z: Number(z6(z)), abnormal: false,
    band: `Sample size ${whole(d.final)}: to estimate the proportion ${within}, with ${conf}% confidence.`,
    bandLabel: `n = ${whole(d.final)}`,
    notes,
    note: SCOPE,
  };
}

export function sampleSizeTwoGroups(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!TWO_GROUP_MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose a hypothesis test or an estimate of the difference.' };
  const A = openPercent('the first group\'s anticipated proportion', o.p1, '%');
  if (A.message) return { valid: false, message: A.message };
  const B = openPercent('the second group\'s anticipated proportion', o.p2, '%');
  if (B.message) return { valid: false, message: B.message };
  const p1 = frac(A.value);
  const p2 = frac(B.value);
  const V = p1 * (1 - p1) + p2 * (1 - p2);

  let raw; let formula; let what; let zText;
  if (mode === 'test') {
    if (A.value === B.value) return { valid: false, message: 'The two proportions are the same; a test needs the difference it should detect. Check the values entered.' };
    const sides = String(o.sides ?? '').trim();
    if (!SIDES.some((s) => s.value === sides)) return { valid: false, message: 'Choose a one-sided or a two-sided test.' };
    const f = inputFault([['the significance level', o.alpha, null, 20, '%'], ['the power', o.power, 50, 99, '%']]);
    if (f) return { valid: false, message: f };
    const alpha = Number(String(o.alpha).trim());
    const power = Number(String(o.power).trim());
    const za = zQuantile(sides === 'one' ? 1 - alpha / 100 : 1 - alpha / 200);
    const zb = zQuantile(power / 100);
    const pbar = (p1 + p2) / 2;
    raw = (za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(V)) ** 2 / (p1 - p2) ** 2;
    formula = `n = {z(1−α${sides === 'two' ? '/2' : ''}) √[2P̄(1 − P̄)] + z(1−β) √[P1(1 − P1) + P2(1 − P2)]}² / (P1 − P2)² = {${z6(za)} × √(2 × ${Number(pbar.toPrecision(12))} × ${Number((1 - pbar).toPrecision(12))}) + ${z6(zb)} × √${Number(V.toPrecision(12))}}² ÷ ${Number(Math.abs(p1 - p2).toPrecision(12))}² = ${two(raw)}`;
    what = `to detect ${A.value}% against ${B.value}% with a ${sides}-sided test at ${alpha}% significance and ${power}% power`;
    zText = `z(1−α${sides === 'two' ? '/2' : ''}) = ${z6(za)} for ${alpha}% ${sides}-sided; z(1−β) = ${z6(zb)} for ${power}% power.`;
  } else {
    const conf = String(o.confidence ?? '').trim();
    if (!CONFIDENCE_OPTIONS.some((c) => c.value === conf)) return { valid: false, message: 'Choose the confidence level (90%, 95% or 99%).' };
    const D = openPercent('the absolute precision', o.precision, 'percentage points');
    if (D.message) return { valid: false, message: D.message };
    const z = zQuantile(1 - (1 - Number(conf) / 100) / 2);
    const d = frac(D.value);
    raw = (z * z * V) / (d * d);
    formula = `n = z² [P1(1 − P1) + P2(1 − P2)] / d² = ${z6(z)}² × ${Number(V.toPrecision(12))} ÷ ${d}² = ${two(raw)}`;
    what = `to estimate the difference between ${A.value}% and ${B.value}% within ${D.value} percentage points, with ${conf}% confidence`;
    zText = `z = ${z6(z)} for ${conf}% confidence.`;
  }
  const deff = designEffect(o.designEffect);
  if (deff.message) return { valid: false, message: deff.message };
  const n = up(raw);
  if (!Number.isFinite(raw) || n < 1) return { valid: false, message: 'These values give no sample size. Check the values entered.' };
  const dl = deffLines(n, deff, ' per group');
  const notes = [
    `${formula}, rounded up as the manual's tables print it: ${whole(n)} per group. ${zText}`,
    dl.line,
  ];
  if (mode === 'test') notes.push('The variance terms are the ones the manual prints: pooled, 2P̄(1 − P̄) with P̄ = (P1 + P2)/2, under the hypothesis of no difference; unpooled, P1(1 − P1) + P2(1 − P2), under the alternative.');
  if (A.value < 5 || B.value < 5) notes.push('A proportion is under 5%: for very small proportions the manual gives a different (arcsine) formula and tables, which this page does not compute. The answer above is the formula for proportions of 5% or more.');
  notes.push('Two groups of equal size; the manual gives no formula for unequal groups.');
  return {
    valid: true, nPerGroup: dl.final, total: 2 * dl.final, nSimple: n, raw: Number(raw.toPrecision(8)), abnormal: false,
    band: `${whole(dl.final)} per group, ${whole(2 * dl.final)} in all: ${what}.`,
    bandLabel: `${whole(dl.final)} per group`,
    notes,
    note: SCOPE,
  };
}
