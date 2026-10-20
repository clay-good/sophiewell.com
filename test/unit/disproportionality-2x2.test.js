// spec-v1634 tool 6: disproportionality statistics from a 2x2 of report counts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disproportionality2x2 as d } from '../../lib/disproportionality-2x2-v1634.js';

test('the two EMA examples', () => {
  const one = d({ a: 5, b: 100, c: 5000, d: 100000 });
  assert.equal(one.ror, 1);
  assert.equal(one.prr, 1);
  assert.equal(one.ic, 0);
  const three = d({ a: 15, b: 100, c: 5000, d: 100000 });
  assert.equal(three.ror, 3);
  // s = sqrt(1/15 + 1/100 + 1/5000 + 1/100000); the interval is ROR / exp(1.96 s) to ROR x exp(1.96 s).
  const s = Math.sqrt(1 / 15 + 1 / 100 + 1 / 5000 + 1 / 100000);
  assert.ok(Math.abs(three.rorLower - 3 / Math.exp(1.96 * s)) < 1e-4);
  assert.ok(Math.abs(three.rorUpper - 3 * Math.exp(1.96 * s)) < 1e-4);
});

test('the information component and its approximate limits', () => {
  const r = d({ a: 15, b: 100, c: 5000, d: 100000 });
  const E = (115 * 5015) / 105115; const ic = Math.log2(15.5 / (E + 0.5));
  assert.ok(Math.abs(r.ic - ic) < 1e-3);
  assert.ok(Math.abs(r.ic025 - (ic - 3.3 / Math.sqrt(15.5) - 2 * 15.5 ** -1.5)) < 1e-3);
  assert.ok(Math.abs(r.ic975 - (ic + 2.4 / Math.sqrt(15.5) - 0.5 * 15.5 ** -1.5)) < 1e-3);
  // a = 0: Norén's exact limits, log2 of the Gamma(0.5, E + 0.5) percentiles. Gamma(0.5, 1) percentiles are half
  // the chi-square(1) percentiles 0.000982 and 5.0239 (the standard table).
  const z = d({ a: 0, b: 10, c: 5, d: 1000 });
  const Ez = (10 * 5) / 1015;
  assert.ok(Math.abs(z.ic025 - Math.log2(0.000982069 / 2 / (Ez + 0.5))) < 1e-3);
  assert.ok(Math.abs(z.ic975 - Math.log2(5.023886 / 2 / (Ez + 0.5))) < 1e-3);
  assert.ok(z.ic025 < z.ic && z.ic < z.ic975);
  assert.match(z.notes.join(' '), /exact limits should be used: the 2\.5th and 97\.5th percentiles/);
});

test('each EudraVigilance criterion is stated separately', () => {
  const all = d({ a: 15, b: 100, c: 5000, d: 100000, monitoring: 'standard', ime: 'yes' });
  assert.deepEqual(all.eudravigilance, { lowerBoundAboveOne: true, caseCountMet: true, ime: true });
  assert.equal(all.abnormal, true);
  assert.match(all.band, /All three EudraVigilance criteria/);
  const four = d({ a: 4, b: 100, c: 50, d: 100000, monitoring: 'standard', ime: 'yes' });
  assert.equal(four.eudravigilance.caseCountMet, false);
  assert.equal(four.abnormal, false);
  assert.equal(d({ a: 4, b: 100, c: 50, d: 100000, monitoring: 'additional', ime: 'yes' }).abnormal, true);
  const unknown = d({ a: 4, b: 100, c: 50, d: 100000 });
  assert.deepEqual(unknown.eudravigilance, { lowerBoundAboveOne: true, caseCountMet: null, ime: null });
  assert.equal(unknown.abnormal, false);
  assert.match(unknown.notes.join(' '), /for the reader to check/);
  assert.equal(d({ a: 5, b: 100, c: 5000, d: 100000, ime: 'yes' }).abnormal, false);
});

test('zero cells', () => {
  const c0 = d({ a: 3, b: 10, c: 0, d: 1000 });
  assert.equal(c0.ror, undefined);
  assert.equal(c0.prr, undefined);
  assert.match(c0.notes.join(' '), /99\.9 by convention/);
  assert.equal(c0.eudravigilance.lowerBoundAboveOne, null);
  assert.equal(d({ a: 3, b: 0, c: 5, d: 1000 }).ror, undefined);
  const a0 = d({ a: 0, b: 10, c: 5, d: 1000 });
  assert.equal(a0.ror, 0);
  assert.equal(a0.rorLower, undefined);
});

test('the Evans screen is not printed', () => {
  const r = d({ a: 2, b: 10, c: 5, d: 1000 });
  assert.match(r.notes.join(' '), /Evans 2001\) is not applied/);
  assert.doesNotMatch(r.notes.join(' '), /chi-squared (of|=|is) \d/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the reports with the drug and the event/);
  assert.match(d({ a: 1, b: 1, c: 1 }).message, /^Enter .*\(d\)/);
  assert.match(d({ a: 1.5, b: 1, c: 1, d: 1 }).message, /whole number/);
  assert.equal(d({ a: -1, b: 1, c: 1, d: 1 }).valid, false);
  assert.match(d({ a: 0, b: 0, c: 1, d: 1 }).message, /^Enter the reports for the drug/);
  assert.match(d({ a: 1, b: 1, c: 0, d: 0 }).message, /^Enter the reports for the other drugs/);
  assert.match(d({ a: 1, b: 1, c: 1, d: 1, ime: 'maybe' }).message, /^Choose/);
  assert.equal(d(null).valid, false);
});
