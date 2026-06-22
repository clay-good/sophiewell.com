// spec-v140 2.1: Kaiser Neonatal Early-Onset Sepsis Calculator. Maternal/prenatal
// logistic prior combined by Bayes with the exam likelihood ratio -> posterior
// EOS probability per 1,000. Coefficients re-fetched from the Kaiser EMR FAQ
// (the corrected Puopolo 2011 model); exam LRs 0.41 / 5.0 / 21.2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eosCalculator } from '../../lib/peds-v140.js';

test('example: GA39, 100.4F, ROM18h, GBS+, no abx, well -> 0.62/1,000, enhanced observation', () => {
  const r = eosCalculator({ incidence: '0.5', ga: 39, tempF: 100.4, rom: 18, gbs: 'positive', abx: 'none', exam: 'well' });
  assert.equal(r.valid, true);
  assert.equal(r.priorRisk, 1.5);
  assert.equal(r.posteriorRisk, 0.62);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /enhanced observation/);
});

test('blood-culture band: posterior 1 to under 3/1,000', () => {
  const r = eosCalculator({ incidence: '0.5', ga: 38, tempF: 99, rom: 10, gbs: 'unknown', abx: 'none', exam: 'equivocal' });
  assert.equal(r.posteriorRisk, 1.23);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /blood culture/);
});

test('antibiotics band: clinical illness pushes posterior >= 3/1,000', () => {
  const r = eosCalculator({ incidence: '0.5', ga: 39, tempF: 101.5, rom: 20, gbs: 'positive', abx: 'none', exam: 'equivocal' });
  assert.ok(r.posteriorRisk >= 3);
  assert.match(r.band, /empiric antibiotics/);
});

test('routine care: term, afebrile, GBS-negative, adequate abx, well -> below 1/1,000', () => {
  const r = eosCalculator({ incidence: '0.5', ga: 40, tempF: 98.6, rom: 2, gbs: 'negative', abx: 'tx2', exam: 'well' });
  assert.ok(r.posteriorRisk < 1);
  assert.match(r.band, /routine newborn care/);
});

test('adequate broad-spectrum antibiotics (>=4h) lower the prior vs none', () => {
  const base = { incidence: '0.5', ga: 38, tempF: 100.4, rom: 12, gbs: 'positive', exam: 'well' };
  const none = eosCalculator({ ...base, abx: 'none' });
  const tx2 = eosCalculator({ ...base, abx: 'tx2' });
  assert.ok(tx2.priorRisk < none.priorRisk);
});

test('overflow safety: extreme inputs stay finite, never NaN/Infinity', () => {
  const r = eosCalculator({ incidence: '0.6', ga: 43, tempF: 110, rom: 1e9, gbs: 'unknown', abx: 'none', exam: 'illness' });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.priorRisk));
  assert.ok(Number.isFinite(r.posteriorRisk));
  assert.ok(r.posteriorRisk <= 1000);
});

test('partial / out-of-range inputs -> valid:false', () => {
  assert.equal(eosCalculator({ incidence: '0.5', tempF: 100, rom: 10, gbs: 'negative', abx: 'none', exam: 'well' }).valid, false);
  assert.equal(eosCalculator({ ga: 18, tempF: 100, rom: 10, gbs: 'negative', abx: 'none', exam: 'well' }).valid, false);
  assert.equal(eosCalculator({ ga: 39, tempF: 100, rom: 10, gbs: 'negative', abx: 'none' }).valid, false);
  assert.equal(eosCalculator(0).valid, false);
});
