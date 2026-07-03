// spec-v208 2.5: Neonatal Ponderal Index worked examples. PI = [weight(g) /
// length(cm)^3] * 100; normal 2.0-3.0, <2.0 wasting, >3.0 heavy-for-length.
// Formula + bands spec-v97 cross-verified (Miller & Hassanein 1971 + validations).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ponderalIndex as pi } from '../../lib/nutrition-maternal-v208.js';

test('wasted infant (< 2.0) -> asymmetric IUGR (worked example)', () => {
  const r = pi({ weightG: 2200, lengthCm: 50 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1.76); // 2200/125000*100
  assert.equal(r.abnormal, true);
  assert.match(r.band, /wasting/);
});

test('normal proportionality (2.0-3.0)', () => {
  const r = pi({ weightG: 3300, lengthCm: 50 });
  assert.equal(r.score, 2.64);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /normal range/);
});

test('heavy-for-length (> 3.0)', () => {
  const r = pi({ weightG: 4200, lengthCm: 50 });
  assert.equal(r.score, 3.36);
  assert.match(r.band, /heavy-for-length/);
});

test('matches the Rohrer formula exactly', () => {
  const r = pi({ weightG: 3000, lengthCm: 48 });
  const expected = Math.round((3000 / 48 ** 3) * 100 * 100) / 100;
  assert.equal(r.score, expected);
});

test('non-positive length -> complete-the-fields (cube guarded)', () => {
  const r = pi({ weightG: 3000, lengthCm: 0 });
  assert.equal(r.valid, false);
});
