// spec-v178 §2.1: GNRI. 1.489*alb(g/L) + 41.7*(weight/IBW capped 1); Lorentz IBW.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gnri } from '../../lib/ltcga-v178.js';

test('GNRI low-risk worked example (alb 35, 60 kg, 165 cm, female)', () => {
  const r = gnri({ albuminGL: 35, weightKg: 60, heightCm: 165, sex: 'female' });
  assert.equal(r.valid, true);
  assert.equal(r.value, 93.8); // IBW 59, ratio capped 1; 1.489*35 + 41.7
  assert.match(r.band, /low risk/);
});

test('GNRI ratio capped at 1 when weight exceeds ideal', () => {
  const heavy = gnri({ albuminGL: 35, weightKg: 200, heightCm: 165, sex: 'female' });
  const exact = gnri({ albuminGL: 35, weightKg: 59, heightCm: 165, sex: 'female' });
  assert.equal(heavy.value, exact.value); // both use ratio 1
});

test('GNRI bands at the published edges', () => {
  // major risk < 82
  assert.match(gnri({ albuminGL: 25, weightKg: 40, heightCm: 165, sex: 'female' }).band, /major risk/);
});

test('GNRI guards a non-positive ideal body weight and blanks', () => {
  assert.equal(gnri({ albuminGL: 35, weightKg: 60, heightCm: 60, sex: 'female' }).valid, false);
  assert.equal(gnri({ albuminGL: 35, weightKg: 60, heightCm: 165 }).valid, false);
  assert.equal(gnri({}).valid, false);
});
