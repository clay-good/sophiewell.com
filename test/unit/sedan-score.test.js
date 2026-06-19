// spec-v117 2.5: SEDAN score (Strbian 2012). Glucose (<=8.0/8.1-12.0/>12.0
// mmol/L = 0/+1/+2), early infarct (+1), dense artery (+1), age >75 (+1), NIHSS
// >=10 (+1); total 0-6. sICH verbatim: 1.4/2.9/8.5/12.2/21.7/33.3% at 0-5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sedanScore } from '../../lib/neuro-v117.js';

test('worked max: high glucose, early infarct, dense artery, age 80, NIHSS 12 -> 6/6, sICH ~33.3%', () => {
  const r = sedanScore({ glucose: 'high', early: true, dense: true, age: 80, nihss: 12 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 6);
  assert.equal(r.sich, '33.3%');
  assert.equal(r.abnormal, true);
});

test('worked min: normal glucose, no signs, age 60, NIHSS 5 -> 0/6, sICH ~1.4%', () => {
  const r = sedanScore({ glucose: 'low', age: 60, nihss: 5 });
  assert.equal(r.total, 0);
  assert.equal(r.sich, '1.4%');
  assert.equal(r.abnormal, false);
});

test('mid case: mid glucose (+1), NIHSS 10 (+1) -> 2/6, sICH ~8.5%', () => {
  const r = sedanScore({ glucose: 'mid', age: 60, nihss: 10 });
  assert.equal(r.total, 2);
  assert.equal(r.sich, '8.5%');
});

test('age and NIHSS boundaries: age 75 scores 0, age 76 scores +1; NIHSS 9 vs 10', () => {
  assert.equal(sedanScore({ glucose: 'low', age: 75, nihss: 9 }).total, 0);
  assert.equal(sedanScore({ glucose: 'low', age: 76, nihss: 9 }).total, 1);
  assert.equal(sedanScore({ glucose: 'low', age: 60, nihss: 10 }).total, 1);
});

test('partial inputs render a complete-the-fields fallback', () => {
  const r = sedanScore({ glucose: 'high', early: true });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age and the baseline NIHSS/);
});
