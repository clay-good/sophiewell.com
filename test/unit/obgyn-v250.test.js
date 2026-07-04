// spec-v250: worked examples for the obstetric calculators. Formulas / point
// systems spec-v97 verified (Pearl 1933; Robinson & Fleming 1975; Silversides 2018;
// Malinas).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pearlIndex, robinsonCrlDating, carpregII, malinasScore } from '../../lib/obgyn-v250.js';

test('pearl-index: failures per 100 woman-years', () => {
  const r = pearlIndex({ pregnancies: 2, months: 1200 });
  assert.equal(r.score, 2);
});

test('robinson-crl-dating: GA in days', () => {
  const r = robinsonCrlDating({ crl: 30 });
  assert.equal(r.score, 69);
  assert.match(r.band, /9 weeks 6 days/);
});

test('carpreg-ii: > 4 is 41% risk', () => {
  const r = carpregII({ priorEvents: true, nyha: true }); // 3 + 3 = 6
  assert.equal(r.score, 6);
  assert.match(r.band, /41%/);
  assert.equal(r.abnormal, true);
});
test('carpreg-ii: 0-1 is 5% risk', () => {
  const r = carpregII({ noPriorIntervention: true }); // 1
  assert.equal(r.score, 1);
  assert.match(r.band, /5%/);
});

test('malinas-score: >= 6 imminent', () => {
  const r = malinasScore({ parity: 1, duration: 1, contraction: 1, interval: 2, membranes: 1 });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});
test('malinas-score: < 6 transportable', () => {
  const r = malinasScore({ parity: 1, duration: 1 });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});
