// spec-v136 2.2: QUICKI (Katz A, et al, J Clin Endocrinol Metab 2000;85:2402).
// QUICKI = 1 / [log10(fasting insulin uU/mL) + log10(fasting glucose mg/dL)].
// Tests pin the worked value, the lower-is-less-sensitive direction, the
// log-domain divide-by-zero guard, and the positivity guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quicki } from '../../lib/endo-v136.js';

test('worked example: insulin 12, glucose 100 -> QUICKI 0.3248', () => {
  const r = quicki({ insulin: 12, glucose: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.value, 0.3248); // 1/(log10(12)+log10(100))
});

test('lower QUICKI = lower sensitivity (higher insulin/glucose lowers it)', () => {
  const healthy = quicki({ insulin: 5, glucose: 85 }).value;
  const resistant = quicki({ insulin: 25, glucose: 140 }).value;
  assert.ok(resistant < healthy);
});

test('divide-by-zero guard: log10(insulin)+log10(glucose) == 0 surfaces fallback', () => {
  // insulin 0.01 * glucose 100 = 1 -> log10 sum = 0 -> reciprocal is Infinity.
  const r = quicki({ insulin: 0.01, glucose: 100 });
  assert.equal(r.valid, false);
});

test('zero / negative / blank inputs surface the fallback (no log leak)', () => {
  assert.equal(quicki({ insulin: 0, glucose: 100 }).valid, false);
  assert.equal(quicki({ insulin: 12, glucose: 0 }).valid, false);
  assert.equal(quicki({ insulin: -3, glucose: 100 }).valid, false);
  assert.equal(quicki({}).valid, false);
  assert.equal(quicki({ glucose: 100 }).valid, false);
});
